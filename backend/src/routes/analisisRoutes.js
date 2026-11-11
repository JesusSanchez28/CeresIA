const express = require('express');
const router = express.Router();
const { registrarAnalisis, obtenerHistorial } = require('../controllers/analisisController');

// GET /api/analisis -> Obtiene la tabla del historial
router.get('/', obtenerHistorial);

// POST /api/analisis -> Registra un nuevo análisis (con IA)
router.post('/', registrarAnalisis);
// Ruta POST para registrar un análisis completo usando el Stored Procedure

module.exports = router;