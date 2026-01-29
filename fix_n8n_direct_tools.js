const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

// Eliminar herramientas anteriores
workflow.nodes = workflow.nodes.filter(node => !['prexa_tools', 'toolsearch', 'toolagents', 'toolcreate'].includes(node.id));

const tools = [
    {
        id: "toolsearch",
        name: "buscar_propiedades",
        description: "Busca terrenos y propiedades. Parámetros: location (ej: Lima), max_price (número).",
        url: `={{ "${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible" + ($json.location ? "&location=ilike.*" + encodeURIComponent($json.location) + "*" : "") + ($json.max_price ? "&price=lte." + $json.max_price : "") }}`,
        schema: {
            "type": "object",
            "properties": {
                "location": { "type": "string", "description": "Ciudad o zona" },
                "max_price": { "type": "number", "description": "Precio máximo" }
            }
        }
    },
    {
        id: "toolcreate",
        name: "crear_cita",
        description: "Crea una cita. Requiere: property_id, client_name, client_phone, scheduled_date, scheduled_time.",
        url: `${SUPABASE_URL}/rest/v1/rpc/create_appointment_with_agent`,
        method: "POST",
        body: `={{ JSON.stringify({
      "property_id": $json.property_id,
      "client_name": $json.client_name,
      "client_phone": $json.client_phone,
      "scheduled_date": $json.scheduled_date,
      "scheduled_time": $json.scheduled_time
    }) }}`,
        schema: {
            "type": "object",
            "properties": {
                "property_id": { "type": "string" },
                "client_name": { "type": "string" },
                "client_phone": { "type": "string" },
                "scheduled_date": { "type": "string" },
                "scheduled_time": { "type": "string" }
            },
            "required": ["property_id", "client_name", "client_phone", "scheduled_date", "scheduled_time"]
        }
    }
];

tools.forEach(t => {
    const node = {
        parameters: {
            name: t.name,
            description: t.description,
            method: t.method || "GET",
            url: t.url,
            sendHeaders: true,
            headerParameters: {
                parameters: [
                    { name: "apikey", value: ANON_JWT },
                    { name: "Authorization", value: `Bearer ${ANON_JWT}` }
                ]
            },
            specifyInputSchema: true,
            schemaType: "json",
            inputSchema: JSON.stringify(t.schema)
        },
        type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
        typeVersion: 1,
        position: [3460, t.id === "toolsearch" ? 620 : 760],
        id: t.id,
        name: t.name
    };

    if (t.body) {
        node.parameters.sendBody = true;
        node.parameters.specifyBody = "json";
        node.parameters.jsonBody = t.body;
        node.parameters.headerParameters.parameters.push({ name: "Content-Type", value: "application/json" });
    }

    workflow.nodes.push(node);

    // Conectar al Agente
    if (!workflow.connections[t.id]) workflow.connections[t.id] = {};
    workflow.connections[t.id] = {
        "ai_tool": [[{ "node": "AI Agent", "type": "ai_tool", "index": 0 }]]
    };
});

// Limpiar conexiones viejas de prexa_tools
delete workflow.connections["prexa_tools"];

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with direct HTTP tools (zero-config)');
