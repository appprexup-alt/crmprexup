// Nodo Code: Build Create Appointment Query
const params = $json.parameters;

// Sanitizar inputs
const propertyId = params.property_id;
const clientName = params.client_name.replace(/'/g, "''");
const clientPhone = params.client_phone;
const scheduledDate = params.scheduled_date;
const scheduledTime = params.scheduled_time;

const query = `
WITH available_agent AS (
  SELECT id 
  FROM users 
  WHERE active = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
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
  '${propertyId}'::uuid,
  id,
  '${clientName}',
  '${clientPhone}',
  '${scheduledDate}'::date,
  '${scheduledTime}'::time,
  'agendado'
FROM available_agent
RETURNING 
  id,
  property_id,
  agent_id,
  client_name,
  client_phone,
  scheduled_date::text,
  scheduled_time::text,
  status,
  created_at
`;

return [{
    json: {
        query: query.trim(),
        action_type: 'CREATE_APPOINTMENT',
        user_message: $json.user_message,
        parameters: params
    }
}];
