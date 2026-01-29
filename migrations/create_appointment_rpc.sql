-- Function: Create appointment with automatic agent assignment
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_appointment_with_agent(
  property_id UUID,
  client_name TEXT,
  client_phone TEXT,
  scheduled_date DATE,
  scheduled_time TIME
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assigned_agent RECORD;
  new_appointment RECORD;
  result JSON;
BEGIN
  -- Get first available agent
  SELECT id, name, email, phone
  INTO assigned_agent
  FROM users
  WHERE active = true
  LIMIT 1;

  -- Check if agent was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No hay agentes disponibles';
  END IF;

  -- Create appointment
  INSERT INTO appointments (
    property_id,
    agent_id,
    client_name,
    client_phone,
    scheduled_date,
    scheduled_time,
    status
  )
  VALUES (
    property_id,
    assigned_agent.id,
    client_name,
    client_phone,
    scheduled_date,
    scheduled_time,
    'agendado'
  )
  RETURNING * INTO new_appointment;

  -- Build result JSON
  result := json_build_object(
    'id', new_appointment.id,
    'property_id', new_appointment.property_id,
    'agent_id', new_appointment.agent_id,
    'agent_name', assigned_agent.name,
    'agent_email', assigned_agent.email,
    'agent_phone', assigned_agent.phone,
    'client_name', new_appointment.client_name,
    'client_phone', new_appointment.client_phone,
    'scheduled_date', new_appointment.scheduled_date,
    'scheduled_time', new_appointment.scheduled_time,
    'status', new_appointment.status,
    'created_at', new_appointment.created_at
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_appointment_with_agent TO anon, authenticated, service_role;

-- Ejemplo de uso:
-- SELECT create_appointment_with_agent(
--   'uuid-de-la-propiedad'::uuid,
--   'Juan Pérez',
--   '51999999999',
--   '2026-01-25'::date,
--   '10:00'::time
-- );
