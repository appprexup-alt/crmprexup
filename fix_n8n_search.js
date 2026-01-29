const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');

// Reemplazar todas las ocurrencias de status='disponible' por lower(status)='disponible'
data = data.replace(/status='disponible'/g, "lower(status)='disponible'");
// Reemplazar la instrucción específica en el prompt de la IA
data = data.replace(/WHERE status=disponible/g, "WHERE lower(status)=disponible");

fs.writeFileSync(path, data);
console.log('File updated successfully');
