// Nodo: Call OpenAI with Functions
const messages = $('Postgres Chat Memory').all().map(m => m.json);
const userMessage = $('Prepare AI Input').first().json.chat_input;

messages.push({
    role: 'user',
    content: userMessage
});

const functions = [
    {
        name: 'buscar_propiedades',
        description: 'Busca terrenos y propiedades disponibles según criterios',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'Ubicación a buscar (ej: Lima, Miraflores, San Isidro)'
                },
                max_price: {
                    type: 'number',
                    description: 'Precio máximo en la moneda especificada'
                },
                currency: {
                    type: 'string',
                    enum: ['USD', 'PEN'],
                    description: 'Moneda del precio'
                },
                min_area: {
                    type: 'number',
                    description: 'Área mínima en metros cuadrados'
                }
            }
        }
    },
    {
        name: 'obtener_agentes',
        description: 'Obtiene lista de agentes/asesores disponibles',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'crear_cita',
        description: 'Crea una cita de visita a una propiedad con asignación automática de agente',
        parameters: {
            type: 'object',
            properties: {
                property_id: {
                    type: 'string',
                    description: 'UUID de la propiedad a visitar'
                },
                client_name: {
                    type: 'string',
                    description: 'Nombre completo del cliente'
                },
                client_phone: {
                    type: 'string',
                    description: 'Teléfono del cliente con código de país (ej: 51999999999)'
                },
                scheduled_date: {
                    type: 'string',
                    description: 'Fecha de la visita en formato YYYY-MM-DD'
                },
                scheduled_time: {
                    type: 'string',
                    description: 'Hora de la visita en formato HH:MM (24 horas)'
                }
            },
            required: ['property_id', 'client_name', 'client_phone', 'scheduled_date', 'scheduled_time']
        }
    }
];

const systemMessage = `Fecha y hora actual: ${new Date().toISOString()}

# ROL
Eres PREXA, asistente virtual inmobiliario de PrexUp. Respondes por WhatsApp a leads interesados en terrenos y propiedades.

# TONO Y ESTILO
- Profesional pero cercano (tutea al cliente)
- Respuestas cortas (máximo 3-4 líneas)
- Emojis con moderación: ✅ 📍 🏠 📅 📞
- Nunca uses asteriscos ni markdown
- Cierra con pregunta o llamado a acción

# FUNCIONES DISPONIBLES

## buscar_propiedades
Busca propiedades según filtros. Úsala cuando el usuario pregunte por terrenos o propiedades.
Parámetros opcionales: location, max_price, currency, min_area

## obtener_agentes
Lista agentes disponibles. Úsala cuando necesites mostrar quién atenderá al cliente.

## crear_cita
Crea una cita. Solo úsala cuando tengas TODOS los datos:
- property_id (pregunta cuál propiedad si no es clara)
- client_name (pide el nombre completo)
- client_phone (usa el número de WhatsApp)
- scheduled_date (formato YYYY-MM-DD)
- scheduled_time (formato HH:MM)

# FLUJO

1. Usuario pregunta por propiedades → Usa buscar_propiedades
2. Muestra resultados (máximo 3)
3. Usuario quiere agendar → Pide datos faltantes
4. Cuando tengas todo → Usa crear_cita
5. Confirma la cita creada

# REGLAS
- NUNCA inventes datos
- SIEMPRE usa las funciones para buscar o crear
- Si falta información, PREGUNTA antes de usar crear_cita
`;

return [{
    json: {
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemMessage },
            ...messages
        ],
        functions: functions,
        function_call: 'auto',
        temperature: 0.7
    }
}];
