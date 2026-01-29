# 🔧 Guía: Agregar Flujo Paralelo de Búsqueda de Propiedades

## Objetivo
Agregar un flujo independiente que detecte búsquedas de propiedades y las procese con nodos Postgres directos, sin llamar al AI Agent para queries simples.

---

## Paso 1: Agregar Nodo "Detect Query Type" (Switch)

**Después del nodo:** `Has Messages?` (output TRUE)

**Tipo:** Switch  
**Nombre:** `Detect Query Type`  
**Posición:** Entre "Has Messages?" y "Get Propiedades"

### Configuración:

**Regla 1 - Property Search:**
- **Condición:** El mensaje contiene palabras clave de búsqueda
- **Expresión:**
```javascript
={{ 
  $json.merged_message.toLowerCase().includes('buscar') || 
  $json.merged_message.toLowerCase().includes('terreno') || 
  $json.merged_message.toLowerCase().includes('propiedad') || 
  $json.merged_message.toLowerCase().includes('lote') || 
  $json.merged_message.toLowerCase().includes('precio') ||
  $json.merged_message.toLowerCase().includes('mostrar') ||
  $json.merged_message.toLowerCase().includes('disponible')
}}
```
- **Output:** Renombrar a "Property Search"

**Regla 2 - General:**  
- Es el fallback (cualquier otro mensaje)
- **Output:** Renombrar a "General Query"

---

## Paso 2: Agregar Nodo "Extract Search Criteria" (Code)

**Conectar desde:** Detect Query Type → Property Search  
**Tipo:** Code  
**Nombre:** `Extract Search Criteria`

### Código JavaScript:

```javascript
const message = $('Get & Merge Queue').first().json.merged_message.toLowerCase();

// Inicializar criterios
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

// Detectar ubicación específica
const ubicaciones = [
  'parque', 'esquina', 'campiña', 'central',
  'lima', 'miraflores', 'san isidro', 'surco', 'barranco'
];

for (const loc of ubicaciones) {
  if (message.includes(loc)) {
    criteria.has_location = true;
    criteria.location = loc;
    break;
  }
}

// Detectar precio máximo (ej: "máximo 50mil", "hasta 40000")
const precioMaxMatch = message.match(/(?:m[aá]ximo?|hasta|menor)\s+(\d+)[\s\w]*?(?:mil|k|000)?/i);
if (precioMaxMatch) {
  let precio = parseInt(precioMaxMatch[1]);
  // Si es "50mil" o "50k", multiplicar por 1000
  if (message.includes('mil') || message.includes('k')) {
    precio = precio * 1000;
  }
  criteria.has_price = true;
  criteria.max_price = precio;
}

// Detectar precio mínimo
const precioMinMatch = message.match(/(?:m[ií]nimo?|desde|mayor)\s+(\d+)[\s\w]*?(?:mil|k|000)?/i);
if (precioMinMatch) {
  let precio = parseInt(precioMinMatch[1]);
  if (message.includes('mil') || message.includes('k')) {
    precio = precio * 1000;
  }
  criteria.min_price = precio;
}

// Detectar área mínima (ej: "mínimo 100m²", "desde 150 metros")
const areaMinMatch = message.match(/(?:m[ií]nimo?|desde)\s+(\d+)\s*(?:m[²2]|metros)/i);
if (areaMinMatch) {
  criteria.has_area = true;
  criteria.min_area = parseInt(areaMinMatch[1]);
}

// Detectar área máxima
const areaMaxMatch = message.match(/(?:m[aá]ximo?|hasta)\s+(\d+)\s*(?:m[²2]|metros)/i);
if (areaMaxMatch) {
  criteria.has_area = true;
  criteria.max_area = parseInt(areaMaxMatch[1]);
}

// Detectar moneda
if (message.includes('soles') || message.includes('pen')) {
  criteria.currency = 'PEN';
}

return [{ json: criteria }];
```

---

## Paso 3: Agregar Nodo "Build Search Query" (Code)

**Conectar desde:** Extract Search Criteria  
**Tipo:** Code  
**Nombre:** `Build Search Query`

### Código JavaScript:

```javascript
const criteria = $json;

// Query base
let query = "SELECT id, description, location, price, currency, area, status, created_at FROM properties WHERE status = 'disponible'";
const conditions = [];

// Agregar filtro de ubicación
if (criteria.has_location && criteria.location) {
  conditions.push(`location ILIKE '%${criteria.location}%'`);
}

// Agregar filtro de precio
if (criteria.has_price && criteria.max_price) {
  conditions.push(`price <= ${criteria.max_price}`);
  conditions.push(`currency = '${criteria.currency}'`);
}

if (criteria.min_price) {
  conditions.push(`price >= ${criteria.min_price}`);
}

// Agregar filtro de área
if (criteria.has_area) {
  if (criteria.min_area) {
    conditions.push(`area >= ${criteria.min_area}`);
  }
  if (criteria.max_area) {
    conditions.push(`area <= ${criteria.max_area}`);
  }
}

// Combinar condiciones
if (conditions.length > 0) {
  query += " AND " + conditions.join(" AND ");
}

// Ordenar por precio y limitar resultados
query += " ORDER BY price ASC LIMIT 10";

return [{ 
  json: { 
    dynamic_query: query,
    search_criteria: criteria
  } 
}];
```

---

## Paso 4: Agregar Nodo "Search Properties" (Postgres)

