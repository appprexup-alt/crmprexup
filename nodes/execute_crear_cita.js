// Nodo: Execute Function - crear_cita
const args = $json.arguments;

// Primero obtener un agente disponible
const getAgentQuery = `SELECT id FROM users WHERE active = true LIMIT 1`;

// Luego crear la cita
const createAppointmentQuery = `
INSERT INTO appointments (
  property_id, 
  agent_id, 
  client_name, 
  client_phone, 
  scheduled_date, 
  scheduled_time, 
  status
)
SELECT 
  '${args.property_id}'::uuid,
  id,
  '${args.client_name.replace(/'/g, "''")}',
  '${args.client_phone}',
  '${args.scheduled_date}'::date,
  '${args.scheduled_time}'::time,
  'agendado'
FROM (${getAgentQuery}) agent
RETURNING 
  id, 
  property_id, 
  agent_id, 
  client_name, 
  client_phone, 
  scheduled_date, 
  scheduled_time, 
  status
`;

return [{
    json: {
        query: createAppointmentQuery,
        function_name: 'crear_cita'
    }
}];
