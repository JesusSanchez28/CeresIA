const express = require('express');
const router = express.Router();
const { obtenerPlantas } = require('../controllers/plantasController');

// Definir la ruta GET para el catálogo
router.get('/', obtenerPlantas);

module.exports = router;

