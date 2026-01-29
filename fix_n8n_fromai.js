const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolsearch') {
        node.parameters.url = `={{ $fromAI('url', 'URL completa con filtros. Base: ${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible. Filtros: &location=ilike.*TEXTO*&price=lte.NUMERO', 'string') }}`;
        node.parameters.headerParameters = {
            parameters: [
                { name: "apikey", value: ANON_JWT },
                { name: "Authorization", value: `Bearer ${ANON_JWT}` }
            ]
        };
    }

    if (node.id === 'toolagents') {
        node.parameters.url = `${SUPABASE_URL}/rest/v1/profiles?select=id,name,email&status=eq.Active&limit=5`;
        node.parameters.headerParameters = {
            parameters: [
                { name: "apikey", value: ANON_JWT },
                { name: "Authorization", value: `Bearer ${ANON_JWT}` }
            ]
        };
    }

    if (node.id === 'toolcreate') {
        node.parameters.url = `${SUPABASE_URL}/rest/v1/rpc/create_appointment_with_agent`;
        node.parameters.method = "POST";
        node.parameters.sendBody = true;
        node.parameters.specifyBody = "json";
        node.parameters.jsonBody = `={{ $fromAI('body', 'JSON con: property_id (UUID), client_name, client_phone, scheduled_date (YYYY-MM-DD), scheduled_time (HH:MM)', 'object') }}`;
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
console.log('Main workflow updated with $fromAI pattern');
