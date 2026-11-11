const db = require('../config/db');
const { analizarImagenPlanta } = require('../services/geminiService');

// 1. Función para registrar el análisis (invocada en POST /api/analisis)
const registrarAnalisis = async (req, res) => {
    const { 
        id_usuario, 
        id_planta_semilla, 
        imagen_base64, 
        mime_type,
        tipo_suelo, 
        temperatura, 
        humedad, 
        es_apto 
    } = req.body;

    try {
        let diagnostico = 'Diagnóstico no disponible.';

        if (imagen_base64) {
            diagnostico = await analizarImagenPlanta(imagen_base64, mime_type || 'image/jpeg');
        }

        const imagen_url = 'imagen_procesada_gemini';

        const query = 'CALL sp_registrar_analisis_completo(?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            id_usuario, 
            id_planta_semilla, 
            imagen_url, 
            diagnostico, 
            tipo_suelo, 
            temperatura, 
            humedad, 
            es_apto
        ];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error al registrar en BD:', err);
                return res.status(500).json({ error: 'Error al registrar el análisis en la base de datos' });
            }
            res.status(201).json({ 
                mensaje: '¡Análisis agroclimático e IA completado exitosamente!',
                diagnostico 
            });
        });
    } catch (error) {
        console.error('Error general en el registro:', error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Función para obtener el historial con JOIN (invocada en GET /api/analisis)
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

// Exportamos ambas funciones juntas al final
module.exports = { 
    registrarAnalisis, 
    obtenerHistorial 
};