-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: ceresia
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
-- ==========================================================
-- BASE DE DATOS COMPLETA: CeresIA
-- Incluye tablas, relaciones, datos base y procedimiento almacenado
-- ==========================================================

CREATE DATABASE IF NOT EXISTS ceresia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ceresia;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Agricultor',
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Catálogo de Plantas y Semillas
CREATE TABLE IF NOT EXISTS planta_semilla (
    id_planta_semilla INT(11) NOT NULL AUTO_INCREMENT,
    nombre_comun VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(150) DEFAULT NULL,
    tipo VARCHAR(50) DEFAULT 'Planta',
    descripcion TEXT DEFAULT NULL,
    PRIMARY KEY (id_planta_semilla)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Análisis Agroclimáticos Completos
CREATE TABLE IF NOT EXISTS analisis_completo (
    id_analisis_completo INT(11) NOT NULL AUTO_INCREMENT,
    id_usuario INT(11) NOT NULL,
    id_planta_semilla INT(11) NOT NULL,
    ubicacion VARCHAR(150) DEFAULT NULL,
    imagen_url VARCHAR(255) DEFAULT NULL,
    resultado_diagnostico TEXT NOT NULL,
    tipo_suelo VARCHAR(100) DEFAULT 'Franco arcilloso',
    temperatura DECIMAL(5,2) DEFAULT NULL,
    humedad DECIMAL(5,2) DEFAULT NULL,
    es_apto TINYINT(1) DEFAULT 1,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_analisis_completo),
    KEY fk_analisis_usuario (id_usuario),
    KEY fk_analisis_planta (id_planta_semilla),
    CONSTRAINT fk_analisis_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_analisis_planta FOREIGN KEY (id_planta_semilla) REFERENCES planta_semilla (id_planta_semilla) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Procedimiento Almacenado para Registrar Análisis Completo
DROP PROCEDURE IF EXISTS sp_registrar_analisis_completo;

DELIMITER //
CREATE PROCEDURE sp_registrar_analisis_completo(
    IN p_id_usuario INT,
    IN p_id_planta_semilla INT,
    IN p_ubicacion VARCHAR(150),
    IN p_imagen_url VARCHAR(255),
    IN p_resultado_diagnostico TEXT,
    IN p_tipo_suelo VARCHAR(100),
    IN p_temperatura DECIMAL(5,2),
    IN p_humedad DECIMAL(5,2),
    IN p_es_apto TINYINT(1)
)
BEGIN
    INSERT INTO analisis_completo (
        id_usuario,
        id_planta_semilla,
        ubicacion,
        imagen_url,
        resultado_diagnostico,
        tipo_suelo,
        temperatura,
        humedad,
        es_apto
    ) VALUES (
        p_id_usuario,
        p_id_planta_semilla,
        p_ubicacion,
        p_imagen_url,
        p_resultado_diagnostico,
        p_tipo_suelo,
        p_temperatura,
        p_humedad,
        p_es_apto
    );
END //
DELIMITER ;

-- 5. Datos iniciales de ejemplo para el catálogo
INSERT IGNORE INTO planta_semilla (id_planta_semilla, nombre_comun, nombre_cientifico, tipo, descripcion) VALUES
(1, 'Papa Pastusa', 'Solanum tuberosum', 'Tubérculo', 'Cultivo andino de clima frío, ideal entre 10°C y 18°C con suelos franco arcillosos.'),
(2, 'Fresa', 'Fragaria × ananassa', 'Frutal', 'Planta rastrera productora de frutos rojos que prospera en climas frescos y húmedos.'),
(3, 'Maíz Amarillo', 'Zea mays', 'Grano', 'Cereal base de alta adaptabilidad térmica y buen drenaje.');