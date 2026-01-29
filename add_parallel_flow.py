import json
import sys

# Cargar el workflow actual
with open('n8n-whatsapp-workflow-FIXED.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

# Verificar estructura
print(f"Workflow '{workflow['name']}' cargado")
print(f"Nodos actuales: {len(workflow['nodes'])}")
print(f"Conexiones: {len(workflow['connections'])}")

# AGREGAR NUEVOS NODOS PARA EL FLUJO PARALELO

# 1. Nodo: Detect Query Type (Switch)
detect_query_type = {
    "parameters": {
        "rules": {
            "values": [
                {
                    "conditions": {
                        "options": {
                            "caseSensitive": False,
                            "leftValue": "",
                            "typeValidation": "strict"
                        },
                        "conditions": [
                            {
                                "leftValue": "={{ $json.merged_message.toLowerCase() }}",
                                "rightValue": "buscar",
                                "operator": {
                                    "type": "string",
                                    "operation": "contains"
                                }
                            }
                        ],
                        "combinator": "or"
                    },
                    "renameOutput": True,
                    "outputKey": "Property Search"
                }
            ]
        },
        "options": {
            "fallbackOutput": "extra",
            "renameFallbackOutput": "General Query"
        }
    },
    "type": "n8n-nodes-base.switch",
    "typeVersion": 3.2,
    "position": [3380, 400],
    "id": "detectquerytype",
    "name": "Detect Query Type"
}

# 2. Nodo: Extract Search Criteria (Code)
extract_criteria = {
    "parameters": {
        "jsCode": """const message = $('Get & Merge Queue').first().json.merged_message.toLowerCase();

const criteria = {
  raw_message: message,
  has_location: false,
  location: null,
  has_price: false,
  max_price: null,
  min_price: null,
  has_area: false,
  min_area: null,
  max_area: null,
  currency: 'USD'
};

const ubicaciones = ['parque', 'esquina', 'campiña', 'central', 'lima', 'miraflores'];
for (const loc of ubicaciones) {
  if (message.includes(loc)) {
    criteria.has_location = true;
    criteria.location = loc;
    break;
  }
}

const precioMaxMatch = message.match(/(?:máximo?|hasta|menor)\s+(\d+)[\s\w]*?(?:mil|k|000)?/i);
if (precioMaxMatch) {
  let precio = parseInt(precioMaxMatch[1]);
  if (message.includes('mil') || message.includes('k')) precio *= 1000;
  criteria.has_price = true;
  criteria.max_price = precio;
}

const areaMinMatch = message.match(/(?:mínimo?|desde)\s+(\d+)\s*(?:m|metros)/i);
if (areaMinMatch) {
  criteria.has_area = true;
  criteria.min_area = parseInt(areaMinMatch[1]);
}

if (message.includes('soles') || message.includes('pen')) {
  criteria.currency = 'PEN';
}

return [{ json: criteria }];"""
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [3580, 200],
    "id": "extractcriteria",
    "name": "Extract Search Criteria"
}

# 3. Nodo: Build Search Query (Code)
build_query = {
    "parameters": {
        "jsCode": """const criteria = $json;
let query = "SELECT id, description, location, price, currency, area, status, created_at FROM properties WHERE status = 'disponible'";
const conditions = [];

if (criteria.has_location && criteria.location) {
  conditions.push(`location ILIKE '%${criteria.location}%'`);
}

if (criteria.has_price && criteria.max_price) {
  conditions.push(`price <= ${criteria.max_price}`);
  conditions.push(`currency = '${criteria.currency}'`);
}

if (criteria.min_price) {
  conditions.push(`price >= ${criteria.min_price}`);
}

if (criteria.has_area) {
  if (criteria.min_area) conditions.push(`area >= ${criteria.min_area}`);
  if (criteria.max_area) conditions.push(`area <= ${criteria.max_area}`);
}

if (conditions.length > 0) {
  query += " AND " + conditions.join(" AND ");
}

query += " ORDER BY price ASC LIMIT 10";

return [{ json: { dynamic_query: query, search_criteria: criteria } }];"""
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [3760, 200],
    "id": "buildquery",
    "name": "Build Search Query"
}

# 4. Nodo: Search Properties (Postgres)
search_properties = {
    "parameters": {
        "operation": "executeQuery",
        "query": "={{ $json.dynamic_query }}",
        "options": {}
    },
    "id": "searchproperties",
    "name": "Search Properties",
    "type": "n8n-nodes-base.postgres",
    "typeVersion": 2.5,
    "position": [3940, 200],
    "alwaysOutputData": True,
    "credentials": {
        "postgres": {
            "id": "VyG1bjMeGSJKR4Dx",
            "name": "PostgresPrexUp"
        }
    }
}

# 5. Nodo: Format Search Results (Code)
format_results = {
    "parameters": {
        "jsCode": """const properties = $input.all();
const criteria = $('Build Search Query').first().json.search_criteria;

if (properties.length === 0) {
  return [{
    json: {
      formatted_response: "Lo siento, no encontré propiedades con esos criterios 😔\\n\\n¿Quieres que te muestre todas las propiedades disponibles o cambias los filtros?",
      has_results: false,
      result_count: 0,
      lead_id: $('Prepare AI Input').item.json.lead_id
    }
  }];
}

const results = properties.slice(0, 3).map((prop, idx) => {
  const p = prop.json;
  return `${idx + 1}. 🏠 ${p.description}
📍 ${p.location || 'Ubicación sin especificar'}
📐 ${p.area} m²
💰 ${p.currency} ${p.price.toLocaleString('es-PE')}`;
}).join('\\n\\n');

let response = `Encontré ${properties.length} propiedad(es) disponible(s)`;

const filtros = [];
if (criteria.has_location) filtros.push(`ubicación: ${criteria.location}`);
if (criteria.has_price) filtros.push(`máximo ${criteria.currency} ${criteria.max_price.toLocaleString()}`);
if (criteria.has_area && criteria.min_area) filtros.push(`desde ${criteria.min_area}m²`);

if (filtros.length > 0) {
  response += ` (${filtros.join(', ')})`;
}

response += `:\\n\\n${results}\\n\\n`;

if (properties.length > 3) {
  response += `Hay ${properties.length - 3} más. `;
}

response += `¿Te interesa alguna? Te puedo dar más detalles o agendar una visita 📅`;

return [{
  json: {
    formatted_response: response,
    has_results: true,
    result_count: properties.length,
    lead_id: $('Prepare AI Input').item.json.lead_id
  }
}];"""
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [4120, 200],
    "id": "formatresults",
    "name": "Format Search Results"
}

# 6. Nodo: Merge Final Responses (Merge)
merge_final = {
    "parameters": {
        "mode":" combine",
        "combineBy": "combineAll",
        "options": {}
    },
    "type": "n8n-nodes-base.merge",
    "typeVersion": 3,
    "position": [4300, 300],
    "id": "mergefinal",
    "name": "Merge Final Responses"
}

# Agregar nuevos nodos
new_nodes = [detect_query_type, extract_criteria, build_query, search_properties, format_results, merge_final]
workflow['nodes'].extend(new_nodes)

print(f"\n✅ Agregados {len(new_nodes)} nuevos nodos")
print(f"Total de nodos now: {len(workflow['nodes'])}")

# ACTUALIZAR CONEXIONES

# Desconectar: Has Messages? → Get Propiedades
# Conectar: Has Messages? → Detect Query Type
workflow['connections']['Has Messages?'] = {
    "main": [
        [{
            "node": "Detect Query Type",
            "type": "main",
            "index": 0
        }],
        []
    ]
}

# Nuevas conexiones
workflow['connections']['Detect Query Type'] = {
    "main": [
        [{  # Property Search
            "node": "Extract Search Criteria",
            "type": "main",
            "index": 0
        }],
        [{  # General Query
            "node": "Get Propiedades",
            "type": "main",
            "index": 0
        }, {
            "node": "Get Usuarios",
            "type": "main",
            "index": 0
        }]
    ]
}

workflow['connections']['Extract Search Criteria'] = {
    "main": [[{
        "node": "Build Search Query",
        "type": "main",
        "index": 0
    }]]
}

workflow['connections']['Build Search Query'] = {
    "main": [[{
        "node": "Search Properties",
        "type": "main",
        "index": 0
    }]]
}

workflow['connections']['Search Properties'] = {
    "main": [[{
        "node": "Format Search Results",
        "type": "main",
        "index": 0
    }]]
}

workflow['connections']['Format Search Results'] = {
    "main": [[{
        "node": "Merge Final Responses",
        "type": "main",
        "index": 0
    }]]
}

# Prepare Response debe ir a Merge Final
workflow['connections']['Prepare Response'] = {
    "main": [[{
        "node": "Merge Final Responses",
        "type": "main",
        "index": 1
    }]]
}

# Merge Final → Save AI Response
workflow['connections']['Merge Final Responses'] = {
    "main": [[{
        "node": "Save AI Response",
        "type": "main",
        "index": 0
    }]]
}

print("\n✅ Conexiones actualizadas")

# Guardar el workflow modificado
with open('n8n-whatsapp-workflow-with-parallel-flow.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=4, ensure_ascii=False)

print("\n📝 Workflow guardado como: n8n-whatsapp-workflow-with-parallel-flow.json")
print(f"✅ Workflow completo con {len(workflow['nodes'])} nodos")
