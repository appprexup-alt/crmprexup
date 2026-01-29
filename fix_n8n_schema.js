const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolsearch') {
        node.parameters.specifyInputSchema = true;
        node.parameters.schemaType = "json";
        node.parameters.inputSchema = JSON.stringify({
            "type": "object",
            "properties": {
                "location": { "type": "string", "description": "Ciudad o zona de la propiedad (ej: Lima)" },
                "max_price": { "type": "number", "description": "Precio máximo en USD" }
            }
        }, null, 2);

        // URL dinámica usando los valores del esquema ($json)
        node.parameters.url = `={{ "${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible" + ($json.location ? "&location=ilike.*" + encodeURIComponent($json.location) + "*" : "") + ($json.max_price ? "&price=lte." + $json.max_price : "") }}`;

        node.parameters.headerParameters = {
            parameters: [
                { name: "apikey", value: ANON_JWT },
                { name: "Authorization", value: `Bearer ${ANON_JWT}` }
            ]
        };
    }

    if (node.id === 'toolcreate') {
        node.parameters.specifyInputSchema = true;
        node.parameters.schemaType = "json";
        node.parameters.inputSchema = JSON.stringify({
            "type": "object",
            "properties": {
                "property_id": { "type": "string", "description": "UUID de la propiedad" },
                "client_name": { "type": "string", "description": "Nombre completo del cliente" },
                "client_phone": { "type": "string", "description": "Teléfono del cliente" },
                "scheduled_date": { "type": "string", "description": "Fecha de la cita (YYYY-MM-DD)" },
                "scheduled_time": { "type": "string", "description": "Hora de la cita (HH:MM)" }
            },
            "required": ["property_id", "client_name", "client_phone", "scheduled_date", "scheduled_time"]
        }, null, 2);

        node.parameters.url = `${SUPABASE_URL}/rest/v1/rpc/create_appointment_with_agent`;
        node.parameters.method = "POST";
        node.parameters.sendBody = true;
        node.parameters.specifyBody = "json";
        node.parameters.jsonBody = `={{ JSON.stringify({
      "property_id": $json.property_id,
      "client_name": $json.client_name,
      "client_phone": $json.client_phone,
      "scheduled_date": $json.scheduled_date,
      "scheduled_time": $json.scheduled_time
    }) }}`;

        node.parameters.headerParameters = {
            parameters: [
                { name: "apikey", value: ANON_JWT },
                { name: "Authorization", value: `Bearer ${ANON_JWT}` },
                { name: "Content-Type", value: "application/json" }
            ]
        };
    }

    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with Input Schema pattern');
