const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ceresia_clave_secreta_2026';

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos (nombre, correo y contraseña) son obligatorios.' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    try {
        // 1. Verificar si el correo ya existe
        db.query('SELECT id_usuario FROM usuario WHERE correo = ?', [correoLimpio], async (err, results) => {
            if (err) {
                console.error('❌ Error SQL en registro (SELECT):', err.code, err.sqlMessage);
                return res.status(500).json({ error: `Error de base de datos (${err.code}): ${err.sqlMessage || err.message}` });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: 'Este correo ya está registrado.' });
            }

            // 2. Encriptar la contraseña
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // 3. Insertar usuario en MySQL
            const insertQuery = 'INSERT INTO usuario (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [nombre.trim(), correoLimpio, passwordHash, rol || 'Agricultor'], (errInsert, insertRes) => {
                if (errInsert) {
                    console.error('❌ Error SQL al insertar usuario:', errInsert.code, errInsert.sqlMessage);
                    return res.status(500).json({ error: `No se pudo crear el usuario (${errInsert.code}): ${errInsert.sqlMessage || errInsert.message}` });
                }

                const token = jwt.sign(
                    { id_usuario: insertRes.insertId, nombre: nombre.trim(), correo: correoLimpio, rol: rol || 'Agricultor' },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    mensaje: '¡Registro exitoso!',
                    token,
                    usuario: {
                        id_usuario: insertRes.insertId,
                        nombre: nombre.trim(),
                        correo: correoLimpio,
                        rol: rol || 'Agricultor'
                    }
                });
            });
        });
    } catch (error) {
        console.error('❌ Error interno en registro:', error);
        res.status(500).json({ error: 'Error interno al registrar usuario.' });
    }
};

// Iniciar sesión
const loginUsuario = (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    db.query('SELECT * FROM usuario WHERE correo = ?', [correoLimpio], async (err, results) => {
        if (err) {
            console.error('❌ Error SQL en login (SELECT):', err.code, err.sqlMessage);
            return res.status(500).json({ error: `Error de base de datos (${err.code}): ${err.sqlMessage || err.message}` });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

        const usuario = results[0];

        // Verificar contraseña encriptada
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

        // Generar token JWT
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
                rol: usuario.rol
            }
        });
    });
};

module.exports = { registrarUsuario, loginUsuario };