const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolsearch') {
        node.parameters.specifyInputSchema = false;
        // Usar placeholders nativos que n8n reconoce para herramientas de IA
        node.parameters.url = `${SUPABASE_URL}/rest/v1/properties?select=id,description,location,price,currency,area&status=ilike.Disponible&location=ilike.*{{location}}*&price=lte.{{max_price}}`;
        node.parameters.description = "Busca propiedades. Parámetros opcionales: location (zona), max_price (precio máximo). Si no se dan, busca todo.";
        // Limpiar el esquema viejo
        delete node.parameters.inputSchema;
        delete node.parameters.schemaType;
    }

    if (node.id === 'toolcreate') {
        node.parameters.specifyInputSchema = false;
        node.parameters.url = `${SUPABASE_URL}/rest/v1/rpc/create_appointment_with_agent`;
        node.parameters.jsonBody = "{\n  \"property_id\": \"{{property_id}}\",\n  \"client_name\": \"{{client_name}}\",\n  \"client_phone\": \"{{client_phone}}\",\n  \"scheduled_date\": \"{{scheduled_date}}\",\n  \"scheduled_time\": \"{{scheduled_time}}\"\n}";
        node.parameters.description = "Crea una cita. Requiere: property_id, client_name, client_phone, scheduled_date, scheduled_time.";
        delete node.parameters.inputSchema;
        delete node.parameters.schemaType;
    }

    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with native placeholders (no schema)');
