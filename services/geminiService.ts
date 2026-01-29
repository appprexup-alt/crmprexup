
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Task } from '../types';

// Initialize GoogleGenAI inside functions to ensure it always uses the most up-to-date API key.

// Helper function to get API key from settings
const getApiKeyFromSettings = (): string | null => {
  try {
    const settingsStr = localStorage.getItem('settings');
    if (!settingsStr) return null;
    const settings = JSON.parse(settingsStr);
    return settings?.gemini_api_key || null;
  } catch {
    return null;
  }
};

export const getLeadInsight = async (leadData: any) => {
  const apiKey = getApiKeyFromSettings();

  if (!apiKey) {
    return "API Key no configurada. Ve a Configuración > Automatización.";
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: `Analiza este lead inmobiliario y dame un consejo rápido de venta: 
      Nombre: ${leadData.name}, Interés: ${leadData.interest}, Presupuesto: $${leadData.budget}.
      Responde en una frase motivadora y táctica.`,
    });
    // Directly access the .text property
    return response.text || "Listo para cerrar.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const status = error?.response?.status || error?.status || 404;
    const message = error?.message || 'Verifica tu API key';
    return `Error Gemini ${status}: ${message}`;
  }
};

export const suggestProperty = async (leadInterest: string, properties: any[]) => {
  const apiKey = getApiKeyFromSettings();
  if (!apiKey) return "";

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: `Basado en el interés: "${leadInterest}", elige la mejor propiedad de esta lista: ${JSON.stringify(properties)}. 
        Retorna solo el ID de la propiedad.`,
    });
    // Directly access the .text property
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
};

export const getDailyRecommendations = async (leads: Lead[], tasks: Task[]) => {
  const apiKey = getApiKeyFromSettings();
  if (!apiKey) {
    return [
      { action: "Revisar leads nuevos", reason: "API Key no configurada.", type: "planning", reference_id: "" },
      { action: "Configurar API", reason: "Configura tu Gemini API key en Configuración.", type: "planning", reference_id: "" },
      { action: "Contactar leads activos", reason: "Mantén contacto con tus prospectos.", type: "call", reference_id: "" },
    ];
  }

  const ai = new GoogleGenAI({ apiKey });

  // Filter for relevant data to keep the prompt efficient
  const recentLeads = leads.slice(0, 10).map(l => ({ id: l.id, name: l.name, budget: l.budget, created_at: l.created_at, pipeline_stage_id: l.pipeline_stage_id }));
  const pendingTasks = tasks.filter(t => t.status === 'pendiente' || t.status === 'vencido').slice(0, 10).map(t => ({ id: t.id, description: t.description, datetime: t.datetime, status: t.status }));

  const prompt = `
    Eres un coach de ventas inmobiliario experto para "Prex CRM". Analiza los siguientes datos y recomienda las 3 acciones más impactantes que el asesor debe tomar HOY para maximizar sus ventas.
    Prioriza:
    1. Leads nuevos sin contacto.
    2. Tareas vencidas o para hoy.
    3. Leads de alto valor en etapas de negociación.

    Leads Recientes: ${JSON.stringify(recentLeads)}
    Tareas Pendientes: ${JSON.stringify(pendingTasks)}

    Responde con un array JSON de exactamente 3 objetos. Cada objeto debe tener:
    - "action": Una frase corta y directa (ej: "Llamar a Carlos Sanchez").
    - "reason": Por qué es importante (ej: "Lead nuevo con alto presupuesto.").
    - "type": Una categoría de 'call', 'follow-up', o 'planning'.
    - "reference_id": El ID (UUID) del lead o la tarea relacionada (MUY IMPORTANTE).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              reason: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['call', 'follow-up', 'planning'] },
              reference_id: { type: Type.STRING },
            },
            required: ["action", "reason", "type", "reference_id"],
          },
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }
    const recommendations = JSON.parse(text);
    return recommendations.slice(0, 3); // Ensure only 3 are returned
  } catch (error) {
    console.error("Gemini Recommendations Error:", error);
    // Return a default set of actions on error
    return [
      { action: "Revisar leads nuevos", reason: "El primer contacto es clave para la conversión.", type: "planning", reference_id: "" },
      { action: "Atender tareas vencidas", reason: "Evita perder oportunidades por falta de seguimiento.", type: "follow-up", reference_id: "" },
      { action: "Contactar prospectos calificados", reason: "Mantén el momentum con los leads más prometedores.", type: "call", reference_id: "" },
    ];
  }
};
