const express = require('express');
const router = express.Router();
const { 
    obtenerClima,
    registrarAnalisis, 
    obtenerHistorial, 
    obtenerCompatibilidadZona,
    eliminarAnalisis
} = require('../controllers/analisisController');

router.get('/clima', obtenerClima);
router.get('/compatibilidad', obtenerCompatibilidadZona);
router.post('/', registrarAnalisis);
router.get('/', obtenerHistorial);
router.delete('/:id', eliminarAnalisis);

module.exports = router;