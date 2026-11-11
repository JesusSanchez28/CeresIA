const db = require('../config/db');

const registrarAnalisis = (req, res) => {
    const { id_usuario, id_planta_semilla, imagen_url, resultado_diagnostico, tipo_suelo, temperatura, humedad, es_apto } = req.body;

    const query = 'CALL sp_registrar_analisis_completo(?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id_usuario, id_planta_semilla, imagen_url, resultado_diagnostico, tipo_suelo, temperatura, humedad, es_apto];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al registrar el análisis completo:', err);
            return res.status(500).json({ error: 'Error al registrar el análisis en la base de datos' });
        }
        res.status(201).json({ mensaje: '¡Análisis completo registrado exitosamente!' });
    });
};


// Obtener el historial completo de análisis con JOIN
const obtenerHistorial = (req, res) => {
    const query = `
        SELECT 
            ac.id_analisis_completo AS id,
            u.nombre AS usuario,
            ps.nombre_comun AS planta,
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