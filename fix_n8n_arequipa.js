const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');
let workflow = JSON.parse(data);

const SUPABASE_URL = 'https://tlaxqjnaddqwybhcapgb.supabase.co';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYXhxam5hZGRxd3liaGNhcGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDM5NTQsImV4cCI6MjA4MzM3OTk1NH0.Pvrwi6Q5kXwu_lji1Mrelw6pMQ74ajfjapXakbFMUWc';

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

# HERRAMIENTAS DISPONIBLES

## buscar_propiedades
Busca terrenos y propiedades disponibles.
**Parámetros**:
- location: (texto) Ciudad o zona (ej: "Arequipa").
- max_price: (número) Precio máximo en USD.

## crear_cita
Agenda una visita a una propiedad.
**Parámetros**:
- property_id: (UUID) El ID de la propiedad.
- client_name: (texto) Nombre del cliente.
- client_phone: (texto) Teléfono del cliente.
- scheduled_date: (YYYY-MM-DD) Fecha de la cita.
- scheduled_time: (HH:MM) Hora de la cita.

# REGLAS CRÍTICAS
- SIEMPRE RESPONDE EN ESPAÑOL.
- NUNCA inventes propiedades.
- SI NO HAY RESULTADOS en la zona pedida, informa amablemente que por ahora solo tenemos disponibilidad en Arequipa (Huaranguillo, Sachaca).
- Si una herramienta devuelve un error, dile al usuario que no pudiste completar la consulta en ese momento, pero no uses lenguaje técnico.

# RESPUESTAS RÁPIDAS
- "Hola" → "¡Hola! 👋 Soy PREXA de PrexUp. ¿Buscas terrenos o propiedades? Cuéntame qué zona tienes en mente 🏠"`;

workflow.nodes = workflow.nodes.map(node => {
    if (node.id === 'aiagent') {
        node.parameters.options.systemMessage = newSystemMessage;
    }

    if (['toolsearch', 'toolcreate'].includes(node.id)) {
        // Simplificar headers al formato más básico y compatible
        node.parameters.headerParameters = {
            parameters: [
                { name: "apikey", value: ANON_JWT },
                { name: "Authorization", value: `Bearer ${ANON_JWT}` }
            ]
        };

        if (node.id === 'toolcreate') {
            node.parameters.headerParameters.parameters.push(
                { name: "Content-Type", value: "application/json" }
            );
        }
    }
    return node;
});

fs.writeFileSync(path, JSON.stringify(workflow, null, 4));
console.log('Main workflow updated: Spanish prompt, simplified headers, and Arequipa context added');
