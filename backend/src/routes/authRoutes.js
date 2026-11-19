const express = require('express');
const router = express.Router();
const {
    registrarUsuario,
    verificarCorreo,
    reenviarCodigo,
    loginUsuario,
    actualizarPerfil,
    cambiarPassword
} = require('../controllers/authController');

router.post('/register', registrarUsuario);
router.post('/verify', verificarCorreo);
router.post('/resend-code', reenviarCodigo);
router.post('/login', loginUsuario);
router.put('/profile', actualizarPerfil);
router.put('/password', cambiarPassword);

module.exports = router;