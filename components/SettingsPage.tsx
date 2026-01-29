
import React, { useState, useEffect } from 'react';
import {
  Building,
  Bot,
  Shield,
  Save,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Upload,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  Database,
  Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface SettingsPageProps {
  onSettingsUpdate?: (settings: any) => void;
  initialSettings?: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsUpdate, initialSettings }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Default settings structure
  const defaultSettings = {
    company_name: 'Prex CRM',
    company_email: 'contacto@prexcrm.com',
    currency: 'USD',
    website: 'www.prexcrm.com',
    logo_url: '',
    chatbot_global: true,
    chatbot_instruction: 'Eres un asistente experto en ventas inmobiliarias...',
    webhook_url: '',
    evolution_api_url: '',
    evolution_api_key: '',
    evolution_instance_name: 'CRM_Instance',
    ai_provider: 'gemini',
    gemini_api_key: '',
    openai_api_key: '',
    groq_api_key: ''
  };

  const [settings, setSettings] = useState<any>(() => ({
    ...defaultSettings,
    ...initialSettings
  }));

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error' | null>(null);
  const [isFetchingQr, setIsFetchingQr] = useState(false);

  // Merge initialSettings when they change (from parent/database)
  useEffect(() => {
    if (initialSettings) {
      setSettings((prev: any) => ({
        ...defaultSettings,
        ...initialSettings,
        // Preserve any unsaved local changes
        ...(hasUnsavedChanges ? prev : {})
      }));
    }
  }, [initialSettings]);

  // Track unsaved changes
  const updateSettings = (newValues: any) => {
    setSettings((prev: any) => ({ ...prev, ...newValues }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert([settings], { onConflict: 'id' });
      if (error) throw error;
      if (onSettingsUpdate) onSettingsUpdate(settings);
      setHasUnsavedChanges(false);
      alert('Sincronización exitosa con la nube');
    } catch (err) {
      console.error(err);
      alert('Error al persistir cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else {
      alert('Contraseña actualizada correctamente');
      setNewPassword('');
    }
    setIsSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('El archivo es demasiado grande (Máx 1MB)');
      return;
    }

    setIsSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('El bucket "assets" no existe en Supabase. Por favor, créalo con acceso público.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath);
      const updatedSettings = { ...settings, logo_url: publicUrl };
      setSettings(updatedSettings);
      if (onSettingsUpdate) onSettingsUpdate(updatedSettings);
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert(`Error al subir logo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchQrCode = async () => {
    if (!settings.evolution_api_url || !settings.evolution_api_key || !settings.evolution_instance_name) {
      alert('Por favor completa la URL, API Key y Nombre de Instancia primero.');
      return;
    }

    setIsFetchingQr(true);
    setQrCode(null);
    setInstanceStatus(null);

    try {
      // First check if instance exists
      const statusRes = await fetch(`${settings.evolution_api_url}/instance/connectionState/${settings.evolution_instance_name}`, {
        headers: { 'apikey': settings.evolution_api_key }
      });

      if (!statusRes.ok) {
        if (statusRes.status === 404) {
          throw new Error('La instancia no existe. Primero haz clic en "Crear Instancia".');
        }
        throw new Error(`Error de conexión: ${statusRes.status} ${statusRes.statusText}`);
      }

      const statusData = await statusRes.json();

      if (statusData.instance?.state === 'open') {
        setInstanceStatus('connected');
        alert('✅ ¡La instancia ya está conectada a WhatsApp!');
        return;
      }

      // Try to get QR code
      const qrRes = await fetch(`${settings.evolution_api_url}/instance/connect/${settings.evolution_instance_name}`, {
        headers: { 'apikey': settings.evolution_api_key }
      });

      if (!qrRes.ok) {
        throw new Error(`Error al conectar: ${qrRes.status} ${qrRes.statusText}`);
      }

      const qrData = await qrRes.json();

      if (qrData.base64) {
        setQrCode(qrData.base64);
        setInstanceStatus('connecting');
      } else if (qrData.code) {
        // Some versions return code instead of base64
        setQrCode(`data:image/png;base64,${qrData.code}`);
        setInstanceStatus('connecting');
      } else {
        throw new Error('No se recibió código QR. La instancia puede estar en proceso de conexión.');
      }
    } catch (err: any) {
      console.error('Evolution API Error:', err);
      const message = err.message.includes('Failed to fetch')
        ? 'No se pudo conectar al servidor. Verifica:\n1. Que la URL sea correcta\n2. Que el servidor esté activo\n3. Que permita CORS desde localhost'
        : err.message;
      alert(`❌ Error: ${message}`);
      setInstanceStatus('error');
    } finally {
      setIsFetchingQr(false);
    }
  };

  const createEvolutionInstance = async () => {
    if (!settings.evolution_api_url || !settings.evolution_api_key || !settings.evolution_instance_name) {
      alert('Completa los datos de conexión primero.');
      return;
    }

    setIsSaving(true);
    setInstanceStatus(null);

    try {
      // Check if instance already exists
      const checkRes = await fetch(`${settings.evolution_api_url}/instance/connectionState/${settings.evolution_instance_name}`, {
        headers: { 'apikey': settings.evolution_api_key }
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.instance) {
          alert('ℹ️ La instancia ya existe. Puedes generar el QR directamente.');
          return;
        }
      }

      // Create new instance - try v2 format first
      const res = await fetch(`${settings.evolution_api_url}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.evolution_api_key
        },
        body: JSON.stringify({
          instanceName: settings.evolution_instance_name,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: true,
          reject_call: false,
          webhook: settings.webhook_url || undefined,
          webhookByEvents: false
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.instance || data.hash) {
        alert('✅ Instancia creada con éxito. Ahora haz clic en "Generar QR" para conectar WhatsApp.');

        // If QR was returned, show it
        if (data.qrcode?.base64) {
          setQrCode(data.qrcode.base64);
          setInstanceStatus('connecting');
        }
      } else {
        throw new Error(data.message || 'Respuesta inesperada del servidor');
      }
    } catch (err: any) {
      console.error('Evolution Create Error:', err);
      const message = err.message.includes('Failed to fetch')
        ? 'No se pudo conectar al servidor. Verifica la URL y que el servidor esté activo.'
        : err.message;
      alert(`❌ Error al crear instancia: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Inmobiliaria', icon: Building },
    { id: 'automation', label: 'Automatización', icon: Bot },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nombre de Marca</span>
                <input type="text" value={settings.company_name} onChange={e => setSettings({ ...settings, company_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:border-purple-500 outline-none transition-all text-[11px] font-semibold text-slate-200" />
              </label>
              <label className="block space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Email de Contacto</span>
                <input type="email" value={settings.company_email} onChange={e => setSettings({ ...settings, company_email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:border-purple-500 outline-none transition-all text-[11px] font-semibold text-slate-200" />
              </label>
              <label className="block space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Divisa Predeterminada</span>
                <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-[11px] font-bold uppercase text-slate-400 outline-none">
                  <option value="USD">Dólares (USD)</option>
                  <option value="PEN">Soles (PEN)</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sitio Web Oficial</span>
                <input type="text" value={settings.website} onChange={e => setSettings({ ...settings, website: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:border-purple-500 outline-none transition-all text-[11px] font-semibold text-slate-200" />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800/50">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Identidad Visual</h4>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative group overflow-hidden shadow-inner">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} className="w-full h-full object-contain p-2" alt="Logo" />
                  ) : (
                    <Building className="text-slate-800" size={20} />
                  )}
                  <label className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                    <Upload size={14} className="text-purple-400 mb-1" />
                    <span className="text-[7px] font-bold text-white uppercase">Cargar</span>
                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">Logo del Ecosistema</p>
                  <p className="text-[8px] text-slate-500 font-semibold leading-tight uppercase tracking-wider">Formato: PNG/SVG Transparente. Máx 1MB.</p>
                  {settings.logo_url && (
                    <button onClick={() => setSettings({ ...settings, logo_url: '' })} className="text-[8px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest mt-1">Eliminar Activo</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[9px] tracking-widest">
                <MessageSquare size={13} /> Integración WhatsApp Engine
              </div>
              <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3 shadow-inner">
                <label className="block space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Webhook URL (Sincronización de Mensajería)</span>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
                    <input
                      type="text"
                      placeholder="https://n8n.tu-instancia.com/webhook/..."
                      value={settings.webhook_url}
                      onChange={e => setSettings({ ...settings, webhook_url: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-[10px] font-bold text-purple-400 outline-none focus:border-purple-500"
                    />
                  </div>
                </label>
                <p className="text-[8px] text-slate-600 font-semibold uppercase tracking-wider leading-relaxed">Conecta tu pipeline de WhatsApp para automatizar la captura de leads desde anuncios o chats orgánicos.</p>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[9px] tracking-widest">
                  <Globe size={13} /> Evolution API (WhatsApp QR)
                </div>
                {instanceStatus === 'connected' && (
                  <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                    <CheckCircle2 size={10} /> Conectado
                  </span>
                )}
              </div>

              <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">URL de Evolution API</span>
                    <input type="text" value={settings.evolution_api_url} onChange={e => setSettings({ ...settings, evolution_api_url: e.target.value })} placeholder="https://api.tu-servidor.com" className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-bold text-slate-300 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">API Global Key</span>
                    <input type="password" value={settings.evolution_api_key} onChange={e => setSettings({ ...settings, evolution_api_key: e.target.value })} placeholder="Tu API Key" className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-bold text-slate-300 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nombre de Instancia</span>
                    <input type="text" value={settings.evolution_instance_name} onChange={e => setSettings({ ...settings, evolution_instance_name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-bold text-slate-300 outline-none focus:border-indigo-500" />
                  </label>
                  <div className="flex items-end gap-2">
                    <button onClick={createEvolutionInstance} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Crear Instancia</button>
                    <button onClick={fetchQrCode} disabled={isFetchingQr} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10">
                      {isFetchingQr ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      {isFetchingQr ? 'Cargando...' : 'Generar QR'}
                    </button>
                  </div>
                </div>

                {qrCode && (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl mt-2 animate-in zoom-in duration-300 shadow-2xl">
                    <img src={qrCode} alt="WhatsApp QR" className="w-48 h-48" />
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-3">Escanea con tu WhatsApp</p>
                    <p className="text-[8px] text-slate-400 mt-1">Sincronización automática con n8n una vez conectado.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-800/50">
              <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-[9px] tracking-widest">
                <Bot size={13} /> Configuración de Inteligencia Artificial
              </div>
              <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-4 shadow-inner">
                {/* AI Provider Selector */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Proveedor de IA para Análisis</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, ai_provider: 'gemini' })}
                      className={`p-3 rounded-xl border text-center transition-all ${settings.ai_provider === 'gemini'
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-tight">Gemini</div>
                      <div className="text-[7px] font-bold uppercase tracking-widest mt-0.5 opacity-60">Google • Gratis</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, ai_provider: 'groq' })}
                      className={`p-3 rounded-xl border text-center transition-all ${settings.ai_provider === 'groq'
                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-tight">Groq</div>
                      <div className="text-[7px] font-bold uppercase tracking-widest mt-0.5 opacity-60">Llama • Gratis</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, ai_provider: 'openai' })}
                      className={`p-3 rounded-xl border text-center transition-all ${settings.ai_provider === 'openai'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-tight">GPT-4</div>
                      <div className="text-[7px] font-bold uppercase tracking-widest mt-0.5 opacity-60">OpenAI • Premium</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, ai_provider: 'disabled' })}
                      className={`p-3 rounded-xl border text-center transition-all ${settings.ai_provider === 'disabled'
                        ? 'bg-slate-700/30 border-slate-600/50 text-slate-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-tight">Desactivado</div>
                      <div className="text-[7px] font-bold uppercase tracking-widest mt-0.5 opacity-60">Sin IA</div>
                    </button>
                  </div>
                </div>

                {/* Gemini API Key */}
                {settings.ai_provider === 'gemini' && (
                  <label className="block space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                      <KeyRound size={10} /> API Key de Google Gemini
                    </span>
                    <input
                      type="password"
                      placeholder="AIza..."
                      value={settings.gemini_api_key || ''}
                      onChange={e => setSettings({ ...settings, gemini_api_key: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-bold text-blue-400 outline-none focus:border-blue-500"
                    />
                    <p className="text-[8px] text-slate-600 font-semibold">
                      Obtén tu API Key gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
                    </p>
                  </label>
                )}

                {/* OpenAI API Key */}
                {settings.ai_provider === 'openai' && (
                  <label className="block space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <KeyRound size={10} /> API Key de OpenAI
                    </span>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={settings.openai_api_key || ''}
                      onChange={e => setSettings({ ...settings, openai_api_key: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-bold text-emerald-400 outline-none focus:border-emerald-500"
                    />
                    <p className="text-[8px] text-slate-600 font-semibold">
                      Obtén tu API Key en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">OpenAI Platform</a> • Costo ~$0.03/análisis
                    </p>
                  </label>
                )}

                {/* Groq API Key */}
                {settings.ai_provider === 'groq' && (
                  <label className="block space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1">
                      <KeyRound size={10} /> API Key de Groq
                    </span>
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={settings.groq_api_key || ''}
                      onChange={e => setSettings({ ...settings, groq_api_key: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-bold text-orange-400 outline-none focus:border-orange-500"
                    />
                    <p className="text-[8px] text-slate-600 font-semibold">
                      Obtén tu API Key gratis en <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Groq Console</a> • 100% Gratis + Ultra rápido
                    </p>
                  </label>
                )}

                {/* Disabled state */}
                {settings.ai_provider === 'disabled' && (
                  <div className="text-center py-4 animate-in fade-in duration-300">
                    <p className="text-[10px] text-slate-500 font-medium">El análisis con IA está desactivado</p>
                    <p className="text-[8px] text-slate-600 mt-1">Selecciona un proveedor para habilitar el análisis inteligente de leads</p>
                  </div>
                )}

                {/* Chatbot Toggle */}
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-800 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-200 uppercase tracking-tight">Chatbot Habilitado Globalmente</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Control maestro de IA para nuevos ingresos.</p>
                  </div>
                  <button onClick={() => setSettings({ ...settings, chatbot_global: !settings.chatbot_global })} className={`w-8 h-4 rounded-full relative transition-colors ${settings.chatbot_global ? 'bg-purple-600' : 'bg-slate-800'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.chatbot_global ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* System Prompt */}
                <label className="block space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">System Prompt (Personalidad del Asesor Virtual)</span>
                  <textarea
                    rows={4}
                    value={settings.chatbot_instruction}
                    onChange={e => setSettings({ ...settings, chatbot_instruction: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-3 text-[10px] font-semibold focus:border-purple-500 outline-none transition-all resize-none text-slate-300 leading-relaxed"
                    placeholder="Instrucciones detalladas para que la IA sepa cómo responder..."
                  />
                </label>
              </div>
            </section>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <section className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl shadow-inner">
              <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-[9px] tracking-widest mb-4">
                <KeyRound size={13} /> Credenciales de Acceso
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Nueva Contraseña</span>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-10 text-[10px] font-bold text-white focus:border-purple-500 outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </label>
                <button type="submit" disabled={!newPassword || isSaving} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">Sincronizar Password</button>
              </form>
            </section>

            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[9px] tracking-widest mb-3">
                <Database size={13} /> Auditoría e Infraestructura
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Base de Datos</span>
                  <span className="text-slate-300 font-bold">Supabase PostgreSQL v15</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Políticas RLS</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> ACTIVAS</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Auth Protocol</span>
                  <span className="text-slate-300 font-bold">JWT / OAuth 2.0</span>
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-in fade-in duration-500 min-h-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight uppercase">Configuración <span className="primary-gradient-text">Ecosistema</span></h1>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] opacity-60 leading-none mt-1">Gobernanza de recursos SaaS</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className={`px-5 py-2.5 primary-gradient rounded-xl text-[9px] font-bold text-white transition-all flex items-center gap-2 shadow-xl shadow-purple-500/20 ${isSaving ? 'opacity-70 scale-95' : 'hover:opacity-90 active:scale-95'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          {isSaving ? 'SINCRONIZANDO...' : 'SINC. CLOUD SETTINGS'}
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <aside className="w-full md:w-48 space-y-1.5 shrink-0">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all border text-[9px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-xl shadow-purple-500/5' : 'bg-slate-900/20 border-transparent text-slate-500 hover:bg-slate-900/40 hover:text-slate-300'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 bg-slate-900/20 border border-slate-900/50 p-6 rounded-[2rem] flex flex-col min-h-0 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            {activeTab === 'general' && <Building size={120} />}
            {activeTab === 'automation' && <Bot size={120} />}
            {activeTab === 'security' && <Shield size={120} />}
          </div>
          <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
