const fs = require('fs');
const path = 'c:\\Users\\RYZEN\\Downloads\\prex\\n8n-whatsapp-workflow-complete-FIXED.json';
let data = fs.readFileSync(path, 'utf8');

// Buscar el nodo getqueue y su credentials
const searchPattern = /"id": "getqueue",[\s\S]*?"credentials": \{[\s\S]*?"postgres": \{[\s\S]*?"id": "VyG1bjMeGSJKR4Dx",[\s\S]*?"position": \[[\s\S]*?3240,[\s\S]*?400[\s\S]*?\][\s\S]*?\},[\s\S]*?\{[\s\S]*?"parameters": \{[\s\S]*?"jsCode": "const queueData/;

const replacement = `"id": "getqueue",
            "name": "Get & Merge Queue",
            "type": "n8n-nodes-base.postgres",
            "typeVersion": 2.5,
            "position": [
                3060,
                400
            ],
            "alwaysOutputData": true,
            "credentials": {
                "postgres": {
                    "id": "VyG1bjMeGSJKR4Dx",
                    "name": "PostgresPrexUp"
                }
            }
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {
                            "value1": "={{ !!$json.merged_message }}",
                            "value2": true
                        }
                    ]
                }
            },
            "id": "hasmessages",
            "name": "Has Messages?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [
                3240,
                400
            ]
        },
        {
            "parameters": {
                "jsCode": "const queueData`;

// Intentar un reemplazo más simple si el patrón anterior falla
if (!searchPattern.test(data)) {
    console.log('Pattern not found, trying fallback...');
    // Fallback: buscar la sección específica que sabemos que está rota
    const brokenSection = /"credentials": \{\s+"postgres": \{\s+"id": "VyG1bjMeGSJKR4Dx",\s+"position": \[\s+3240,\s+400\s+\]\s+\},\s+\{\s+"parameters": \{\s+"jsCode": "const queueData/;

    if (brokenSection.test(data)) {
        data = data.replace(brokenSection, `"credentials": {
                "postgres": {
                    "id": "VyG1bjMeGSJKR4Dx",
                    "name": "PostgresPrexUp"
                }
            }
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {
                            "value1": "={{ !!$json.merged_message }}",
                            "value2": true
                        }
                    ]
                }
            },
            "id": "hasmessages",
            "name": "Has Messages?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [
                3240,
                400
            ]
        },
        {
            "parameters": {
                "jsCode": "const queueData`);
    } else {
        console.error('Could not find the broken section');
        process.exit(1);
    }
} else {
    data = data.replace(searchPattern, replacement);
}

fs.writeFileSync(path, data);
console.log('File repaired successfully');
