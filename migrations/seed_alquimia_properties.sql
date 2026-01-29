-- Migration: Seed properties data for Residencial Alquimia
-- Run this AFTER create_properties_table.sql

-- Insert sample lots for Residencial Alquimia project in Huaranguillo, Sachaca - Arequipa
-- These match the preferences described in the AI agent prompt

-- Lotes frente al parque
INSERT INTO properties (description, location, price, currency, area, status, details) VALUES
('Lote 15 - Manzana B, Frente al Parque', 'parque', 38500.00, 'USD', 180.00, 'disponible', 'Frente directo al parque principal del proyecto Residencial Alquimia. Vista panorámica y acceso privilegiado al área verde.'),
('Lote 22 - Manzana B, Frente al Parque', 'parque', 42000.00, 'USD', 200.00, 'disponible', 'Amplio lote con frente al parque. Ideal para construcción de vivienda familiar.'),

-- Lotes en esquina
('Lote 23 - Manzana C, Esquina con Vista', 'esquina', 45000.00, 'USD', 220.00, 'disponible', 'Lote en esquina estratégica con vista a la campiña arequipeña. Mayor metraje y doble frente.'),
('Lote 31 - Manzana D, Esquina Norte', 'esquina', 48000.00, 'USD', 240.00, 'disponible', 'Esquina con excelente ubicación. Más espacio para diseño arquitectónico flexible.'),

-- Lotes con vista a la campiña
('Lote 08 - Manzana A, Vista Campiña', 'campiña', 35000.00, 'USD', 160.00, 'disponible', 'Vista directa a la campiña arequipeña. Zona tranquila ideal para disfrutar del paisaje natural.'),
('Lote 12 - Manzana A, Frente Campiña', 'campiña', 37500.00, 'USD', 175.00, 'disponible', 'Frente directo a la campiña. Ubicación privilegiada para quienes buscan tranquilidad.'),

-- Lotes en zona central
('Lote 42 - Manzana D, Zona Central', 'central', 40000.00, 'USD', 190.00, 'disponible', 'Ubicación céntrica dentro del Residencial Alquimia. Acceso rápido a todas las áreas del proyecto.'),
('Lote 48 - Manzana E, Central', 'central', 39000.00, 'USD', 185.00, 'disponible', 'Lote central con fácil acceso a vías principales del proyecto.'),

-- Lotes con características mixtas
('Lote 56 - Manzana E, Parque y Vista', 'parque', 44000.00, 'USD', 210.00, 'disponible', 'Frente al parque con vista lateral a la campiña. Lo mejor de ambas ubicaciones.'),
('Lote 67 - Manzana F, Esquina Campiña', 'esquina', 50000.00, 'USD', 250.00, 'disponible', 'Lote en esquina con vista espectacular a la campiña arequipeña. Premium.');

-- Verify the inserted data
SELECT 
    COUNT(*) as total_lotes,
    COUNT(CASE WHEN status = 'disponible' THEN 1 END) as disponibles,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo,
    AVG(area) as area_promedio
FROM properties;
