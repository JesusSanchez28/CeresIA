const db = require('../config/db');

const obtenerCatalogoPlantas = (req, res) => {
    const query = `
        SELECT 
            ps.id_planta_semilla,
            ps.nombre_comun,
            ps.nombre_cientifico,
            ps.tipo,
            ps.descripcion,
            COALESCE(
                NULLIF(ps.suelo_ideal, ''),
                (
                    SELECT ac.tipo_suelo
                    FROM analisis_completo ac
                    WHERE ac.id_planta_semilla = ps.id_planta_semilla
                    ORDER BY ac.fecha DESC
                    LIMIT 1
                ),
                'Franco arcilloso'
            ) AS tipo_suelo_ideal,
            COALESCE(ps.temp_min, 14) AS temp_min,
            COALESCE(ps.temp_max, 24) AS temp_max,
            COALESCE(ps.humedad_min, 55) AS humedad_min,
            COALESCE(ps.humedad_max, 80) AS humedad_max,
            COALESCE(
                (
                    SELECT u.nombre
                    FROM analisis_completo ac
                    JOIN usuario u ON ac.id_usuario = u.id_usuario
                    WHERE ac.id_planta_semilla = ps.id_planta_semilla
                    ORDER BY ac.fecha DESC
                    LIMIT 1
                ),
                'Base Agronómica CERES IA'
            ) AS escaneado_por
        FROM planta_semilla ps
        ORDER BY ps.id_planta_semilla DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar catálogo botánico:', err);
            return res.status(500).json({ error: 'Error al consultar el catálogo de plantas.' });
        }
        res.json(results);
    });
};

module.exports = {
    obtenerCatalogoPlantas,
    obtenerPlantas: obtenerCatalogoPlantas,
    listarPlantas: obtenerCatalogoPlantas
};