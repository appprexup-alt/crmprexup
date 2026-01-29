const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'prexa_tools') {
        node.parameters.inputSchema = JSON.stringify({
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["buscar_propiedades", "obtener_agentes", "crear_cita"]
                },
                "location": { "type": "string" },
                "property_id": { "type": "string" },
                "client_name": { "type": "string" },
                "client_phone": { "type": "string" },
                "scheduled_date": { "type": "string" },
                "scheduled_time": { "type": "string" }
            },
            "required": ["action"]
        }); // Sin formateo (una sola línea)
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Input Schema fixed and simplified');
