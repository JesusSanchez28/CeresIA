const express = require('express');
const router = express.Router();
const { registrarAnalisis, obtenerHistorial } = require('../controllers/analisisController');
const { obtenerClimaPorCoordenadas } = require('../services/climaService');

// GET /api/analisis -> Obtiene la tabla del historial
router.get('/', obtenerHistorial);

// GET /api/analisis/clima?lat=...&lon=... -> Obtiene clima y municipio en vivo
router.get('/clima', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Se requieren latitud y longitud' });
    }
    const datosClima = await obtenerClimaPorCoordenadas(lat, lon);
    res.json(datosClima);
});

// POST /api/analisis -> Registra un nuevo análisis (con IA)
router.post('/', registrarAnalisis);

module.exports = router;