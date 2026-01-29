const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'toolagents') {
        // Buscar tanto agentes como admins para asegurar que devuelva algo
        node.parameters.url = `${SUPABASE_URL}/rest/v1/profiles?select=id,name,email&status=eq.Active&limit=5`;
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Agent search updated to be more flexible');
