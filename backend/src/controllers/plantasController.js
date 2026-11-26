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
                (
                    SELECT u.nombre
                    FROM analisis_completo ac
                    JOIN usuario u ON ac.id_usuario = u.id_usuario
                    WHERE ac.id_planta_semilla = ps.id_planta_semilla
                    ORDER BY ac.fecha DESC
                    LIMIT 1
                ),
                'Base Agronómica CERES IA'
            ) AS escaneado_por,
            COALESCE(
                (
                    SELECT ac.tipo_suelo
                    FROM analisis_completo ac
                    WHERE ac.id_planta_semilla = ps.id_planta_semilla
                    ORDER BY ac.fecha DESC
                    LIMIT 1
                ),
                'Franco arcilloso'
            ) AS tipo_suelo_ideal,
            (
                SELECT ROUND(MIN(ac.temperatura))
                FROM analisis_completo ac
                WHERE ac.id_planta_semilla = ps.id_planta_semilla
            ) AS temp_min,
            (
                SELECT ROUND(MAX(ac.temperatura))
                FROM analisis_completo ac
                WHERE ac.id_planta_semilla = ps.id_planta_semilla
            ) AS temp_max,
            (
                SELECT ROUND(MIN(ac.humedad))
                FROM analisis_completo ac
                WHERE ac.id_planta_semilla = ps.id_planta_semilla
            ) AS humedad_min,
            (
                SELECT ROUND(MAX(ac.humedad))
                FROM analisis_completo ac
                WHERE ac.id_planta_semilla = ps.id_planta_semilla
            ) AS humedad_max
        FROM planta_semilla ps
        ORDER BY ps.id_planta_semilla DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar catálogo botánico:', err);
            return res.status(500).json({ error: 'Error al consultar el catálogo de plantas.' });
        }

        const plantasFormateadas = results.map((p) => {
            const tMin = p.temp_min !== null ? Number(p.temp_min) : 14;
            const tMax = p.temp_max !== null ? Number(p.temp_max) : 24;
            const hMin = p.humedad_min !== null ? Number(p.humedad_min) : 55;
            const hMax = p.humedad_max !== null ? Number(p.humedad_max) : 80;

            return {
                ...p,
                temp_min: tMin === tMax ? Math.max(5, tMin - 3) : tMin,
                temp_max: tMin === tMax ? tMax + 4 : tMax,
                humedad_min: hMin === hMax ? Math.max(25, hMin - 10) : hMin,
                humedad_max: hMin === hMax ? Math.min(98, hMax + 10) : hMax
            };
        });

        res.json(plantasFormateadas);
    });
};

module.exports = {
    obtenerCatalogoPlantas,
    obtenerPlantas: obtenerCatalogoPlantas,
    listarPlantas: obtenerCatalogoPlantas
};