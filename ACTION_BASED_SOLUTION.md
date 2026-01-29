# Solución Práctica: AI con Acciones Estructuradas

## 🎯 Enfoque

En lugar de usar "tools" complejos, el AI responde en formato especial que n8n puede parsear y ejecutar.

## 📝 Formato de Respuesta del AI

### Búsqueda de Propiedades
```
ACTION:SEARCH_PROPERTIES
FILTERS:location=Lima,max_price=50000,currency=USD
---
Estoy buscando propiedades en Lima...
```

### Crear Cita
```
ACTION:CREATE_APPOINTMENT
DATA:property_id=xxx,client_name=Juan Perez,client_phone=51999999999,date=2026-01-25,time=10:00
---
Perfecto, estoy agendando tu visita...
```

### Respuesta Normal
```
¡Hola! 👋 Soy PREXA de PrexUp. ¿Buscas terrenos o propiedades?
```

## 🔧 Flujo en n8n

```
AI Agent → Parse Response → Switch (ACTION?)
                              ├─ SEARCH → Query Postgres → Format Results → Back to AI
                              ├─ CREATE → Insert Postgres → Confirm → Back to AI  
                              └─ NORMAL → Send to WhatsApp
```

## ✅ Ventajas

- ✅ No requiere tools especiales de n8n
- ✅ El AI tiene control total
- ✅ Fácil de debuggear
- ✅ Funciona en cualquier versión de n8n

Voy a crear el workflow completo con este patrón.
