const express = require('express');
const router = express.Router();
const { 
    obtenerClima,
    registrarAnalisis, 
    obtenerHistorial, 
    obtenerCompatibilidadZona
} = require('../controllers/analisisController');

router.get('/clima', obtenerClima);
router.get('/compatibilidad', obtenerCompatibilidadZona);
router.post('/', registrarAnalisis);
router.get('/', obtenerHistorial);

module.exports = router;