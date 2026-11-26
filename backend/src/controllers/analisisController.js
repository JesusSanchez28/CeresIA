const db = require('../config/db');
const { analizarImagenPlanta, recomendarCultivosPorClima } = require('../services/geminiService');
const { obtenerClimaPorCoordenadas } = require('../services/climaService');

// Auto-migración limpia sin advertencias de sintaxis en MySQL 8
const columnasCatalogo = [
    { nombre: 'suelo_ideal', definicion: "VARCHAR(100) DEFAULT 'Franco arcilloso'" },
    { nombre: 'temp_min', definicion: 'INT DEFAULT 12' },
    { nombre: 'temp_max', definicion: 'INT DEFAULT 25' },
    { nombre: 'humedad_min', definicion: 'INT DEFAULT 50' },
    { nombre: 'humedad_max', definicion: 'INT DEFAULT 80' }
];

columnasCatalogo.forEach(({ nombre, definicion }) => {
    const checkSql = `
        SELECT COUNT(*) AS existe
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'planta_semilla'
          AND COLUMN_NAME = ?
    `;
    db.query(checkSql, [nombre], (err, rows) => {
        if (!err && rows?.[0]?.existe === 0) {
            db.query(`ALTER TABLE planta_semilla ADD COLUMN ${nombre} ${definicion}`, (alterErr) => {
                if (alterErr) console.warn(`Aviso columna ${nombre}:`, alterErr.message);
            });
        }
    });
});

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
                    tipo_suelo || resultadoIA.suelo_ideal || 'Franco arcilloso',
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
                        suelo_ideal: resultadoIA.suelo_ideal,
                        diagnostico: resultadoIA.diagnostico,
                        clima: { ubicacion, temperatura, humedad, es_apto: Boolean(es_apto) }
                    });
                });
            };

            const sueloIdeal = resultadoIA.suelo_ideal || 'Franco arcilloso';
            const tMin = Number.isFinite(resultadoIA.temp_min) ? resultadoIA.temp_min : 12;
            const tMax = Number.isFinite(resultadoIA.temp_max) ? resultadoIA.temp_max : 25;
            const hMin = Number.isFinite(resultadoIA.humedad_min) ? resultadoIA.humedad_min : 50;
            const hMax = Number.isFinite(resultadoIA.humedad_max) ? resultadoIA.humedad_max : 80;

            if (rows.length > 0) {
                const idExistente = rows[0].id_planta_semilla;
                const updatePlantaQuery = `
                    UPDATE planta_semilla
                    SET descripcion = ?, suelo_ideal = ?, temp_min = ?, temp_max = ?, humedad_min = ?, humedad_max = ?
                    WHERE id_planta_semilla = ?
                `;
                db.query(
                    updatePlantaQuery,
                    [resultadoIA.descripcion, sueloIdeal, tMin, tMax, hMin, hMax, idExistente],
                    () => guardarRegistroCompleto(idExistente)
                );
            } else {
                const insertPlantaQuery = `
                    INSERT INTO planta_semilla
                    (nombre_comun, nombre_cientifico, tipo, descripcion, suelo_ideal, temp_min, temp_max, humedad_min, humedad_max)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(
                    insertPlantaQuery,
                    [
                        resultadoIA.nombre_comun,
                        resultadoIA.nombre_cientifico,
                        resultadoIA.tipo,
                        resultadoIA.descripcion,
                        sueloIdeal,
                        tMin,
                        tMax,
                        hMin,
                        hMax
                    ],
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