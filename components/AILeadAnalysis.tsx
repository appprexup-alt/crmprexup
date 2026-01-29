import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, MessageSquare, RefreshCw, Zap, Target, ThumbsUp, ThumbsDown, Loader2, Settings } from 'lucide-react';
import { Lead, Message } from '../types';
import { supabase } from '../lib/supabase';

interface AIAnalysis {
    interest_score: number;
    buying_signals: string[];
    objections: string[];
    recommended_actions: string[];
    conversation_summary: string;
    urgency_level: 'baja' | 'media' | 'alta' | 'crítica';
    next_best_action: string;
    sentiment: 'positivo' | 'neutral' | 'negativo';
}

interface AISettings {
    ai_provider: 'gemini' | 'openai' | 'groq' | 'disabled';
    gemini_api_key?: string;
    openai_api_key?: string;
    groq_api_key?: string;
}

interface AILeadAnalysisProps {
    lead: Lead;
}

const AILeadAnalysis: React.FC<AILeadAnalysisProps> = ({ lead }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    // Fetch AI settings from database
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('settings')
                    .select('ai_provider, gemini_api_key, openai_api_key, groq_api_key')
                    .maybeSingle();

                if (fetchError) {
                    console.error('Error fetching AI settings:', fetchError);
                    throw fetchError;
                }

                setAiSettings(data || { ai_provider: 'gemini' });
            } catch (err: any) {
                console.error('Error fetching AI settings:', err);
                setAiSettings({ ai_provider: 'gemini' }); // Default to Gemini
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    // Fetch messages for this lead
    useEffect(() => {
        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('lead_id', lead.id)
                    .order('created_at', { ascending: true });

                if (fetchError) throw fetchError;
                setMessages(data || []);
            } catch (err: any) {
                console.error('Error fetching messages:', err);
                setError('No se pudieron cargar los mensajes');
            } finally {
                setLoadingMessages(false);
            }
        };

        if (lead.id) {
            fetchMessages();
        }
    }, [lead.id]);

    const buildPrompt = () => {
        const conversationText = messages.map(m =>
            `${m.direction === 'inbound' ? 'CLIENTE' : 'ASESOR'}: ${m.content}`
        ).join('\n');

        return `Eres un experto en ventas inmobiliarias. Analiza esta conversación de WhatsApp entre un asesor y un potencial comprador de inmuebles.

INFORMACIÓN DEL LEAD:
- Nombre: ${lead.name}
- Presupuesto: ${lead.budget_currency === 'USD' ? '$' : 'S/'} ${lead.budget?.toLocaleString() || 'No especificado'}
- Interés: ${lead.interest || 'No especificado'}

CONVERSACIÓN:
${conversationText}

Proporciona un análisis JSON con la siguiente estructura exacta (responde SOLO con el JSON, sin texto adicional):
{
  "interest_score": [número del 0 al 100 indicando probabilidad de compra],
  "buying_signals": [lista de señales positivas de compra detectadas, máximo 5],
  "objections": [lista de objeciones o preocupaciones del cliente, máximo 5],
  "recommended_actions": [lista de acciones específicas para cerrar la venta, máximo 4],
  "conversation_summary": "[resumen ejecutivo de 2-3 oraciones]",
  "urgency_level": "[baja/media/alta/crítica según la urgencia del lead]",
  "next_best_action": "[la acción más importante a realizar ahora]",
  "sentiment": "[positivo/neutral/negativo según el tono general]"
}`;
    };

    const analyzeWithGemini = async (apiKey: string) => {
        const prompt = buildPrompt();

        console.log('🌐 Using Google GenAI SDK...');

        try {
            // Import GoogleGenAI from the installed package
            const { GoogleGenAI } = await import('@google/genai');
            const genAI = new GoogleGenAI({ apiKey });

            // Try models in order of preference until one works
            const modelsToTry = [
                'gemini-1.5-flash-latest',
                'gemini-1.5-pro-latest',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-pro'
            ];

            let lastError: any = null;

            for (const modelName of modelsToTry) {
                try {
                    console.log(`🔄 Trying model: ${modelName}`);

                    const response = await genAI.models.generateContent({
                        model: modelName,
                        contents: prompt,
                    });

                    const textContent = response.text;

                    if (textContent) {
                        console.log(`✅ Success with model: ${modelName}`);
                        return textContent;
                    }
                } catch (err: any) {
                    console.warn(`❌ Model ${modelName} failed:`, err.message);
                    lastError = err;
                    continue; // Try next model
                }
            }

            // If all models failed, throw the last error
            throw lastError || new Error('No available Gemini models');

        } catch (error: any) {
            console.error('Gemini SDK Error:', error);
            throw new Error(`Error Gemini: ${error.message || 'Error desconocido'}`);
        }
    };

    const analyzeWithOpenAI = async (apiKey: string) => {
        const prompt = buildPrompt();

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Error OpenAI ${response.status}`);
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

        if (!textContent) {
            throw new Error('Respuesta vacía de OpenAI');
        }

        return textContent;
    };

    const analyzeWithGroq = async (apiKey: string) => {
        const prompt = buildPrompt();

        console.log('🚀 Using Groq API...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Llama 3.3 70B - el más reciente y potente
                messages: [
                    { role: 'system', content: 'Eres un experto en ventas inmobiliarias. Responde siempre en JSON válido.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', errorData);
            throw new Error(errorData.error?.message || `Error Groq ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Groq response received');
        const textContent = data.choices?.[0]?.message?.content;

        if (!textContent) {
            throw new Error('Respuesta vacía de Groq');
        }

        return textContent;
    };

    const runAnalysis = async () => {
        console.log('🔍 Starting AI Analysis...');
        console.log('AI Settings:', aiSettings);

        if (!aiSettings) {
            setError('Configuración de IA no cargada');
            return;
        }

        if (aiSettings.ai_provider === 'disabled') {
            setError('El análisis con IA está desactivado. Actívalo en Configuración.');
            return;
        }

        if (messages.length === 0) {
            setError('No hay mensajes para analizar');
            return;
        }

        const apiKey = aiSettings.ai_provider === 'openai'
            ? aiSettings.openai_api_key
            : aiSettings.ai_provider === 'groq'
                ? aiSettings.groq_api_key
                : aiSettings.gemini_api_key;

        console.log('🔑 API Key Check:', {
            provider: aiSettings.ai_provider,
            hasKey: !!apiKey,
            keyLength: apiKey?.length || 0,
            keyPrefix: apiKey?.substring(0, 10) || 'none'
        });

        if (!apiKey) {
            const providerName = aiSettings.ai_provider === 'openai' ? 'OpenAI'
                : aiSettings.ai_provider === 'groq' ? 'Groq'
                    : 'Gemini';
            setError(`API Key de ${providerName} no configurada. Ve a Configuración > Automatización.`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let textContent: string;

            if (aiSettings.ai_provider === 'openai') {
                textContent = await analyzeWithOpenAI(apiKey);
            } else if (aiSettings.ai_provider === 'groq') {
                textContent = await analyzeWithGroq(apiKey);
            } else {
                textContent = await analyzeWithGemini(apiKey);
            }

            // Extract JSON from response
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se pudo extraer JSON de la respuesta');
            }

            const analysisResult = JSON.parse(jsonMatch[0]) as AIAnalysis;
            setAnalysis(analysisResult);
        } catch (err: any) {
            console.error('Error analyzing:', err);
            setError(err.message || 'Error al analizar con IA');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-emerald-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 70) return 'from-emerald-500 to-emerald-600';
        if (score >= 40) return 'from-amber-500 to-amber-600';
        return 'from-rose-500 to-rose-600';
    };

    const getUrgencyConfig = (level: string) => {
        switch (level) {
            case 'crítica': return { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'CRÍTICA' };
            case 'alta': return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'ALTA' };
            case 'media': return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'MEDIA' };
            default: return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'BAJA' };
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positivo': return <ThumbsUp size={12} className="text-emerald-400" />;
            case 'negativo': return <ThumbsDown size={12} className="text-rose-400" />;
            default: return <Target size={12} className="text-slate-400" />;
        }
    };

    const getProviderBadge = () => {
        if (!aiSettings) return null;
        const config = {
            gemini: { label: 'Gemini', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
            openai: { label: 'GPT-4', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
            groq: { label: 'Groq', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
            disabled: { label: 'Desactivado', color: 'bg-slate-500/10 text-slate-500 border-slate-500/30' }
        };
        const c = config[aiSettings.ai_provider];
        return (
            <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded border ${c.color}`}>
                {c.label}
            </span>
        );
    };

    if (loadingMessages || loadingSettings) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 size={24} className="text-indigo-400 animate-spin mb-3" />
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {loadingSettings ? 'Cargando configuración...' : 'Cargando conversación...'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with action button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Análisis IA ({messages.length} mensajes)
                    </span>
                    {getProviderBadge()}
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={loading || messages.length === 0 || aiSettings?.ai_provider === 'disabled'}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${loading || messages.length === 0 || aiSettings?.ai_provider === 'disabled'
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={12} className="animate-spin" />
                            Analizando...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={12} />
                            {analysis ? 'Actualizar' : 'Analizar'}
                        </>
                    )}
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-[10px] font-medium flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {error}
                </div>
            )}

            {/* Disabled state */}
            {aiSettings?.ai_provider === 'disabled' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                    <Settings size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 font-medium">Análisis IA desactivado</p>
                    <p className="text-[8px] text-slate-600 mt-1">
                        Activa un proveedor en Configuración → Automatización
                    </p>
                </div>
            )}

            {/* No messages state */}
            {messages.length === 0 && !error && aiSettings?.ai_provider !== 'disabled' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                    <MessageSquare size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 font-medium">No hay mensajes registrados para este lead</p>
                    <p className="text-[8px] text-slate-600 mt-1">Los mensajes de WhatsApp aparecerán aquí</p>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-3 animate-in fade-in duration-500">
                    {/* Interest Score Card */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Potencial de Cierre</span>
                                <div className="flex items-center gap-2">
                                    {getSentimentIcon(analysis.sentiment)}
                                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${getUrgencyConfig(analysis.urgency_level).color}`}>
                                        Urgencia {getUrgencyConfig(analysis.urgency_level).label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <span className={`text-4xl font-black tracking-tighter ${getScoreColor(analysis.interest_score)}`}>
                                    {analysis.interest_score}%
                                </span>
                                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getScoreGradient(analysis.interest_score)} transition-all duration-1000`}
                                        style={{ width: `${analysis.interest_score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Best Action */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <Zap size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                                    Próxima Acción Recomendada
                                </span>
                                <p className="text-[11px] font-semibold text-white">{analysis.next_best_action}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <MessageSquare size={12} className="text-slate-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                                    Resumen de Conversación
                                </span>
                                <p className="text-[10px] text-slate-300 leading-relaxed">{analysis.conversation_summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Buying Signals & Objections Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Buying Signals */}
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={12} className="text-emerald-400" />
                                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
                                    Señales de Compra
                                </span>
                            </div>
                            <ul className="space-y-1.5">
                                {analysis.buying_signals.map((signal, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <span className="text-[9px] text-slate-300">{signal}</span>
                                    </li>
                                ))}
                                {analysis.buying_signals.length === 0 && (
                                    <li className="text-[9px] text-slate-600 italic">No detectadas</li>
                                )}
                            </ul>
                        </div>

                        {/* Objections */}
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={12} className="text-rose-400" />
                                <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">
                                    Objeciones
                                </span>
                            </div>
                            <ul className="space-y-1.5">
                                {analysis.objections.map((objection, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                        <span className="text-[9px] text-slate-300">{objection}</span>
                                    </li>
                                ))}
                                {analysis.objections.length === 0 && (
                                    <li className="text-[9px] text-slate-600 italic">No detectadas</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb size={12} className="text-amber-400" />
                            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">
                                Acciones para Cerrar
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {analysis.recommended_actions.map((action, i) => (
                                <div key={i} className="flex items-start gap-2 bg-slate-900/40 rounded-lg p-2">
                                    <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-[9px] text-slate-300">{action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Initial state - no analysis yet */}
            {!analysis && messages.length > 0 && !loading && !error && aiSettings?.ai_provider !== 'disabled' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                    <Brain size={32} className="text-indigo-500/50 mx-auto mb-3" />
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Análisis disponible</p>
                    <p className="text-[9px] text-slate-600">
                        Haz clic en "Analizar" para obtener insights de IA sobre este lead
                    </p>
                </div>
            )}
        </div>
    );
};

export default AILeadAnalysis;
