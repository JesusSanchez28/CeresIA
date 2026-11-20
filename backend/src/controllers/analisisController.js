const db = require('../config/db');
const { analizarImagenPlanta, recomendarCultivosPorClima } = require('../services/geminiService');
const { obtenerClimaPorCoordenadas } = require('../services/climaService');

const obtenerClima = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Se requieren latitud y longitud.' });
    }

    try {
        const clima = await obtenerClimaPorCoordenadas(lat, lon);
        res.json(clima);
    } catch (error) {
        console.error('Error al consultar clima:', error);
        res.status(500).json({ error: 'No se pudo obtener el clima para las coordenadas.' });
    }
};

const registrarAnalisis = async (req, res) => {
    const { 
        id_usuario, 
        imagen_base64, 
        mime_type,
        latitud,
        longitud,
        tipo_suelo
    } = req.body;

    if (!imagen_base64) {
        return res.status(400).json({ error: 'Debes adjuntar una fotografía de la planta o semilla.' });
    }

    try {
        const lat = latitud || 4.8143;
        const lon = longitud || -74.3547;
        const { ubicacion, temperatura, humedad } = await obtenerClimaPorCoordenadas(lat, lon);

        const resultadoIA = await analizarImagenPlanta(imagen_base64, mime_type || 'image/jpeg', temperatura, humedad);

        // Si la imagen NO corresponde a material vegetal, avisamos sin guardar en BD
        if (resultadoIA.es_planta === false) {
            return res.status(200).json({
                es_planta: false,
                mensaje: 'No se detectó una planta o semilla en la imagen.',
                diagnostico: resultadoIA.diagnostico
            });
        }

        const buscarPlantaQuery = 'SELECT id_planta_semilla FROM planta_semilla WHERE LOWER(nombre_comun) = LOWER(?) LIMIT 1';
        
        db.query(buscarPlantaQuery, [resultadoIA.nombre_comun], (err, rows) => {
            if (err) {
                console.error('Error al buscar planta:', err);
                return res.status(500).json({ error: 'Error al consultar catálogo de plantas' });
            }

            const guardarRegistroCompleto = (idPlantaFinal) => {
                const es_apto = resultadoIA.es_apto ? 1 : 0;
                const imagen_url = 'imagen_procesada_gemini';

                const spQuery = 'CALL sp_registrar_analisis_completo(?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    id_usuario || 1, 
                    idPlantaFinal, 
                    ubicacion,
                    imagen_url, 
                    resultadoIA.diagnostico, 
                    tipo_suelo || 'Franco arcilloso', 
                    temperatura, 
                    humedad, 
                    es_apto
                ];

                db.query(spQuery, values, (errSp) => {
                    if (errSp) {
                        console.error('Error al ejecutar SP:', errSp);
                        return res.status(500).json({ error: 'Error al guardar el análisis completo' });
                    }
                    res.status(201).json({ 
                        es_planta: true,
                        mensaje: `¡Identificado: ${resultadoIA.nombre_comun} (${resultadoIA.nombre_cientifico})!`,
                        planta: resultadoIA.nombre_comun,
                        nombre_cientifico: resultadoIA.nombre_cientifico,
                        tipo: resultadoIA.tipo,
                        descripcion: resultadoIA.descripcion,
                        diagnostico: resultadoIA.diagnostico,
                        clima: { ubicacion, temperatura, humedad, es_apto: Boolean(es_apto) }
                    });
                });
            };

            if (rows.length > 0) {
                guardarRegistroCompleto(rows[0].id_planta_semilla);
            } else {
                const insertPlantaQuery = 'INSERT INTO planta_semilla (nombre_comun, nombre_cientifico, tipo, descripcion) VALUES (?, ?, ?, ?)';
                db.query(
                    insertPlantaQuery, 
                    [resultadoIA.nombre_comun, resultadoIA.nombre_cientifico, resultadoIA.tipo, resultadoIA.descripcion], 
                    (errInsert, insertResult) => {
                        if (errInsert) {
                            console.error('Error al registrar nueva planta:', errInsert);
                            return res.status(500).json({ error: 'Error al registrar nueva especie identificada' });
                        }
                        guardarRegistroCompleto(insertResult.insertId);
                    }
                );
            }
        });
    } catch (error) {
        console.error('Error general en el registro:', error);
        res.status(500).json({ error: error.message });
    }
};

const obtenerHistorial = (req, res) => {
    const { id_usuario } = req.query;

    if (!id_usuario) {
        return res.status(400).json({ error: 'Se requiere el id_usuario para consultar su historial.' });
    }

    const query = `
        SELECT 
            ac.id_analisis_completo AS id,
            u.nombre AS usuario,
            ps.nombre_comun AS planta,
            ac.ubicacion,
            ac.resultado_diagnostico AS diagnostico,
            ac.tipo_suelo,
            ac.temperatura,
            ac.humedad,
            ac.es_apto,
            ac.fecha
        FROM analisis_completo ac
        JOIN usuario u ON ac.id_usuario = u.id_usuario
        JOIN planta_semilla ps ON ac.id_planta_semilla = ps.id_planta_semilla
        WHERE ac.id_usuario = ?
        ORDER BY ac.fecha DESC
    `;

    db.query(query, [id_usuario], (err, results) => {
        if (err) {
            console.error('Error al obtener historial:', err);
            return res.status(500).json({ error: 'Error al consultar el historial del usuario' });
        }
        res.json(results);
    });
};

const cacheCompatibilidad = new Map();

const obtenerCompatibilidadZona = async (req, res) => {
    const { lat, lon, suelo } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Se requieren latitud y longitud.' });
    }

    const sueloEval = (suelo || 'Franco arcilloso').trim();
    const cacheKey = `${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}_${sueloEval.toLowerCase()}`;
    const cached = cacheCompatibilidad.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 30 * 60 * 1000)) {
        return res.json(cached.data);
    }

    try {
        const clima = await obtenerClimaPorCoordenadas(lat, lon);
        const recomendaciones = await recomendarCultivosPorClima(
            `${clima.ubicacion || `${lat}, ${lon}`} (Suelo: ${sueloEval})`,
            clima.temperatura,
            clima.humedad
        );

        const respuestaFinal = { clima, ...recomendaciones };
        cacheCompatibilidad.set(cacheKey, { timestamp: Date.now(), data: respuestaFinal });

        res.json(respuestaFinal);
    } catch (error) {
        console.error('Error detallado en compatibilidad:', error);
        res.status(500).json({ error: error.message || 'No se pudo generar la recomendación agroclimática.' });
    }
};
const eliminarAnalisis = (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID del análisis.' });
    }

    db.query('DELETE FROM analisis_completo WHERE id_analisis_completo = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar análisis:', err);
            return res.status(500).json({ error: 'No se pudo eliminar el registro de la base de datos.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'El análisis no existe o ya fue eliminado.' });
        }
        res.json({ mensaje: 'Análisis eliminado correctamente.' });
    });
};
module.exports = { 
    obtenerClima,
    registrarAnalisis, 
    obtenerHistorial, 
    obtenerCompatibilidadZona,
    eliminarAnalisis
};