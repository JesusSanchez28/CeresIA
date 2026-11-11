const express = require('express');
const router = express.Router();

// Asegúrate de que la ruta apunte correctamente al archivo en controllers:
const { obtenerPlantas } = require('../controllers/plantasController');

router.get('/', obtenerPlantas);

module.exports = router;