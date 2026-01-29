-- Migration: Add property_type and additional property details fields
-- Run this in Supabase SQL Editor

-- Make project_id nullable if it exists
DO $$ 
BEGIN
    ALTER TABLE properties ALTER COLUMN project_id DROP NOT NULL;
EXCEPTION
    WHEN undefined_column THEN NULL;
    WHEN undefined_table THEN NULL;
END $$;

-- Add property_type column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR(50) DEFAULT 'terreno' CHECK (property_type IN ('terreno', 'casa', 'departamento', 'otro'));
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add bedrooms column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add bathrooms column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add built_area column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS built_area NUMERIC(10, 2);
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add floors column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS floors INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Create comment for documentation
COMMENT ON COLUMN properties.property_type IS 'Tipo de propiedad: terreno, casa, departamento, otro';
COMMENT ON COLUMN properties.bedrooms IS 'Número de habitaciones (solo para casas/departamentos)';
COMMENT ON COLUMN properties.bathrooms IS 'Número de baños completos (solo para casas/departamentos)';
COMMENT ON COLUMN properties.built_area IS 'Área construida en m² (solo para casas/departamentos)';
COMMENT ON COLUMN properties.floors IS 'Número de pisos (solo para casas)';
