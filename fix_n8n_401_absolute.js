const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolcreate'].includes(node.id)) {
        // REFUERZO TOTAL DE HEADERS: valueProvided DEBE ser "fixed"
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
                { name: "Content-Type", value: "application/json", valueProvided: "fixed" }
            );
        }

        // Simplificar URL para evitar errores de expresión complejos
        if (node.id === 'toolsearch') {
            node.parameters.url = `${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible`;
            node.parameters.sendQueryParameters = true;
            node.parameters.specifyQueryParameters = "json";
            node.parameters.jsonQueryParameters = `={{ JSON.stringify({
        "location": $json.location ? "ilike.*" + $json.location + "*" : undefined,
        "price": $json.max_price ? "lte." + $json.max_price : undefined
      }) }}`;
        }
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('CRITICAL FIX: All tool headers forced to valueProvided: fixed');
