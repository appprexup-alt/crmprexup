const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

// Eliminar herramientas HTTP anteriores
workflow.nodes = workflow.nodes.filter(node => !['toolsearch', 'toolcreate', 'prexa_tools'].includes(node.id));

const postgresTools = [
    {
        id: "toolsearch_pg",
        name: "buscar_propiedades",
        description: "Busca propiedades y terrenos. Retorna: id, description, location, price, currency, area. Filtra por location o price si es necesario."
    },
    {
        id: "toolcreate_pg",
        name: "crear_cita",
        description: "Crea una cita en la tabla 'appointments'. Requiere: property_id, client_name, client_phone, scheduled_date, scheduled_time."
    }
];

postgresTools.forEach(t => {
    const node = {
        parameters: {
            name: t.name,
            description: t.description
        },
        type: "@n8n/n8n-nodes-langchain.toolPostgres",
        typeVersion: 1,
        position: [3460, t.id === "toolsearch_pg" ? 620 : 760],
        id: t.id,
        name: t.name,
        credentials: {
            postgres: {
                id: "VyG1bjMeGSJKR4Dx",
                name: "PostgresPrexUp"
            }
        }
    };

    workflow.nodes.push(node);

    // Conectar al Agente
    if (!workflow.connections[t.id]) workflow.connections[t.id] = {};
    workflow.connections[t.id] = {
        "ai_tool": [[{ "node": "AI Agent", "type": "ai_tool", "index": 0 }]]
    };
});

// Actualizar el systemMessage para que la IA sepa que puede usar SQL (el nodo Postgres Tool lo maneja)
workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'aiagent') {
        node.parameters.options.systemMessage = `Fecha y hora actual: {{ $now }}

# ROL
Eres PREXA, asistente virtual inmobiliario de PrexUp. Respondes por WhatsApp a leads interesados en terrenos y propiedades.
SIEMPRE RESPONDE EN ESPAÑOL.

# TONO Y ESTILO
- Profesional pero cercano.
- Respuestas cortas (máximo 3-4 líneas).
- Emojis con moderación.

# HERRAMIENTAS POSTGRES
Tienes acceso directo a la base de datos.
- Tabla 'properties': id, description, location, price, currency, area, status.
- Tabla 'appointments': id, property_id, client_name, client_phone, scheduled_date, scheduled_time.

# REGLAS
- SIEMPRE RESPONDE EN ESPAÑOL.
- Usa 'buscar_propiedades' para consultas.
- Usa 'crear_cita' para agendar visitas.
- Si no hay resultados en una zona, informa que tenemos terrenos en Arequipa (Huaranguillo, Sachaca).`;
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated with native Postgres Tools (No more 401 errors)');
