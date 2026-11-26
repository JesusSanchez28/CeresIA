const db = require('../config/db');

const obtenerPlantas = (req, res) => {
    const query = `
        SELECT 
            p.id_planta_semilla,
            p.id_planta_semilla AS id,
            p.nombre_comun,
            p.nombre_comun AS nombreComun,
            p.nombre_cientifico,
            p.nombre_cientifico AS nombreCientifico,
            p.tipo,
            p.descripcion,
            p.temp_min,
            p.temp_max,
            p.humedad_min,
            p.humedad_max,
            p.tipo_suelo_ideal,
            COALESCE(
                (
                    SELECT u.nombre
                    FROM historial_analisis h
                    INNER JOIN usuario u ON h.id_usuario = u.id_usuario
                    WHERE h.id_planta_semilla = p.id_planta_semilla
                    ORDER BY h.fecha_analisis ASC
                    LIMIT 1
                ),
                'Base Agronómica CERES IA'
            ) AS usuario_nombre
        FROM planta_semilla p
        ORDER BY p.id_planta_semilla DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener plantas:', err);
            // Respaldo seguro por si alguna columna opcional difiere en la tabla
            const fallbackQuery = `
                SELECT 
                    p.*,
                    p.id_planta_semilla AS id,
                    p.nombre_comun AS nombreComun,
                    p.nombre_cientifico AS nombreCientifico,
                    'Base Agronómica CERES IA' AS usuario_nombre
                FROM planta_semilla p
                ORDER BY p.id_planta_semilla DESC
            `;
            return db.query(fallbackQuery, (errFallback, rowsFallback) => {
                if (errFallback) {
                    return res.status(500).json({ error: 'Error al consultar el catálogo de plantas' });
                }
                res.json(rowsFallback);
            });
        }
        res.json(results);
    });
};

module.exports = { obtenerPlantas };