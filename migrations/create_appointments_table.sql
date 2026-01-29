-- Migration: Create appointments table
-- Run this in Supabase SQL Editor

-- Create appointments table for managing property visits
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'cancelado', 'completado')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON appointments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
