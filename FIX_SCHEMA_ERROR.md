# Solución al Error: "La entrada de la herramienta recibida no coincidió con el esquema esperado"

## 🔴 Problema

El nodo `tool_search_properties` está configurado con:
```
url: "={{ $fromAI('url', 'La URL completa...', 'string') }}"
```

El AI no puede generar una URL completa correctamente. El error indica que el esquema esperado no coincide.

## ✅ Solución: Usar Nodos Postgres Tool en lugar de HTTP Request Tool

En lugar de usar HTTP Request Tools (que son complicados de configurar), vamos a usar **Postgres Tool** que es mucho más simple y robusto.

### Cambios a Realizar:

1. **Eliminar** nodos `tool_search_properties` y `tool_create_appointment`
2. **Agregar** nodos Postgres Tool

## 📝 Configuración Correcta

### Nodo 1: Search Properties Tool

```json
{
  "name": "buscar_propiedades",
  "description": "Busca propiedades/terrenos disponibles. Parámetros opcionales: location (texto), min_price (número), max_price (número), min_area (número), max_area (número). Siempre filtra por status='disponible'. Ejemplos: location='Lima', max_price=50000, min_area=100",
  "operation": "executeQuery",
  "query": "={{ $fromAI('query', 'Consulta SQL SELECT. Tabla: properties. Columnas: id, description, location, price, currency, area, status. Siempre incluir WHERE status = disponible. Usar ILIKE para location. Usar <= para max_price, >= para min_price. Limitar a 10 resultados.', 'string') }}"
}
```

**Tipo**: `@n8n/n8n-nodes-langchain.toolDatabase`

### Nodo 2: Get Available Agents Tool

```json
{
  "name": "obtener_agentes",
  "description": "Obtiene agentes/asesores disponibles para asignar a visitas. No requiere parámetros.",
  "operation": "executeQuery",
  "query": "SELECT id, name, email, phone FROM users WHERE active = true LIMIT 5"
}
```

**Tipo**: `@n8n/n8n-nodes-langchain.toolDatabase`

### Nodo 3: Create Appointment Tool

```json
{
  "name": "crear_cita",
  "description": "Crea una cita/visita asignando un agente automáticamente. Requiere: property_id (UUID), client_name (texto), client_phone (texto con código país), scheduled_date (YYYY-MM-DD), scheduled_time (HH:MM en formato 24h)",
  "operation": "executeQuery",
  "query": "={{ $fromAI('query', 'Consulta SQL para crear cita. Primero obtener un agente: SELECT id FROM users WHERE active=true LIMIT 1. Luego INSERT INTO appointments (property_id, agent_id, client_name, client_phone, scheduled_date, scheduled_time, status) VALUES (...valores..., agendado) RETURNING id, property_id, client_name, scheduled_date, scheduled_time', 'string') }}"
}
```

**Tipo**: `@n8n/n8n-nodes-langchain.toolDatabase`

---

## 🔧 Instrucciones de Implementación

### En n8n:

1. **Eliminar** (o desconectar) los nodos:
   - `tool_search_properties`
   - `tool_create_appointment`

2. **Agregar** 3 nodos nuevos tipo **"Tool: Database"**
   - Buscar en el menú AI → Tools → Database

3. **Configurar cada nodo**:
   - **Name**: Como se indica arriba
   - **Description**: Como se indica arriba  
   - **Database Operation**: Execute Query
   - **Query**: Como se indica arriba
   - **Credentials**: PostgresPrexUp

4. **Conectar** a AI Agent:
   - Desde cada Tool → Conector `ai_tool` → AI Agent

5. **Actualizar el System Message del AI Agent**:
   
```
# HERRAMIENTAS DISPONIBLES

## buscar_propiedades
Busca terrenos y propiedades disponibles.
**Uso**: Genera un SELECT con filtros WHERE según lo que pida el usuario
**Ejemplos**:
- "terrenos en Lima": WHERE location ILIKE '%Lima%' AND status = 'disponible'
- "máximo 50mil dólares": WHERE price <= 50000 AND currency = 'USD' AND status = 'disponible'
- "mínimo 100m²": WHERE area >= 100 AND status = 'disponible'

## obtener_agentes
Lista agentes disponibles. No requiere parámetros.

## crear_cita
Crea una visita con asignación automática de agente.
**Primero**: Obtén un agente con: SELECT id FROM users WHERE active=true LIMIT 1
**Luego**: INSERT INTO appointments con los datos
```

---

## ⚡ Ventajas de esta Solución

✅ **Más simple**: No necesita generar URLs complejas  
✅ **Más robusto**: El AI es muy bueno generando SQL  
✅ **Más flexible**: Puede combinar filtros fácilmente  
✅ **Menos errores**: No hay problemas de esquema HTTP  

---

## 🧪 Prueba Rápida

Cuando hagas la migración, prueba con:

```
Usuario: "Quiero un terreno en Lima de máximo 50mil dólares"
```

El AI debería generar:
```sql
SELECT id, description, location, price, currency, area, status 
FROM properties 
WHERE location ILIKE '%Lima%' 
AND price <= 50000 
AND status = 'disponible' 
LIMIT 10
```

Y devolver las propiedades encontradas.
