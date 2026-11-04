const db = require('../config/db');

// Controlador para obtener todas las plantas y semillas del catálogo
const obtenerPlantas = (req, res) => {
    const query = 'SELECT * FROM PlantaSemilla';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar las plantas:', err);
            return res.status(500).json({ error: 'Error interno del servidor al obtener el catálogo' });
        }
        res.json(results);
    });
};

module.exports = {
    obtenerPlantas
};