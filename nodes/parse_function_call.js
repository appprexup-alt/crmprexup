// Nodo: Parse Function Call
const response = $input.first().json;
const choice = response.choices[0];
const message = choice.message;

// Si el AI quiere llamar una función
if (message.function_call) {
    const functionName = message.function_call.name;
    const args = JSON.parse(message.function_call.arguments);

    return [{
        json: {
            has_function_call: true,
            function_name: functionName,
            arguments: args,
            original_message: message
        }
    }];
}

// Si el AI ya tiene la respuesta final
return [{
    json: {
        has_function_call: false,
        final_response: message.content,
        original_message: message
    }
}];
