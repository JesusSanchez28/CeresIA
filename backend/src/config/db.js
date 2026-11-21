require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: (process.env.DB_HOST || '127.0.0.1').trim(),
    user: (process.env.DB_USER || 'root').trim(),
    password: (process.env.DB_PASSWORD || '').trim(),
    database: (process.env.DB_NAME || 'ceresia').trim(),
    port: Number((process.env.DB_PORT || '3306').trim()),
    ssl: (process.env.DB_SSL || '').trim() === 'true' ? { rejectUnauthorized: false } : undefined,
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

    const queriesMigracion = [
        `CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INT(11) NOT NULL AUTO_INCREMENT,
            nombre VARCHAR(100) NOT NULL,
            correo VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'Agricultor',
            verificado TINYINT(1) DEFAULT 0,
            codigo_verificacion VARCHAR(10) DEFAULT NULL,
            suelo_preferido VARCHAR(100) DEFAULT 'Franco arcilloso',
            fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id_usuario)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `ALTER TABLE usuario ADD COLUMN IF NOT EXISTS verificado TINYINT(1) DEFAULT 0;`,
        `ALTER TABLE usuario ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(10) DEFAULT NULL;`,
        `ALTER TABLE usuario ADD COLUMN IF NOT EXISTS suelo_preferido VARCHAR(100) DEFAULT 'Franco arcilloso';`
    ];

    queriesMigracion.forEach((sql) => {
        connection.query(sql, (errQ) => {
            if (errQ && errQ.code !== 'ER_DUP_FIELDNAME') {
                console.warn('⚠️ Aviso migración usuario:', errQ.message);
            }
        });
    });

    connection.release();
});

module.exports = db;