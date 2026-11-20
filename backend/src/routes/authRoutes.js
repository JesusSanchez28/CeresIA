const express = require('express');
const router = express.Router();
const {
    registrarUsuario,
    verificarCorreo,
    reenviarCodigo,
    loginUsuario,
    solicitarRecuperacion,
    restablecerPassword,
    actualizarPerfil,
    cambiarPassword,
    loginConGoogle
} = require('../controllers/authController');

router.post('/register', registrarUsuario);
router.post('/verify', verificarCorreo);
router.post('/resend-code', reenviarCodigo);
router.post('/login', loginUsuario);
router.post('/forgot-password', solicitarRecuperacion);
router.post('/reset-password', restablecerPassword);
router.put('/profile', actualizarPerfil);
router.put('/password', cambiarPassword);
router.post('/google', loginConGoogle);
module.exports = router;