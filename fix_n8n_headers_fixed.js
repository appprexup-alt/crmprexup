const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolcreate'].includes(node.id)) {
        // Forzar que los headers sean fijos y no proveídos por el modelo
        node.parameters.headerParameters = {
            parameters: [
                {
                    name: "apikey",
                    value: ANON_JWT,
                    valueProvided: "fixed"
                },
                {
                    name: "Authorization",
                    value: `Bearer ${ANON_JWT}`,
                    valueProvided: "fixed"
                }
            ]
        };

        if (node.id === 'toolcreate') {
            node.parameters.headerParameters.parameters.push(
                { name: "Content-Type", value: "application/json", valueProvided: "fixed" },
                { name: "Prefer", value: "return=representation", valueProvided: "fixed" }
            );
        }

        // Usar un esquema de entrada limpio y opcional para evitar errores de "parámetro requerido"
        node.parameters.specifyInputSchema = true;
        node.parameters.schemaType = "json";

        if (node.id === 'toolsearch') {
            node.parameters.inputSchema = JSON.stringify({
                "type": "object",
                "properties": {
                    "location": { "type": "string", "description": "Zona o ciudad" },
                    "max_price": { "type": "number", "description": "Precio máximo" }
                }
            });
            // URL usando $json para máxima compatibilidad
            node.parameters.url = `={{ "${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible" + ($json.location ? "&location=ilike.*" + encodeURIComponent($json.location) + "*" : "") + ($json.max_price ? "&price=lte." + $json.max_price : "") }}`;
        }

        if (node.id === 'toolcreate') {
            node.parameters.inputSchema = JSON.stringify({
                "type": "object",
                "properties": {
                    "property_id": { "type": "string" },
                    "client_name": { "type": "string" },
                    "client_phone": { "type": "string" },
                    "scheduled_date": { "type": "string" },
                    "scheduled_time": { "type": "string" }
                }
            });
            node.parameters.jsonBody = `={{ JSON.stringify({
        "property_id": $json.property_id,
        "client_name": $json.client_name,
        "client_phone": $json.client_phone,
        "scheduled_date": $json.scheduled_date,
        "scheduled_time": $json.scheduled_time
      }) }}`;
        }
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Headers fixed to fixed values and schema optimized');
