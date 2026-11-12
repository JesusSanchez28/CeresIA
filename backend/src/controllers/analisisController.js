const db = require('../config/db');
const { analizarImagenPlanta } = require('../services/geminiService');
const { obtenerClimaPorCoordenadas } = require('../services/climaService');

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
        // 1. Obtener ubicación real, temperatura y humedad con las coordenadas del dispositivo
        const lat = latitud || 4.8143;
        const lon = longitud || -74.3547;
        const { ubicacion, temperatura, humedad } = await obtenerClimaPorCoordenadas(lat, lon);

        // 2. Gemini identifica la planta/semilla, diagnostica y evalúa si el clima es apto
        const resultadoIA = await analizarImagenPlanta(imagen_base64, mime_type || 'image/jpeg', temperatura, humedad);

        // 3. Buscar si la planta identificada ya existe en la tabla planta_semilla
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
                        mensaje: `¡Identificado: ${resultadoIA.nombre_comun} (${resultadoIA.nombre_cientifico})!`,
                        planta: resultadoIA.nombre_comun,
                        diagnostico: resultadoIA.diagnostico,
                        clima: { ubicacion, temperatura, humedad, es_apto: Boolean(es_apto) }
                    });
                });
            };

            // Si ya existe en el catálogo, usamos su ID; si no, la insertamos automáticamente
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
        ORDER BY ac.fecha DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el historial:', err);
            return res.status(500).json({ error: 'Error al consultar el historial' });
        }
        res.json(results);
    });
};

module.exports = { registrarAnalisis, obtenerHistorial };