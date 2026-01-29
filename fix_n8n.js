
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';

const evalNewCode = `const normData = $('Normalizacion').first().json;
const leadResult = $input.first().json;

const containsKeyword = normData.contains_keyword || false;
const chatbotEnabled = leadResult.chatbot_enabled || false;
const leadExists = leadResult.id ? true : false;

// El flujo procede si contiene la palabra clave O si el chatbot ya estaba activo
const shouldProceed = containsKeyword || chatbotEnabled;

return [{
  json: {
    ...normData,
    lead_exists: leadExists,
    existing_lead_id: leadResult.id || null,
    chatbot_was_enabled: chatbotEnabled,
    contains_keyword: containsKeyword,
    activate_chatbot: containsKeyword && !chatbotEnabled,
    should_proceed: shouldProceed
  }
}];`;

const splitNewCode = `const output = $('Prepare Response').first().json.output || '';
const normData = $('Normalizacion').first().json;

if (!output || output.trim() === '') {
  return [
    { 
      json: { 
        response_text: 'Lo siento, hubo un error. ¿Puedes repetir tu mensaje?',
        instance_server_url: normData.instance_server_url,
        instance_name: normData.instance_name,
        instance_apikey: normData.instance_apikey,
        user_number: normData.user_number
      }
    }
  ];
}

const sentences = output.split(/(?<=[.!?])\\s+/).filter(s => s.trim().length > 0);
const chunks = [];
for (let i = 0; i < sentences.length; i += 2) {
  const chunk = sentences.slice(i, i + 2).join(' ').trim();
  if (chunk) chunks.push(chunk);
}

if (chunks.length === 0) {
  chunks.push(output);
}

return chunks.map(text => ({ 
  json: { 
    response_text: text,
    instance_server_url: normData.instance_server_url,
    instance_name: normData.instance_name,
    instance_apikey: normData.instance_apikey,
    user_number: normData.user_number
  } 
}));`;

function escapeForJson(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Reparar Evaluate Access
    // Buscamos el bloque que tiene "id": "evaluateaccess"
    // Dado que el JSON puede estar roto, buscaremos el jsCode anterior a ese ID.
    const evalPattern = /"jsCode":\s*".*?"(?=\s*},\s*"id":\s*"evaluateaccess")/s;
    content = content.replace(evalPattern, `"jsCode": "${escapeForJson(evalNewCode)}"`);

    // Reparar Split Response
    // Buscamos el bloque que tiene "id": "split_response" o similar
    const splitPattern = /"jsCode":\s*".*?"(?=\s*},\s*"type":\s*"n8n-nodes-base\.code".*?"id":\s*"split_response")/s;
    // O simplemente por el nombre del nodo si el ID falló
    const splitPattern2 = /"jsCode":\s*".*?"(?=\s*},\s*"type":\s*"n8n-nodes-base\.code".*?"name":\s*"Split Response")/s;

    let newContent = content.replace(splitPattern, `"jsCode": "${escapeForJson(splitNewCode)}"`);
    if (newContent === content) {
        newContent = content.replace(splitPattern2, `"jsCode": "${escapeForJson(splitNewCode)}"`);
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('File repaired successfully');
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
