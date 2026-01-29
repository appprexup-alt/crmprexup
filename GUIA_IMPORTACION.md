# 🚀 Guía Rápida de Importación

## Archivo a Importar
**`n8n-whatsapp-workflow-with-actions.json`**

---

## ⚡ 3 Pasos para Activar

### 1️⃣ Importar
```
n8n → Menu ≡ → Import from File → Seleccionar archivo → Import
```

### 2️⃣ Configurar Credenciales
Verificar que estos nodos tengan credenciales:
- **Postgres**: `PostgresPrexUp` (todos los nodos de BD)
- **OpenAI**: `OpenAi account` (Audio, Imagen, AI Agent)

### 3️⃣ Activar
```
Toggle "Active" → Verde ✓
```

---

## 🧪 Prueba Rápida

```
WhatsApp: "alquimia hola"
→ PREXA saluda y presenta Residencial Alquimia

WhatsApp: "Quiero un terreno"
→ PREXA pregunta preferencias (parque, esquina, vista)

WhatsApp: "Frente al parque"
→ PREXA busca y muestra lotes

WhatsApp: "Quiero agendar visita para mañana a las 10am"
→ PREXA pide nombre y agenda
```

---

## 📊 Datos de Prueba (Opcional)

Si no tienes lotes en la BD, ejecuta:

```sql
INSERT INTO properties (description, location, price, currency, area, status) VALUES
('Lote 15 - Manzana B, frente al parque', 'Residencial Alquimia, Huaranguillo, Sachaca', 38500, 'USD', 180, 'disponible'),
('Lote 23 - Esquina con vista campiña', 'Residencial Alquimia, Huaranguillo, Sachaca', 42000, 'USD', 200, 'disponible'),
('Lote 8 - Zona central del proyecto', 'Residencial Alquimia, Huaranguillo, Sachaca', 35000, 'USD', 160, 'disponible');
```

---

## ✅ Listo!

El workflow está configurado para:
- ✅ Vender solo Residencial Alquimia
- ✅ Descubrir preferencias del cliente
- ✅ Buscar lotes según ubicación deseada
- ✅ Agendar visitas automáticamente
- ✅ Procesar audio e imágenes
- ✅ Mantener conversación fluida

🎉 **¡A vender lotes!** 🏡