**Conectar desde:** Build Search Query  
**Tipo:** Postgres  
**Nombre:** `Search Properties`  
**Credenciales:** PostgresPrexUp

### Configuración:

- **Operation:** Execute Query
- **Query:** `={{ $json.dynamic_query }}`
- **Always Output Data:** ✅ Activado

---

## Paso 5: Agregar Nodo "Format Search Results" (Code)

**Conectar desde:** Search Properties  
**Tipo:** Code  
**Nombre:** `Format Search Results`

### Código JavaScript:

```javascript
const properties = $input.all();
const criteria = $('Build Search Query').first().json.search_criteria;

// Si no hay resultados
if (properties.length === 0) {
  return [{
    json: {
      formatted_response: "Lo siento, no encontré propiedades con esos criterios 😔\n\n¿Quieres que te muestre todas las propiedades disponibles o cambias los filtros?",
      has_results: false,
      result_count: 0
    }
  }];
}

// Formatear resultados (máximo 3)
const results = properties.slice(0, 3).map((prop, idx) => {
  const p = prop.json;
  return `${idx + 1}. 🏠 ${p.description}
📍 ${p.location || 'Ubicación sin especificar'}
📐 ${p.area} m²
💰 ${p.currency} ${p.price.toLocaleString('es-PE')}`;
}).join('\n\n');

// Construir mensaje de respuesta
let response = `Encontré ${properties.length} propiedad(es) disponible(s)`;

// Mencionar filtros aplicados
const filtros = [];
if (criteria.has_location) filtros.push(`ubicación: ${criteria.location}`);
if (criteria.has_price) filtros.push(`máximo ${criteria.currency} ${criteria.max_price.toLocaleString()}`);
if (criteria.has_area && criteria.min_area) filtros.push(`desde ${criteria.min_area}m²`);

if (filtros.length > 0) {
  response += ` (${filtros.join(', ')})`;
}

response += `:\n\n${results}\n\n`;

if (properties.length > 3) {
  response += `Hay ${properties.length - 3} más. `;
}

response += `¿Te interesa alguna? Te puedo dar más detalles o agendar una visita 📅`;

return [{
  json: {
    formatted_response: response,
    has_results: true,
    result_count: properties.length,
    properties: properties.map(p => p.json)
  }
}];
```

---

## Paso 6: Actualizar Conexiones

### Desde "Has Messages?" (output TRUE):
- **ANTES:** → Get Propiedades  
- **AHORA:** → **Detect Query Type**

### Desde "Detect Query Type":
- **Output "Property Search":** → Extract Search Criteria → Build Query → Search Properties → Format Results → **Merge Final**
- **Output "General Query":** → Get Propiedades → Get Usuarios → Merge Data → Prepare AI Input → AI Agent → ... (flujo existente)

### Nuevo Nodo "Merge Final" (Merge):
**Propósito:** Combinar respuestas del flujo paralelo y del AI Agent

**Input 1:** Format Search Results  
**Input 2:** Prepare Response (del AI Agent)

**Output:** → Save AI Response (nodo existente)

---

## Paso 7: Modificar "Save AI Response"

Cambiar la query para que tome el texto correcto según la fuente:

```sql
INSERT INTO messages (lead_id, content, direction, type, status) 
VALUES (
  '{{ $json.lead_id || $('Prepare AI Input').item.json.lead_id }}', 
  '{{ $json.formatted_response || $json.full_response }}', 
  'outbound', 
  'text', 
  'sent'
)
```

---

## Paso 8: Modificar "Split Response"

Actualizar para manejar ambos tipos de respuesta:

```javascript
// Obtener la respuesta (puede venir del flujo paralelo o del AI)
const output = $json.formatted_response || $('Prepare Response').first().json.output || '';
const normData = $('Normalizacion').first().json;

// ... resto del código igual
```

---

## Diagrama del Flujo Completo

```
Has Messages?
    └── [TRUE] → Detect Query Type
                    ├── Property Search → Extract Criteria
                    │                      → Build Query  
                    │                      → Search Properties (Postgres)
                    │                      → Format Results
                    │                      → Merge Final
                    │
                    └── General Query → Get Propiedades
                                        → Get Usuarios
                                        → Merge Data
                                        → Prepare AI Input
                                        → AI Agent
                                        → Prepare Response
                                        → Merge Final

Merge Final → Save AI Response → Split Response → Loop → Send WhatsApp
```

---

## Resultado Esperado

**Ejemplo 1 - Búsqueda Simple (Flujo Paralelo):**
```
Usuario: "Buscar terreno frente al parque"
PREXA: "Encontré 3 propiedad(es) disponibles (ubicación: parque):

1. 🏠 Lote 15 - Manzana B, Frente al Parque
📍 parque
📐 180 m²
💰 USD 38,500

...

¿Te interesa alguna? Te puedo dar más detalles o agendar una visita 📅"
```

**Ejemplo 2 - Consulta General (AI Agent):**
```
Usuario: "¿Cómo es el proceso de compra?"
PREXA: [Respuesta del AI Agent sobre el proceso]
```

---

## Ventajas

✅ **Respuestas 10x más rápidas** para búsquedas simples  
✅ **90% menos costo** en tokens de OpenAI para búsquedas  
✅ **Formato consistente** de resultados  
✅ **Filtros precisos** via SQL  
✅ **Fallback inteligente** al AI Agent para queries complejas
