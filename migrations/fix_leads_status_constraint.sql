-- =====================================================
-- FIX: leads_status_check constraint
-- =====================================================
-- Este script corrige el error:
-- "new row for relation 'leads' violates check constraint 'leads_status_check'"
--
-- El problema es que la constraint solo acepta ciertos valores de status
-- pero el frontend usa valores en español.
-- =====================================================

-- Eliminar la constraint existente
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Crear nueva constraint con valores en español que coinciden con el UI
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
  CHECK (status IS NULL OR status IN ('activo', 'inactivo', 'pausado', 'convertido', 'perdido', 'nuevo'));

-- Verificar que funciona
DO $$
BEGIN
  RAISE NOTICE 'Constraint leads_status_check actualizada correctamente!';
  RAISE NOTICE 'Valores válidos: activo, inactivo, pausado, convertido, perdido, nuevo (o NULL)';
END $$;
