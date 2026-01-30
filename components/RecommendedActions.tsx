
import React, { useState, useEffect } from 'react';
import { AppState } from '../types.ts';
import { Phone, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RecommendedActionsProps {
  state: AppState;
  onActionClick: (type: string, id: string) => void;
}

interface AISettings {
  ai_provider: 'gemini' | 'openai' | 'groq' | 'disabled';
  gemini_api_key?: string;
  openai_api_key?: string;
  groq_api_key?: string;
}

interface Recommendation {
  action: string;
  reason: string;
  type: 'call' | 'follow-up' | 'planning';
  reference_id: string;
}

const actionIcons: { [key: string]: React.ElementType } = {
  call: Phone,
  'follow-up': TrendingUp,
  planning: Zap,
};

interface ActionCardProps {
  action: string;
  reason: string;
  type: string;
  reference_id: string;
  onClick: (type: string, id: string) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, reason, type, reference_id, onClick }) => {
  const Icon = actionIcons[type] || Zap;
  return (
    <div
      onClick={() => onClick(type, reference_id)}
      className="border p-4 rounded-xl flex items-start gap-4 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="p-2.5 border rounded-lg text-amber-400 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <Icon size={16} />
      </div>
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{action}</h4>
        <p className="text-[9px] font-semibold leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>{reason}</p>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="border p-4 rounded-xl flex items-start gap-4 animate-pulse" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
    <div className="w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
    <div className="flex-1 space-y-2">
      <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
      <div className="h-2 rounded w-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
      <div className="h-2 rounded w-1/2" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
    </div>
  </div>
);


const RecommendedActions: React.FC<RecommendedActionsProps> = ({ state, onActionClick }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);

  // Load AI settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('ai_provider, gemini_api_key, openai_api_key, groq_api_key')
          .maybeSingle();

        setAiSettings(data || { ai_provider: 'disabled' });
      } catch (err) {
        console.error('Error loading AI settings:', err);
        setAiSettings({ ai_provider: 'disabled' });
      }
    };
    fetchSettings();
  }, []);

  // Fetch recommendations when settings are loaded
  useEffect(() => {
    if (!aiSettings) return;

    const fetchRecommendations = async () => {
      setLoading(true);

      // If AI is disabled, show default recommendations
      if (aiSettings.ai_provider === 'disabled') {
        setRecommendations([
          { action: "Revisar leads nuevos", reason: "El primer contacto es clave para la conversión.", type: "planning", reference_id: "" },
          { action: "Atender tareas vencidas", reason: "Evita perder oportunidades por falta de seguimiento.", type: "follow-up", reference_id: "" },
          { action: "Contactar prospectos calificados", reason: "Mantén el momentum con los leads más prometedores.", type: "call", reference_id: "" },
        ]);
        setLoading(false);
        return;
      }

      // Get API key based on provider
      const apiKey = aiSettings.ai_provider === 'openai'
        ? aiSettings.openai_api_key
        : aiSettings.ai_provider === 'groq'
          ? aiSettings.groq_api_key
          : aiSettings.gemini_api_key;

      if (!apiKey) {
        console.warn('No API key configured for', aiSettings.ai_provider);
        setRecommendations([
          { action: "Configurar API Key", reason: `Configura tu ${aiSettings.ai_provider} API key en Configuración.`, type: "planning", reference_id: "" },
          { action: "Revisar leads nuevos", reason: "El primer contacto es clave.", type: "planning", reference_id: "" },
          { action: "Contactar leads activos", reason: "Mantén contacto con tus prospectos.", type: "call", reference_id: "" },
        ]);
        setLoading(false);
        return;
      }

      try {
        const recs = await getDailyRecommendations(state.leads, state.tasks, aiSettings.ai_provider, apiKey);
        setRecommendations(recs);
      } catch (err) {
        console.error('Error getting recommendations:', err);
        // Fallback to default recommendations
        setRecommendations([
          { action: "Revisar leads nuevos", reason: "El primer contacto es clave para la conversión.", type: "planning", reference_id: "" },
          { action: "Atender tareas vencidas", reason: "Evita perder oportunidades.", type: "follow-up", reference_id: "" },
          { action: "Contactar prospectos calificados", reason: "Mantén el momentum.", type: "call", reference_id: "" },
        ]);
      }
      setLoading(false);
    };

    fetchRecommendations();
  }, [aiSettings, state.leads, state.tasks]);

  return (
    <section className="mb-4 animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-amber-400" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>Acciones Recomendadas para Hoy</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          recommendations.map((rec, index) => (
            <ActionCard key={index} action={rec.action} reason={rec.reason} type={rec.type} reference_id={rec.reference_id} onClick={onActionClick} />
          ))
        )}
      </div>
    </section>
  );
};

// Function to get daily recommendations from the configured AI provider
const getDailyRecommendations = async (
  leads: any[],
  tasks: any[],
  provider: 'gemini' | 'openai' | 'groq',
  apiKey: string
): Promise<Recommendation[]> => {
  const recentLeads = leads.slice(0, 10).map(l => ({ id: l.id, name: l.name, budget: l.budget, created_at: l.created_at, pipeline_stage_id: l.pipeline_stage_id }));
  const pendingTasks = tasks.filter(t => t.status === 'pendiente' || t.status === 'vencido').slice(0, 10).map(t => ({ id: t.id, description: t.description, datetime: t.datetime, status: t.status }));

  const prompt = `Eres un coach de ventas inmobiliario experto. Analiza los siguientes datos y recomienda las 3 acciones más impactantes que el asesor debe tomar HOY para maximizar sus ventas.

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
- "reference_id": El ID (UUID) del lead o la tarea relacionada.

Responde SOLO con el JSON, sin texto adicional.`;

  let response: Response;

  if (provider === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en ventas inmobiliarias. Responde siempre en JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '[]';
    return JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]');

  } else if (provider === 'groq') {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Eres un experto en ventas inmobiliarias. Responde siempre en JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) throw new Error(`Groq error: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '[]';
    return JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]');

  } else {
    // Gemini
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });

    const modelsToTry = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    for (const model of modelsToTry) {
      try {
        const result = await genAI.models.generateContent({
          model,
          contents: prompt,
        });

        const text = result.text || '[]';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn(`Model ${model} failed, trying next...`);
        continue;
      }
    }
    throw new Error('All Gemini models failed');
  }
};

export default RecommendedActions;