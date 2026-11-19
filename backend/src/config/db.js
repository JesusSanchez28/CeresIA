require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ceresia',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos MySQL:', err.code, err.message);
        return;
    }
    console.log('✅ ¡Conectado exitosamente a la base de datos MySQL de CeresIA!');

    // Garantiza que la tabla usuario exista en cualquier computador nuevo
    const crearTablaUsuario = `
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INT(11) NOT NULL AUTO_INCREMENT,
            nombre VARCHAR(100) NOT NULL,
            correo VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'Agricultor',
            fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id_usuario)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    connection.query(crearTablaUsuario, (errTabla) => {
        connection.release();
        if (errTabla) {
            console.error('⚠️ Error verificando tabla usuario:', errTabla.message);
        }
    });
});

module.exports = db;