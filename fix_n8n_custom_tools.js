const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

const tools = [
    {
        id: "toolsearch",
        name: "buscar_propiedades",
        description: "Busca terrenos y propiedades disponibles. Parámetros: location (ej: Lima), min_price, max_price, min_area, max_area.",
        code: `
const { location, min_price, max_price, min_area, max_area } = $nodeInput;
let url = '${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible';
if (location) url += '&location=ilike.*' + encodeURIComponent(location) + '*';
if (min_price) url += '&price=gte.' + min_price;
if (max_price) url += '&price=lte.' + max_price;
if (min_area) url += '&area=gte.' + min_area;
if (max_area) url += '&area=lte.' + max_area;
url += '&limit=5';

const response = await fetch(url, {
  headers: { 'apikey': '${SUPABASE_KEY}', 'Authorization': 'Bearer ${SUPABASE_KEY}' }
});
return await response.json();`
    },
    {
        id: "toolagents",
        name: "obtener_agentes",
        description: "Obtiene lista de agentes disponibles.",
        code: `
const url = '${SUPABASE_URL}/rest/v1/profiles?select=id,name,email&role=eq.Agent&status=eq.Active&limit=5';
const response = await fetch(url, {
  headers: { 'apikey': '${SUPABASE_KEY}', 'Authorization': 'Bearer ${SUPABASE_KEY}' }
});
return await response.json();`
    },
    {
        id: "toolcreate",
        name: "crear_cita",
        description: "Crea una cita. Requiere: property_id, client_name, client_phone, scheduled_date, scheduled_time.",
        code: `
const { property_id, client_name, client_phone, scheduled_date, scheduled_time } = $nodeInput;
// 1. Obtener un agente
const agentRes = await fetch('${SUPABASE_URL}/rest/v1/profiles?select=id&role=eq.Agent&limit=1', {
  headers: { 'apikey': '${SUPABASE_KEY}', 'Authorization': 'Bearer ${SUPABASE_KEY}' }
});
const agents = await agentRes.json();
const agent_id = agents[0]?.id;

// 2. Crear cita
const response = await fetch('${SUPABASE_URL}/rest/v1/appointments', {
  method: 'POST',
  headers: { 
    'apikey': '${SUPABASE_KEY}', 
    'Authorization': 'Bearer ${SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    property_id,
    agent_id,
    client_name,
    client_phone,
    scheduled_date,
    scheduled_time,
    status: 'agendado'
  })
});
return await response.json();`
    }
];

let workflow = JSON.parse(data);
workflow.nodes = workflow.nodes.map(node => {
    const tool = tools.find(t => t.id === node.id);
    if (tool) {
        return {
            parameters: {
                name: tool.name,
                description: tool.description,
                jsCode: tool.code
            },
            type: "@n8n/n8n-nodes-langchain.toolCustomCode",
            typeVersion: 1,
            position: node.position,
            id: node.id,
            name: node.name
        };
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Tools replaced with toolCustomCode successfully');
