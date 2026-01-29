Lo siento, el archivo JSON se corrompió durante las ediciones. He identificado el problema y te voy a dar la solución manual para que la apliques directamente en n8n en lugar de modificar el JSON.

## Problema Encontrado

El archivo JSON se corrompió al intentar modificarlo. En lugar de seguir modificando el JSON, es mejor que hagas las correcciones **directamente en n8n visual** para evitar errores.

## ✅ Solución: Aplicar en n8n (Más Seguro)

### Fix #1: Modificar el nodo "Get & Merge Queue"

1. Abre n8n en tu navegador
2. Abre el workflow "WhatsApp CRM AI - Full Support"
3. Click en el nodo **"Get & Merge Queue"**
4. En el campo **SQL Query**, reemplaza la query completa con esta

:

```sql
WITH pending AS (
  SELECT id, content 
  FROM message_queue 
  WHERE phone = '{{ $('Merge').item.json.phone }}' 
  AND status = 'pending' 
  ORDER BY created_at
), 
updated AS (
  UPDATE message_queue 
  SET status = 'processed' 
  WHERE id IN (SELECT id FROM pending) 
  RETURNING id
) 
SELECT 
  CASE WHEN COUNT(*) > 0 THEN string_agg(content, ' | ') ELSE NULL END as merged_message,
  COUNT(*) as msg_count 
FROM pending
HAVING COUNT(*) > 0
```

5. Click **Save**

### Fix #2: Modificar el nodo "Prepare AI Input"

1. Click en el nodo **"Prepare AI Input"**
2. Reemplaza el código JavaScript completo con este:

```javascript
const queueData = $('Get & Merge Queue').first().json;
const mergeData = $('Merge').first().json;
const leadData = $('GetOrCreateLead').first().json;

// Validar que haya mensajes en la cola
if (!queueData.merged_message || queueData.msg_count === 0) {
  throw new Error('No hay mensajes en la cola para procesar');
}

return [{
  json: {
    chat_input: queueData.merged_message,
    session_id: mergeData.phone,
    lead_id: leadData.lead_id
  }
}];
```

3. Click **Save**

### Fix #3: (Opcional pero Recomendado) Mejorar "Has Messages?"

1. Click en el nodo **"Has Messages?"**
2. Click en **"Add Condition"** para agregar una segunda condición
3. Configura:
   - **Condition 1**: `{{ $json.merged_message }}` is not empty
   - **Condition 2**: `{{ $json.msg_count }}` greater than `0`
   - **Combinator**: AND
4. Click **Save**

---

## ✅ Resultado

Después de aplicar estos cambios:
- La IA **NO** responderá si no hay mensajes nuevos
- El sistema de cola funcionará correctamente
- Se eliminan las respuestas duplicadas

---

## 🧪 Cómo Probar

1. **Activa** el workflow en n8n
2. Envía un mensaje por WhatsApp: `"alquimia hola"`
3. Espera la respuesta de PREXA
4. **NO** envíes nada más durante 1 minuto
5. Verifica que NO recibas respuestas adicionales

Si todo funciona correctamente, deberías recibir **solo UNA** respuesta por cada mensaje que envíes.

---

## Nota sobre el Archivo JSON

El archivo `n8n-whatsapp-workflow-complete.json` quedó corrupto durante las ediciones automáticas. Una vez que hayas aplicado los cambios en n8n:

1. **Exporta** el workflow desde n8n (3 puntos → Download)
2. **Reemplaza** el archivo corrupto con la nueva versión exportada
3. Esto te dará un respaldo limpio con las correcciones aplicadas
