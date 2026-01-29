const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
// Usar la llave publishable moderna
const SUPABASE_KEY = 'sb_publishable_R-Is6TvMM0oyLA5rU7ev9g_Vm-fBjUN';

workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolagents', 'toolcreate'].includes(node.id)) {
        // Forzar que las cabeceras se envíen como expresiones para evitar problemas de escape
        node.parameters.headerParameters.parameters = [
            { name: "apikey", value: `={{ "${SUPABASE_KEY}" }}` },
            { name: "Authorization", value: `={{ "Bearer ${SUPABASE_KEY}" }}` }
        ];

        // Si es crear_cita, asegurar Content-Type y Prefer
        if (node.id === 'toolcreate') {
            node.parameters.headerParameters.parameters.push(
                { name: "Content-Type", value: "application/json" },
                { name: "Prefer", value: "return=representation" }
            );
        }
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with modern Supabase key and fixed headers');
