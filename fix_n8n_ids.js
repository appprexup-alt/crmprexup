const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

// Corregir la configuración de los nodos Workflow Tool
workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolagents', 'toolcreate'].includes(node.id)) {
        // En algunas versiones de n8n, pasar el nombre directamente en workflowId funciona mejor
        // si el source está configurado correctamente.
        node.parameters.workflowId = node.parameters.name;
        // Limpiar el campo "Field to Return" para que devuelva todo el JSON
        node.parameters.fieldToReturn = "";
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with simplified Workflow IDs');
