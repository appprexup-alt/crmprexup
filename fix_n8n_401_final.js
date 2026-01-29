const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

workflow.nodes = workflow.nodes.map(node => {
    if (['toolsearch', 'toolcreate'].includes(node.id)) {
        // Forzar que los headers sean fijos y no proveídos por el modelo
        // Usamos la estructura completa que n8n espera para evitar el error 401
        node.parameters.headerParameters = {
            parameters: [
                {
                    name: "apikey",
                    value: ANON_JWT,
                    valueProvided: "fixed"
                },
                {
                    name: "Authorization",
                    value: `Bearer ${ANON_JWT}`,
                    valueProvided: "fixed"
                }
            ]
        };

        if (node.id === 'toolcreate') {
            node.parameters.headerParameters.parameters.push(
                { name: "Content-Type", value: "application/json", valueProvided: "fixed" },
                { name: "Prefer", value: "return=representation", valueProvided: "fixed" }
            );
        }

        // Asegurar que la IA sepa qué parámetros llenar
        node.parameters.specifyInputSchema = true;
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Headers reinforced with valueProvided: fixed to eliminate 401 error');
