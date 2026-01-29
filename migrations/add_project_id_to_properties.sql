-- Add project_id column to properties table
-- Run this in Supabase SQL Editor

-- Add project_id column if it doesn't exist
DO $$ 
BEGIN
    -- Add the column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'project_id'
    ) THEN
        ALTER TABLE properties 
        ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_properties_project_id ON properties(project_id);
    END IF;
END $$;
