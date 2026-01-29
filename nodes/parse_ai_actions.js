// Este código va en un nodo Code después del AI Agent
const aiResponse = $json.output || '';

// Detectar si hay una acción
const actionMatch = aiResponse.match(/^ACTION:(\w+)\n(.*?)\n---\n(.*)/s);

if (actionMatch) {
    const actionType = actionMatch[1];
    const params = actionMatch[2];
    const userMessage = actionMatch[3];

    // Parsear parámetros
    const parsedParams = {};

    if (actionType === 'SEARCH_PROPERTIES') {
        const filters = params.replace('FILTERS:', '').split(',');
        filters.forEach(f => {
            const [key, value] = f.split('=');
            parsedParams[key.trim()] = value.trim();
        });
    } else if (actionType === 'CREATE_APPOINTMENT') {
        const data = params.replace('DATA:', '').split(',');
        data.forEach(d => {
            const [key, value] = d.split('=');
            parsedParams[key.trim()] = value.trim();
        });
    }

    return [{
        json: {
            has_action: true,
            action_type: actionType,
            parameters: parsedParams,
            user_message: userMessage.trim(),
            original_response: aiResponse
        }
    }];
}

// No hay acción, es respuesta normal
return [{
    json: {
        has_action: false,
        final_message: aiResponse,
        original_response: aiResponse
    }
}];
