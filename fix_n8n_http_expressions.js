const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolsearch') {
        node.parameters.url = `={{ "${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible" + ($json.location ? "&location=ilike.*" + encodeURIComponent($json.location) + "*" : "") + ($json.max_price ? "&price=lte." + $json.max_price : "") }}`;
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
        node.parameters.jsonBody = `={{ JSON.stringify({
      "property_id": $json.property_id,
      "client_name": $json.client_name,
      "client_phone": $json.client_phone,
      "scheduled_date": $json.scheduled_date,
      "scheduled_time": $json.scheduled_time,
      "status": "agendado"
    }) }}`;
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
console.log('HTTP Tools updated with proper n8n expressions');
