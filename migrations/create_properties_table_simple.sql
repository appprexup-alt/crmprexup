-- Versión simplificada - sin dependencia de otras tablas
-- Copia y pega TODO este código en Supabase SQL Editor

-- Eliminar tabla si ya existe (para empezar limpio)
DROP TABLE IF EXISTS properties CASCADE;

-- Crear tabla properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    location VARCHAR(500),
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'PEN')),
    area NUMERIC(10, 2) NOT NULL,
    price_per_m2 NUMERIC(10, 2) GENERATED ALWAYS AS (price / NULLIF(area, 0)) STORED,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'disponible' 
        CHECK (status IN ('disponible', 'vendido', 'separado', 'bloqueado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
CREATE POLICY "Enable read for all" ON properties FOR SELECT USING (true);
CREATE POLICY "Enable all for service role" ON properties FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Crear índices
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);

-- Insertar datos de Residencial Alquimia
INSERT INTO properties (description, location, price, currency, area, status, details) VALUES
('Lote 15 - Manzana B, Frente al Parque', 'parque', 38500.00, 'USD', 180.00, 'disponible', 'Frente directo al parque principal'),
('Lote 22 - Manzana B, Frente al Parque', 'parque', 42000.00, 'USD', 200.00, 'disponible', 'Amplio lote con frente al parque'),
('Lote 23 - Manzana C, Esquina con Vista', 'esquina', 45000.00, 'USD', 220.00, 'disponible', 'Lote en esquina con vista a la campiña'),
('Lote 31 - Manzana D, Esquina Norte', 'esquina', 48000.00, 'USD', 240.00, 'disponible', 'Esquina con excelente ubicación'),
('Lote 08 - Manzana A, Vista Campiña', 'campiña', 35000.00, 'USD', 160.00, 'disponible', 'Vista directa a la campiña arequipeña'),
('Lote 12 - Manzana A, Frente Campiña', 'campiña', 37500.00, 'USD', 175.00, 'disponible', 'Frente directo a la campiña'),
('Lote 42 - Manzana D, Zona Central', 'central', 40000.00, 'USD', 190.00, 'disponible', 'Ubicación céntrica del proyecto'),
('Lote 48 - Manzana E, Central', 'central', 39000.00, 'USD', 185.00, 'disponible', 'Lote central con fácil acceso'),
('Lote 56 - Manzana E, Parque y Vista', 'parque', 44000.00, 'USD', 210.00, 'disponible', 'Frente al parque con vista a la campiña'),
('Lote 67 - Manzana F, Esquina Campiña', 'esquina', 50000.00, 'USD', 250.00, 'disponible', 'Lote premium esquina con vista');

-- Verificar instalación
SELECT 
    COUNT(*) as total_lotes,
    COUNT(CASE WHEN status = 'disponible' THEN 1 END) as disponibles,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo
FROM properties;
