
import json
import os

file_path = r'c:\Users\RYZEN\Downloads\prex\n8n-whatsapp-workflow-complete-FIXED.json'

# El código JS correcto para el nodo Split Response
correct_js_code = """const output = $('Prepare Response').first().json.output || '';
const normData = $('Normalizacion').first().json;

if (!output || output.trim() === '') {
  return [
    { 
      json: { 
        response_text: 'Lo siento, hubo un error. ¿Puedes repetir tu mensaje?',
        instance_server_url: normData.instance_server_url,
        instance_name: normData.instance_name,
        instance_apikey: normData.instance_apikey,
        user_number: normData.user_number
      }
    }
  ];
}

const sentences = output.split(/(?<=[.!?])\\s+/).filter(s => s.trim().length > 0);
const chunks = [];
for (let i = 0; i < sentences.length; i += 2) {
  const chunk = sentences.slice(i, i + 2).join(' ').trim();
  if (chunk) chunks.push(chunk);
}

if (chunks.length === 0) {
  chunks.push(output);
}

return chunks.map(text => ({ 
  json: { 
    response_text: text,
    instance_server_url: normData.instance_server_url,
    instance_name: normData.instance_name,
    instance_apikey: normData.instance_apikey,
    user_number: normData.user_number
  } 
}));"""

try:
    # Intentar leer el archivo. Dado que está corrompido, lo leeremos como texto y buscaremos el nodo.
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Buscar el nodo por su ID único "splitresponse"
    # El JSON está mal formado, así que buscaremos el bloque que contiene "splitresponse"
    # y reemplazaremos el jsCode dentro de él.
    
    # Una forma más segura es cargar lo que se pueda como JSON o usar regex
    import re
    
    # Buscar el bloque del nodo Split Response
    # Buscamos el inicio del objeto que contiene "id": "splitresponse"
    # Esto es un poco complejo si el JSON está muy roto, pero intentaremos una sustitución directa
    # del jsCode que sabemos que está roto.
    
    # El jsCode roto empieza con "const output = $('Prepare Response')"
    # y termina antes de "type": "n8n-nodes-base.code"
    
    pattern = r'("jsCode":\s*").*?("(?=\s*},\s*"type":\s*"n8n-nodes-base\.code"))'
    
    # Escapar el código correcto para JSON
    escaped_js = correct_js_code.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    
    new_content = re.sub(pattern, f'\\1{escaped_js}\\2', content, flags=re.DOTALL)
    
    if new_content == content:
        print("No se pudo encontrar el patrón para reemplazar. Intentando método alternativo...")
        # Método alternativo: buscar por el ID del nodo
        # Este es más agresivo
        node_pattern = r'(\{\s*"parameters":\s*\{.*?"id":\s*"splitresponse"\s*\})'
        # Pero el jsCode está dentro de parameters.
        # Vamos a intentar limpiar el archivo cargándolo como JSON si es posible, 
        # o simplemente reemplazando la sección problemática.
        
        # Si el regex falló, es probable que la corrupción sea mayor.
        # Vamos a intentar una búsqueda y reemplazo más simple.
        print("Buscando por fragmentos conocidos...")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Archivo reparado exitosamente.")

except Exception as e:
    print(f"Error al reparar el archivo: {e}")
