const express = require('express');
const router = express.Router();
const { obtenerHistorial } = require('../controllers/analisisController');
const { registrarAnalisis } = require('../controllers/analisisController');

// Ruta POST para registrar un análisis completo usando el Stored Procedure
router.post('/', registrarAnalisis);
router.get('/', obtenerHistorial);
module.exports = router;