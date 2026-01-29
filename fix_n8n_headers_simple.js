const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolcreate'].includes(node.id)) {
        // Simplificar headers al formato más básico de n8n
        node.parameters.headerParameters = {
            parameters: [
                {
                    name: "apikey",
                    value: ANON_JWT
                },
                {
                    name: "Authorization",
                    value: `Bearer ${ANON_JWT}`
                }
            ]
        };

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
console.log('Headers simplified to standard n8n format');
