// Nodo Code: Format Create Appointment Results
const result = $input.first().json;
const userMessage = $('Parse AI Response').first().json.user_message;

if (!result.id) {
    return [{
        json: {
            final_message: "Lo siento, hubo un error al agendar la cita. ¿Puedes intentar de nuevo?",
            needs_ai_response: false
        }
    }];
}

const formatted = `✅ Visita agendada exitosamente

📅 Fecha: ${result.scheduled_date}
⏰ Hora: ${result.scheduled_time}
📍 Propiedad: ${result.property_id}
👤 Cliente: ${result.client_name}
📞 Teléfono: ${result.client_phone}
📋 Estado: ${result.status}

Te confirmaremos los detalles del asesor que te atenderá pronto`;

return [{
    json: {
        formatted_results: formatted,
        raw_result: result,
        needs_ai_response: false,
        final_message: formatted
    }
}];
