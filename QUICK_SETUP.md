# Instrucciones Rápidas: Configuración del Workflow

## 📋 Qué Debes Hacer

### Paso 1: Abrir n8n
- Ve a tu instancia de n8n
- Importa el archivo `n8n-whatsapp-workflow-with-actions.json`

### Paso 2: Verificar Credenciales
Todos estos nodos necesitan las credenciales correctas:
- **Postgres**: `PostgresPrexUp`
- **OpenAI**: `OpenAi account`

### Paso 3: Activar
- Toggle "Active" en verde
- Listo!

## 🧪 Probar

```
1. Envía: "alquimia hola"
   → PREXA saluda

2. Envía: "Quiero terreno en Lima de máximo 50mil dólares"
   → PREXA busca y muestra propiedades

3. Envía: "Quiero agendar visita para el 25 de enero a las 10am"  
   → PREXA pregunta tu nombre
   → Respondes tu nombre
   → PREXA crea la cita
```

## ✅ Resultado

El AI ahora puede:
- ✅ Buscar propiedades con filtros
- ✅ Crear citas automáticamente
- ✅ Procesar audio e imágenes
- ✅ Mantener conversación sin repetir keyword
