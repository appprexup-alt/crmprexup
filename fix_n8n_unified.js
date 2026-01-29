const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const newSystemMessage = `Fecha y hora actual: {{ $now }}

# ROL
Eres PREXA, asistente virtual inmobiliario de PrexUp. Respondes por WhatsApp a leads interesados en terrenos y propiedades.
SIEMPRE RESPONDE EN ESPAÑOL.

# TONO Y ESTILO
- Profesional pero cercano (tutea al cliente).
- Respuestas cortas (máximo 3-4 líneas).
- Emojis con moderación: ✅ 📍 🏠 📅 📞.
- Nunca uses asteriscos ni markdown.
- Cierra con pregunta o llamado a acción.

# HERRAMIENTA UNIFICADA: prexa_tools
Usa esta herramienta para TODO lo relacionado con la base de datos.
**Acciones disponibles**:

1. **buscar_propiedades**:
   - Parámetros: { "action": "buscar_propiedades", "location": "zona" }
   - Muestra: Descripción, Ubicación, Área, Precio e ID.

2. **obtener_agentes**:
   - Parámetros: { "action": "obtener_agentes" }
   - Muestra: Lista de asesores disponibles.

3. **crear_cita**:
   - Parámetros: { "action": "crear_cita", "property_id": "UUID", "client_name": "Nombre", "client_phone": "Teléfono", "scheduled_date": "YYYY-MM-DD", "scheduled_time": "HH:MM" }

# REGLAS CRÍTICAS
- SIEMPRE RESPONDE EN ESPAÑOL.
- NUNCA inventes propiedades.
- Si no hay resultados, dilo honestamente.
- Para agendar necesitas: property_id, nombre, teléfono, fecha y hora.

# RESPUESTAS RÁPIDAS
- "Hola" → "¡Hola! 👋 Soy PREXA de PrexUp. ¿Buscas terrenos o propiedades? Cuéntame qué zona tienes en mente 🏠"`;

// Eliminar herramientas viejas y agregar la nueva unificada
workflow.nodes = workflow.nodes.filter(node => !['toolsearch', 'toolagents', 'toolcreate'].includes(node.id));

const toolNode = {
    "parameters": {
        "name": "prexa_tools",
        "description": "Herramienta unificada para buscar propiedades, agentes y crear citas. Acciones: buscar_propiedades, obtener_agentes, crear_cita.",
        "workflowId": "prexa_tools",
        "specifyInputSchema": true,
        "schemaType": "json",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"action\": {\n      \"type\": \"string\",\n      \"enum\": [\"buscar_propiedades\", \"obtener_agentes\", \"crear_cita\"]\n    },\n    \"location\": { \"type\": \"string\" },\n    \"property_id\": { \"type\": \"string\" },\n    \"client_name\": { \"type\": \"string\" },\n    \"client_phone\": { \"type\": \"string\" },\n    \"scheduled_date\": { \"type\": \"string\" },\n    \"scheduled_time\": { \"type\": \"string\" }\n  },\n  \"required\": [\"action\"]\n}"
    },
    "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
    "typeVersion": 1,
    "position": [3460, 620],
    "id": "prexa_tools",
    "name": "prexa_tools"
};

workflow.nodes.push(toolNode);

// Actualizar el AI Agent
workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'aiagent') {
        node.parameters.options.systemMessage = newSystemMessage;
    }
    return node;
});

// Actualizar conexiones
workflow.connections["prexa_tools"] = {
    "ai_tool": [
        [
            {
                "node": "AI Agent",
                "type": "ai_tool",
                "index": 0
            }
        ]
    ]
};

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with unified prexa_tools');
