const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { enviarCodigoVerificacion } = require('../services/emailService');

const JWT_SECRET = (process.env.JWT_SECRET || 'ceresia_clave_secreta_2026').trim();

const generarCodigoOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Registrar nuevo usuario y enviar código OTP
const registrarUsuario = async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const correoLimpio = correo.trim().toLowerCase();
    const codigoOTP = generarCodigoOTP();

    try {
        db.query('SELECT id_usuario FROM usuario WHERE correo = ?', [correoLimpio], async (err, results) => {
            if (err) {
                console.error('❌ Error SQL en registro:', err);
                return res.status(500).json({ error: 'Error en la base de datos.' });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: 'Este correo ya está registrado.' });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const insertQuery = `
                INSERT INTO usuario (nombre, correo, password, rol, verificado, codigo_verificacion) 
                VALUES (?, ?, ?, ?, 0, ?)
            `;
            db.query(insertQuery, [nombre.trim(), correoLimpio, passwordHash, rol || 'Agricultor', codigoOTP], async (errInsert) => {
                if (errInsert) {
                    console.error('❌ Error SQL al insertar usuario:', errInsert);
                    return res.status(500).json({ error: 'No se pudo crear el usuario.' });
                }

                await enviarCodigoVerificacion(correoLimpio, nombre.trim(), codigoOTP);

                res.status(201).json({
                    requiereVerificacion: true,
                    correo: correoLimpio,
                    mensaje: 'Cuenta creada. Revisa tu correo e ingresa el código de 6 dígitos.'
                });
            });
        });
    } catch (error) {
        console.error('❌ Error interno en registro:', error);
        res.status(500).json({ error: 'Error interno al registrar usuario.' });
    }
};

// 2. Verificar código OTP de 6 dígitos
const verificarCorreo = (req, res) => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        return res.status(400).json({ error: 'Ingresa el correo y el código de verificación.' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    db.query('SELECT * FROM usuario WHERE correo = ?', [correoLimpio], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const usuario = results[0];

        if (usuario.verificado === 1) {
            return res.status(400).json({ error: 'Esta cuenta ya está verificada. Inicia sesión.' });
        }

        if (usuario.codigo_verificacion !== codigo.trim()) {
            return res.status(400).json({ error: 'El código ingresado es incorrecto.' });
        }

        db.query('UPDATE usuario SET verificado = 1, codigo_verificacion = NULL WHERE id_usuario = ?', [usuario.id_usuario], (errUpd) => {
            if (errUpd) return res.status(500).json({ error: 'No se pudo completar la verificación.' });

            const token = jwt.sign(
                { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                mensaje: '✅ ¡Correo verificado exitosamente!',
                token,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol,
                    suelo_preferido: usuario.suelo_preferido || 'Franco arcilloso',
                    verificado: 1
                }
            });
        });
    });
};

// 3. Reenviar código OTP
const reenviarCodigo = (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: 'Correo requerido.' });

    const correoLimpio = correo.trim().toLowerCase();
    const nuevoCodigo = generarCodigoOTP();

    db.query('SELECT id_usuario, nombre FROM usuario WHERE correo = ?', [correoLimpio], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const usuario = results[0];
        db.query('UPDATE usuario SET codigo_verificacion = ? WHERE id_usuario = ?', [nuevoCodigo, usuario.id_usuario], async (errUpd) => {
            if (errUpd) return res.status(500).json({ error: 'No se pudo generar un nuevo código.' });

            await enviarCodigoVerificacion(correoLimpio, usuario.nombre, nuevoCodigo);
            res.json({ mensaje: 'Se ha enviado un nuevo código de verificación a tu correo.' });
        });
    });
};

// 4. Iniciar sesión (bloquea si no está verificado y reenvía código)
const loginUsuario = (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    db.query('SELECT * FROM usuario WHERE correo = ?', [correoLimpio], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        if (results.length === 0) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

        const usuario = results[0];

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

        if (usuario.verificado === 0) {
            const nuevoCodigo = generarCodigoOTP();
            db.query('UPDATE usuario SET codigo_verificacion = ? WHERE id_usuario = ?', [nuevoCodigo, usuario.id_usuario], async () => {
                await enviarCodigoVerificacion(correoLimpio, usuario.nombre, nuevoCodigo);
            });
            return res.status(403).json({
                requiereVerificacion: true,
                correo: correoLimpio,
                error: 'Tu correo aún no está verificado. Te enviamos un nuevo código de 6 dígitos.'
            });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: `¡Bienvenido, ${usuario.nombre}!`,
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
                suelo_preferido: usuario.suelo_preferido || 'Franco arcilloso',
                verificado: 1
            }
        });
    });
};

// 5. Actualizar perfil y preferencias del usuario
const actualizarPerfil = (req, res) => {
    const { id_usuario, nombre, suelo_preferido } = req.body;

    if (!id_usuario || !nombre) {
        return res.status(400).json({ error: 'El nombre y el ID de usuario son obligatorios.' });
    }

    const query = 'UPDATE usuario SET nombre = ?, suelo_preferido = ? WHERE id_usuario = ?';
    db.query(query, [nombre.trim(), suelo_preferido || 'Franco arcilloso', id_usuario], (err) => {
        if (err) {
            console.error('Error al actualizar perfil:', err);
            return res.status(500).json({ error: 'No se pudo actualizar la configuración.' });
        }

        db.query('SELECT id_usuario, nombre, correo, rol, suelo_preferido, verificado FROM usuario WHERE id_usuario = ?', [id_usuario], (errSel, rows) => {
            if (errSel || rows.length === 0) return res.status(500).json({ error: 'Perfil actualizado, recarga la sesión.' });

            res.json({
                mensaje: '✅ Configuración actualizada correctamente.',
                usuario: rows[0]
            });
        });
    });
};

// 6. Cambiar contraseña del usuario
const cambiarPassword = (req, res) => {
    const { id_usuario, passwordActual, passwordNueva } = req.body;

    if (!id_usuario || !passwordActual || !passwordNueva) {
        return res.status(400).json({ error: 'Completa todos los campos de contraseña.' });
    }

    if (passwordNueva.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    db.query('SELECT password FROM usuario WHERE id_usuario = ?', [id_usuario], async (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const coincide = await bcrypt.compare(passwordActual, results[0].password);
        if (!coincide) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        const salt = await bcrypt.genSalt(10);
        const nuevoHash = await bcrypt.hash(passwordNueva, salt);

        db.query('UPDATE usuario SET password = ? WHERE id_usuario = ?', [nuevoHash, id_usuario], (errUpd) => {
            if (errUpd) return res.status(500).json({ error: 'Error al guardar la nueva contraseña.' });
            res.json({ mensaje: '🔒 Contraseña actualizada con éxito.' });
        });
    });
};

module.exports = {
    registrarUsuario,
    verificarCorreo,
    reenviarCodigo,
    loginUsuario,
    actualizarPerfil,
    cambiarPassword
};