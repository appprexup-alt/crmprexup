# Solución: OpenAI Function Calling para Acciones de Base de Datos

## 🎯 Problema
El AI Agent necesita poder:
1. Buscar propiedades con filtros dinámicos
2. Obtener agentes disponibles
3. Crear citas en la base de datos

Pero n8n no soporta Database Tools en tu versión.

## ✅ Solución: OpenAI Function Calling

OpenAI tiene una feature llamada "Function Calling" donde:
1. Defines funciones disponibles
2. El AI decide cuándo llamarlas
3. Tu código ejecuta la función
4. Devuelves el resultado al AI

## 🔧 Implementación

### Nodo 1: OpenAI Chat con Functions
En lugar de usar AI Agent, usaremos un nodo HTTP Request directo a OpenAI API con function definitions.

### Nodo 2: Parse Function Calls
Un nodo Code que detecta si el AI quiere llamar una función.

### Nodo 3: Execute Function
Nodos Postgres que ejecutan las queries según la función llamada.

### Nodo 4: Return to AI
Devuelve el resultado al AI para que genere la respuesta final.

## 📝 Funciones Definidas

```javascript
[
  {
    "name": "buscar_propiedades",
    "description": "Busca terrenos y propiedades disponibles",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {"type": "string", "description": "Ubicación (ej: Lima, Miraflores)"},
        "max_price": {"type": "number", "description": "Precio máximo"},
        "min_area": {"type": "number", "description": "Área mínima en m²"}
      }
    }
  },
  {
    "name": "crear_cita",
    "description": "Crea una cita de visita a propiedad",
    "parameters": {
      "type": "object",
      "properties": {
        "property_id": {"type": "string", "description": "UUID de la propiedad"},
        "client_name": {"type": "string", "description": "Nombre del cliente"},
        "client_phone": {"type": "string", "description": "Teléfono con código país"},
        "scheduled_date": {"type": "string", "description": "Fecha YYYY-MM-DD"},
        "scheduled_time": {"type": "string", "description": "Hora HH:MM"}
      },
      "required": ["property_id", "client_name", "client_phone", "scheduled_date", "scheduled_time"]
    }
  }
]
```

Voy a crear el workflow completo con esta implementación.
