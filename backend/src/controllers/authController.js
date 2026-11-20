const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { enviarCodigoVerificacion } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = (process.env.JWT_SECRET || 'ceresia_clave_secreta_2026').trim();

const generarCodigoOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Registrar nuevo usuario y enviar código OTP
const registrarUsuario = async (req, res) => {
    const { nombre, correo, password, rol, suelo_preferido } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
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
                INSERT INTO usuario (nombre, correo, password, rol, suelo_preferido, verificado, codigo_verificacion) 
                VALUES (?, ?, ?, ?, ?, 0, ?)
            `;
            db.query(
                insertQuery,
                [
                    nombre.trim(),
                    correoLimpio,
                    passwordHash,
                    rol || 'Agricultor',
                    suelo_preferido || 'Franco arcilloso',
                    codigoOTP
                ],
                async (errInsert) => {
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
                }
            );
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
                mensaje: 'Correo verificado exitosamente.',
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

// 4. Iniciar sesión
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
            mensaje: `Bienvenido, ${usuario.nombre}`,
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

// 5. Solicitar recuperación de contraseña (envía OTP al correo)
const solicitarRecuperacion = (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: 'Ingresa tu correo electrónico.' });

    const correoLimpio = correo.trim().toLowerCase();
    const codigoOTP = generarCodigoOTP();

    db.query('SELECT id_usuario, nombre FROM usuario WHERE correo = ?', [correoLimpio], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        if (results.length === 0) {
            return res.status(404).json({ error: 'No existe una cuenta asociada a este correo.' });
        }

        const usuario = results[0];
        db.query('UPDATE usuario SET codigo_verificacion = ? WHERE id_usuario = ?', [codigoOTP, usuario.id_usuario], async (errUpd) => {
            if (errUpd) return res.status(500).json({ error: 'No se pudo procesar la solicitud.' });

            await enviarCodigoVerificacion(correoLimpio, usuario.nombre, codigoOTP);
            res.json({
                mensaje: 'Enviamos un código de recuperación de 6 dígitos a tu correo.'
            });
        });
    });
};

// 6. Restablecer contraseña con código OTP
const restablecerPassword = (req, res) => {
    const { correo, codigo, nuevaPassword } = req.body;

    if (!correo || !codigo || !nuevaPassword) {
        return res.status(400).json({ error: 'Completa todos los campos requeridos.' });
    }

    if (nuevaPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    db.query('SELECT id_usuario, codigo_verificacion FROM usuario WHERE correo = ?', [correoLimpio], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const usuario = results[0];

        if (!usuario.codigo_verificacion || usuario.codigo_verificacion !== codigo.trim()) {
            return res.status(400).json({ error: 'El código de recuperación es incorrecto o ya expiró.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(nuevaPassword, salt);

        db.query(
            'UPDATE usuario SET password = ?, codigo_verificacion = NULL, verificado = 1 WHERE id_usuario = ?',
            [passwordHash, usuario.id_usuario],
            (errUpd) => {
                if (errUpd) return res.status(500).json({ error: 'No se pudo actualizar la contraseña.' });

                res.json({
                    mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.'
                });
            }
        );
    });
};

// 7. Actualizar perfil y preferencias del usuario
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
                mensaje: 'Configuración actualizada correctamente.',
                usuario: rows[0]
            });
        });
    });
};

// 8. Cambiar contraseña desde el perfil
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
            res.json({ mensaje: 'Contraseña actualizada con éxito.' });
        });
    });
};

// 9. Iniciar sesión o registrarse automáticamente con Google OAuth 2.0
const loginConGoogle = async (req, res) => {
    const { credential, rol, suelo_preferido } = req.body;

    if (!credential) {
        return res.status(400).json({ error: 'Token de Google no recibido.' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const correoLimpio = payload.email.trim().toLowerCase();
        const nombreGoogle = payload.name || correoLimpio.split('@')[0];

        db.query('SELECT * FROM usuario WHERE correo = ?', [correoLimpio], async (err, results) => {
            if (err) {
                console.error('Error SQL en Google Auth:', err);
                return res.status(500).json({ error: 'Error en la base de datos.' });
            }

            // Si el usuario ya existe (local o previo con Google), lo marca verificado y entrega JWT
            if (results.length > 0) {
                const usuario = results[0];
                if (usuario.verificado === 0) {
                    db.query('UPDATE usuario SET verificado = 1, codigo_verificacion = NULL WHERE id_usuario = ?', [usuario.id_usuario]);
                }

                const token = jwt.sign(
                    { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return res.json({
                    mensaje: `Bienvenido de nuevo, ${usuario.nombre}`,
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
            }

            // Si es usuario nuevo, crea una contraseña aleatoria segura (no usada para login Google) y registra directo como verificado
            const randomSecret = await bcrypt.hash(`${payload.sub}_${Date.now()}`, 10);
            const rolInicial = rol || 'Agricultor';
            const sueloInicial = suelo_preferido || 'Franco arcilloso';

            const insertQuery = `
                INSERT INTO usuario (nombre, correo, password, rol, suelo_preferido, verificado, codigo_verificacion)
                VALUES (?, ?, ?, ?, ?, 1, NULL)
            `;

            db.query(insertQuery, [nombreGoogle, correoLimpio, randomSecret, rolInicial, sueloInicial], (errIns, insertRes) => {
                if (errIns) {
                    console.error('Error al crear usuario con Google:', errIns);
                    return res.status(500).json({ error: 'No se pudo registrar la cuenta de Google.' });
                }

                const nuevoUsuario = {
                    id_usuario: insertRes.insertId,
                    nombre: nombreGoogle,
                    correo: correoLimpio,
                    rol: rolInicial,
                    suelo_preferido: sueloInicial,
                    verificado: 1
                };

                const token = jwt.sign(
                    { id_usuario: nuevoUsuario.id_usuario, nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo, rol: nuevoUsuario.rol },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return res.status(201).json({
                    mensaje: `Cuenta creada con Google, ${nombreGoogle}`,
                    token,
                    usuario: nuevoUsuario
                });
            });
        });
    } catch (error) {
        console.error('Error verificando token de Google:', error);
        return res.status(401).json({ error: 'No se pudo validar la credencial de Google. Revisa tu GOOGLE_CLIENT_ID.' });
    }
};

module.exports = {
    registrarUsuario,
    verificarCorreo,
    reenviarCodigo,
    loginUsuario,
    solicitarRecuperacion,
    restablecerPassword,
    actualizarPerfil,
    cambiarPassword,
    loginConGoogle
};