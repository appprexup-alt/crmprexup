const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

// Asegurarse de que los nodos de herramientas NO estén desactivados
workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolagents', 'toolcreate'].includes(node.id)) {
        delete node.disabled;
        node.parameters.workflowId.mode = 'name'; // Asegurar que use el nombre
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow tool nodes enabled and verified');
