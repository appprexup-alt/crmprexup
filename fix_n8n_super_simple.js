const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

const newSystemMessage = `Fecha y hora actual: {{ $now }}

# ROL
Eres PREXA, asistente virtual inmobiliario de PrexUp. Respondes por WhatsApp a leads interesados en terrenos y propiedades.
SIEMPRE RESPONDE EN ESPAÑOL.

# TONO Y ESTILO
- Profesional pero cercano.
- Respuestas cortas (máximo 3-4 líneas).
- Emojis con moderación.

# HERRAMIENTAS
1. **buscar_propiedades**: Obtiene la lista de propiedades disponibles. No requiere parámetros, te devolverá todo y tú debes filtrar por lo que el cliente pida (ej: Arequipa).
2. **crear_cita**: Agenda una visita. Requiere: property_id, client_name, client_phone, scheduled_date, scheduled_time.

# REGLAS
- SIEMPRE RESPONDE EN ESPAÑOL.
- Si el cliente busca en Lima, dile que por ahora solo tenemos terrenos en Arequipa (Huaranguillo, Sachaca).
- Usa 'buscar_propiedades' para ver qué tenemos.`;

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'aiagent') {
        node.parameters.options.systemMessage = newSystemMessage;
    }

    if (node.id === 'toolsearch') {
        // ELIMINAR TODO LO COMPLEJO
        node.parameters.method = "GET";
        // Apikey en la URL para evitar errores de headers
        node.parameters.url = `${SUPABASE_URL}/rest/v1/properties?apikey=${ANON_JWT}&select=id,description,location,price,currency,area&status=eq.Disponible&limit=20`;
        node.parameters.sendHeaders = false;
        node.parameters.specifyInputSchema = false;
        delete node.parameters.headerParameters;
        delete node.parameters.inputSchema;
        delete node.parameters.schemaType;
        node.parameters.description = "Obtiene la lista de todas las propiedades disponibles.";
    }

    if (node.id === 'toolcreate') {
        node.parameters.method = "POST";
        node.parameters.url = `${SUPABASE_URL}/rest/v1/rpc/create_appointment_with_agent?apikey=${ANON_JWT}`;
        node.parameters.sendHeaders = true;
        node.parameters.headerParameters = {
            parameters: [
                { name: "Content-Type", value: "application/json" }
            ]
        };
        node.parameters.sendBody = true;
        node.parameters.specifyBody = "json";
        // Usar placeholders simples que n8n maneja mejor
        node.parameters.jsonBody = "{\n  \"property_id\": \"{{property_id}}\",\n  \"client_name\": \"{{client_name}}\",\n  \"client_phone\": \"{{client_phone}}\",\n  \"scheduled_date\": \"{{scheduled_date}}\",\n  \"scheduled_time\": \"{{scheduled_time}}\"\n}";
        node.parameters.specifyInputSchema = false;
        node.parameters.description = "Crea una cita. Parámetros: property_id, client_name, client_phone, scheduled_date, scheduled_time.";
    }

    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with "Super-Simple" tools to bypass n8n expression bugs');
