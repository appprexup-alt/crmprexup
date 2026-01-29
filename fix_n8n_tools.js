const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');

// Reemplazar el tipo de nodo toolDatabase por toolPostgres que es más específico y compatible
data = data.replace(/@n8n\/n8n-nodes-langchain\.toolDatabase/g, "@n8n/n8n-nodes-langchain.toolPostgres");

fs.writeFileSync(path, data);
console.log('Node types updated to toolPostgres');
