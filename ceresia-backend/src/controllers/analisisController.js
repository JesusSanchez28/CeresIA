const db = require('../config/db');

// Controlador para registrar un nuevo análisis y su evaluación agroclimática
const registrarAnalisis = (req, res) => {
    const { usuario_id, planta_semilla_id, imagenUrl, resultadoDiagnostico, tipoSuelo, temperatura, humedad, esApto } = req.body;

    // Llamado al Procedimiento Almacenado que creamos en MySQL
    const query = 'CALL sp_registrar_analisis(?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [usuario_id, planta_semilla_id, imagenUrl, resultadoDiagnostico, tipoSuelo, temperatura, humedad, esApto];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al registrar el análisis:', err);
            return res.status(500).json({ error: 'Error al registrar el análisis en la base de datos' });
        }
        res.status(201).json({ mensaje: '¡Análisis registrado exitosamente con su evaluación agroclimática!' });
    });
};

module.exports = {
    registrarAnalisis
};