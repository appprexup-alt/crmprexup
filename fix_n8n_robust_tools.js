const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolsearch') {
        // Usar una expresión más robusta que intente obtener los datos de varias formas comunes en n8n
        node.parameters.url = `={{ 
      (function() {
        const params = $nodeInput || $json || {};
        const location = params.location || "";
        const maxPrice = params.max_price || "";
        let url = "${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible";
        if (location) url += "&location=ilike.*" + encodeURIComponent(location) + "*";
        if (maxPrice) url += "&price=lte." + maxPrice;
        return url;
      })()
    }}`;
        node.parameters.headerParameters.parameters = [
            { name: "apikey", value: SUPABASE_KEY },
            { name: "Authorization", value: `={{ "Bearer ${SUPABASE_KEY}" }}` }
        ];
    }

    if (node.id === 'toolagents') {
        node.parameters.url = `${SUPABASE_URL}/rest/v1/profiles?select=id,name,email&role=eq.Agent&status=eq.Active&limit=5`;
        node.parameters.headerParameters.parameters = [
            { name: "apikey", value: SUPABASE_KEY },
            { name: "Authorization", value: `={{ "Bearer ${SUPABASE_KEY}" }}` }
        ];
    }

    if (node.id === 'toolcreate') {
        node.parameters.url = `${SUPABASE_URL}/rest/v1/appointments`;
        node.parameters.jsonBody = `={{ 
      JSON.stringify({
        "property_id": ($nodeInput.property_id || $json.property_id),
        "client_name": ($nodeInput.client_name || $json.client_name),
        "client_phone": ($nodeInput.client_phone || $json.client_phone),
        "scheduled_date": ($nodeInput.scheduled_date || $json.scheduled_date),
        "scheduled_time": ($nodeInput.scheduled_time || $json.scheduled_time),
        "status": "agendado"
      })
    }}`;
        node.parameters.headerParameters.parameters = [
            { name: "apikey", value: SUPABASE_KEY },
            { name: "Authorization", value: `={{ "Bearer ${SUPABASE_KEY}" }}` },
            { name: "Content-Type", value: "application/json" },
            { name: "Prefer", value: "return=representation" }
        ];
    }

    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('HTTP Tools updated with robust parameter handling');
