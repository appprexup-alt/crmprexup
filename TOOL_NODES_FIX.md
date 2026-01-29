# Solución: Nodos Database Tool No Reconocidos

## 🔴 Problema
Los nodos `buscar_propiedades`, `obtener_agentes`, y `crear_cita` aparecen con `?` porque el tipo `@n8n/n8n-nodes-langchain.toolDatabase` no existe en tu versión de n8n.

## ✅ Solución Alternativa
Usar **nodos Postgres estándar** que sí funcionan, y el AI Agent los llama mediante su descripción en el system Message.

### Opción Recomendada: Usar el Workflow Original

El workflow original (`n8n-whatsapp-workflow.json`) **ya tiene todo funcionando** con nodos estándar de Postgres.

### Diferencia Clave:
- ❌ **Database Tool nodes**: No soportados en tu versión
- ✅ **Postgres nodes estándar**: Soportados y funcionan bien

## 📝 Nuevo Enfoque

En lugar de usar "Tool" nodes especiales, usa el **workflow original** que ya incluye:
- ✅ Soporte de audio
- ✅ Soporte de imágenes  
- ✅ Conversación persistente
- ✅ Nodos Postgres estándar antes del AI Agent

### Cómo Funciona:
1. **Get Propiedades** - Nodo Postgres que obtiene todas las propiedades disponibles
2. **Get Usuarios** - Nodo Postgres que obtiene todos los agentes activos
3. **Prepare AI Input** - Prepara el contexto con las propiedades y agentes
4. **AI Agent** - Tiene el contexto completo en el system message

El AI NO ejecuta queries dinámicos, pero tiene TODA la información en el prompt.

## 🔧 Instrucción

**Usa el archivo: `n8n-whatsapp-workflow.json`** (el original, no el "complete")

Este ya tiene:
- Audio + Imagen + Texto ✅
- Conversación persistente ✅
- Herramientas que SÍ funcionan ✅
