const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolsearch') {
        node.parameters.method = "GET";
        node.parameters.url = `${SUPABASE_URL}/rest/v1/properties`;
        node.parameters.sendQueryParameters = true;
        node.parameters.specifyQueryParameters = "json";
        // Usar una expresión limpia para los parámetros de consulta
        node.parameters.jsonQueryParameters = `={{ 
      JSON.stringify({
        "select": "id,description,location,price,currency,area",
        "status": "ilike.Disponible",
        "location": $json.location ? "ilike.*" + $json.location + "*" : undefined,
        "price": $json.max_price ? "lte." + $json.max_price : undefined
      }) 
    }}`;

        node.parameters.headerParameters = {
            parameters: [
                { name: "apikey", value: ANON_JWT },
                { name: "Authorization", value: `Bearer ${ANON_JWT}` }
            ]
        };

        node.parameters.specifyInputSchema = true;
        node.parameters.schemaType = "json";
        node.parameters.inputSchema = JSON.stringify({
            "type": "object",
            "properties": {
                "location": { "type": "string", "description": "Zona o ciudad (ej: Arequipa)" },
                "max_price": { "type": "number", "description": "Precio máximo en USD" }
            }
        });
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Search tool updated with Query Parameters for stability');
