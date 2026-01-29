const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');

// Reemplazar los nodos de herramientas por Workflow Tool que es el más compatible
const tools = [
    { id: "toolsearch", name: "buscar_propiedades" },
    { id: "toolagents", name: "obtener_agentes" },
    { id: "toolcreate", name: "crear_cita" }
];

let workflow = JSON.parse(data);
workflow.nodes = workflow.nodes.map(node => {
    const tool = tools.find(t => t.id === node.id);
    if (tool) {
        return {
            parameters: {
                name: tool.name,
                description: node.parameters.description || "Herramienta del sistema",
                workflowId: {
                    "__rl": true,
                    "value": tool.name,
                    "mode": "name"
                }
            },
            type: "@n8n/n8n-nodes-langchain.toolWorkflow",
            typeVersion: 1,
            position: node.position,
            id: node.id,
            name: node.name
        };
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Tools replaced with toolWorkflow successfully');
