-- Migration: Add phone column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Optional: Add a comment to the column
COMMENT ON COLUMN users.phone IS 'Teléfono de contacto del usuario/agente';
