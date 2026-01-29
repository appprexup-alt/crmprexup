-- Fix RLS policies for properties table
-- Run this in Supabase SQL Editor

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable all access for service role" ON properties;

-- Create policy for authenticated users (allows insert, update, delete, select)
CREATE POLICY "Enable all access for authenticated users" ON properties
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy for service role (for backend operations)
CREATE POLICY "Enable all access for service role" ON properties
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
