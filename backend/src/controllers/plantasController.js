const db = require('../config/db');

const obtenerPlantas = (req, res) => {
    // Usamos ALIAS para mantener la respuesta compatible con React (id, nombreComun, etc.)
    const query = `
        SELECT 
            id_planta_semilla AS id, 
            nombre_comun AS nombreComun, 
            nombre_cientifico AS nombreCientifico, 
            tipo, 
            descripcion 
        FROM planta_semilla
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener plantas:', err);
            return res.status(500).json({ error: 'Error al consultar el catálogo de plantas' });
        }
        res.json(results);
    });
};

module.exports = { obtenerPlantas };