-- Crear el esquema (schema) pet_care si no existe
CREATE SCHEMA IF NOT EXISTS pet_care;

-- Utilizar el esquema pet_care
USE pet_care;

-- Crear la tabla producto si no existe
CREATE TABLE IF NOT EXISTS producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(50) NOT NULL,
    descripcion_producto VARCHAR(250),
    categoria VARCHAR(50),
    proveedor VARCHAR(50),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(11,2)
);

-- Agregar dos productos de prueba
INSERT INTO producto (nombre_producto, descripcion_producto, categoria, proveedor, cantidad, precio_unitario)
VALUES 
    ('Producto 1', 'Descripción del Producto 1', 'Categoría 1', 'Proveedor 1', 10, 19.99),
    ('Producto 2', 'Descripción del Producto 2', 'Categoría 2', 'Proveedor 2', 20, 29.99);

-- Crear la tabla turno si no existe
    CREATE TABLE IF NOT EXISTS turno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    paciente_nombre VARCHAR(255) NOT NULL,
    especialidad VARCHAR(100),
    estado ENUM('Programado', 'En curso', 'Completado', 'Cancelado') DEFAULT 'Programado',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agregar dos turnos de prueba
INSERT INTO turno (fecha, hora, paciente_nombre, especialidad, estado, notas)
VALUES
    ('2023-12-10', '10:30:00', 'Juan Pérez', 'Cardiología', 'Programado', 'Primera consulta'),
    ('2023-12-15', '15:45:00', 'María López', 'Pediatría', 'En curso', 'Control de rutina');

-- Crear la tabla rol si no existe
CREATE TABLE IF NOT EXISTS rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar roles por defecto
INSERT INTO rol (nombre) VALUES ('admin'), ('user');

-- Crear la tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES rol(id)
);