const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

const tools = [
    {
        id: "toolsearch",
        name: "buscar_propiedades",
        description: "Busca terrenos y propiedades. Parámetros: location (ej: Lima), max_price (número).",
        url: `${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible`
    },
    {
        id: "toolagents",
        name: "obtener_agentes",
        description: "Obtiene lista de agentes disponibles.",
        url: `${SUPABASE_URL}/rest/v1/profiles?select=id,name,email&role=eq.Agent&status=eq.Active&limit=5`
    }
];

workflow.nodes = workflow.nodes.map(node => {
    const tool = tools.find(t => t.id === node.id);
    if (tool) {
        return {
            parameters: {
                name: tool.name,
                description: tool.description,
                method: "GET",
                url: tool.url,
                sendHeaders: true,
                headerParameters: {
                    parameters: [
                        { name: "apikey", value: SUPABASE_KEY },
                        { name: "Authorization", value: `Bearer ${SUPABASE_KEY}` }
                    ]
                }
            },
            type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
            typeVersion: 1,
            position: node.position,
            id: node.id,
            name: node.name
        };
    }

    // Para crear_cita, usaremos un POST
    if (node.id === 'toolcreate') {
        return {
            parameters: {
                name: "crear_cita",
                description: "Crea una cita. Requiere: property_id, client_name, client_phone, scheduled_date, scheduled_time.",
                method: "POST",
                url: `${SUPABASE_URL}/rest/v1/appointments`,
                sendHeaders: true,
                headerParameters: {
                    parameters: [
                        { name: "apikey", value: SUPABASE_KEY },
                        { name: "Authorization", value: `Bearer ${SUPABASE_KEY}` },
                        { name: "Content-Type", value: "application/json" },
                        { name: "Prefer", value: "return=representation" }
                    ]
                },
                sendBody: true,
                specifyBody: "json",
                jsonBody: "{\n  \"property_id\": \"{{ $parameter.property_id }}\",\n  \"client_name\": \"{{ $parameter.client_name }}\",\n  \"client_phone\": \"{{ $parameter.client_phone }}\",\n  \"scheduled_date\": \"{{ $parameter.scheduled_date }}\",\n  \"scheduled_time\": \"{{ $parameter.scheduled_time }}\",\n  \"status\": \"agendado\"\n}"
            },
            type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
            typeVersion: 1,
            position: node.position,
            id: node.id,
            name: node.name
        };
    }

    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Tools replaced with toolHttpRequest successfully');
