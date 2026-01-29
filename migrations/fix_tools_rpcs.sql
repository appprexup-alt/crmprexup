-- Fix RPCs for n8n tools
-- Run this in Supabase SQL Editor

-- 1. Fix assign_random_agent
CREATE OR REPLACE FUNCTION public.assign_random_agent(p_lead_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_agent_id UUID;
  v_agent_name TEXT;
BEGIN
  -- Buscar un agente activo aleatorio
  SELECT id, name INTO v_agent_id, v_agent_name
  FROM profiles
  WHERE (role = 'Agent' OR role = 'advisor') AND status = 'Active'
  ORDER BY RANDOM()
  LIMIT 1;

  IF v_agent_id IS NULL THEN
    RETURN json_build_object('error', 'No active agents found');
  END IF;

  -- Asignar al lead
  UPDATE leads
  SET advisor_id = v_agent_id
  WHERE id = p_lead_id;

  RETURN json_build_object('agent_id', v_agent_id, 'agent_name', v_agent_name);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.assign_random_agent(uuid) TO anon, authenticated, service_role;

-- 2. Fix qualify_and_profile_lead
CREATE OR REPLACE FUNCTION public.qualify_and_profile_lead(p_lead_id uuid, p_budget numeric, p_property_interest text, p_interest text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE leads
  SET 
    status = 'QUALIFIED',
    budget = p_budget,
    property_interest = p_property_interest,
    interest = p_interest
  WHERE id = p_lead_id;

  RETURN json_build_object('status', 'success', 'message', 'Lead qualified and profiled');
END;
$function$;

GRANT EXECUTE ON FUNCTION public.qualify_and_profile_lead(uuid, numeric, text, text) TO anon, authenticated, service_role;

-- 3. Ensure create_appointment_with_agent has correct permissions
GRANT EXECUTE ON FUNCTION public.create_appointment_with_agent(uuid, text, text, date, time) TO anon, authenticated, service_role;
