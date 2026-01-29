// Nodo Code: Format Search Results for AI
const results = $input.all();
const userMessage = $('Parse AI Response').first().json.user_message;

if (results.length === 0) {
    return [{
        json: {
            formatted_results: "No encontré propiedades con esos criterios. ¿Te interesa ver otras opciones?",
            needs_ai_response: true
        }
    }];
}

// Formatear resultados para el AI
let formatted = `Encontré ${results.length} propiedades:\n\n`;

results.slice(0, 3).forEach((item, idx) => {
    const prop = item.json;
    formatted += `${idx + 1}. 🏠 ${prop.description}\n`;
    formatted += `   📍 ${prop.location}\n`;
    formatted += `   📐 ${prop.area} m²\n`;
    formatted += `   💰 ${prop.currency} ${prop.price}\n`;
    formatted += `   ID: ${prop.id}\n\n`;
});

if (results.length > 3) {
    formatted += `... y ${results.length - 3} propiedades más.\n\n`;
}

formatted += "¿Te interesa alguna? Puedo agendar una visita 📅";

return [{
    json: {
        formatted_results: formatted,
        raw_results: results.map(r => r.json),
        needs_ai_response: false,
        final_message: formatted
    }
}];
