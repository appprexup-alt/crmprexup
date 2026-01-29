-- Migration: Create properties table for real estate listings
-- Run this in Supabase SQL Editor

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    location VARCHAR(500),
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'PEN')),
    area NUMERIC(10, 2) NOT NULL,
    price_per_m2 NUMERIC(10, 2) GENERATED ALWAYS AS (price / NULLIF(area, 0)) STORED,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'disponible' 
        CHECK (status IN ('disponible', 'vendido', 'separado', 'bloqueado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (allows n8n to access via service account)
CREATE POLICY "Enable all access for authenticated users" ON properties
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for service role (for n8n backend operations)
CREATE POLICY "Enable all access for service role" ON properties
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_project_id ON properties(project_id);
