
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.ts';
import { LogIn, UserPlus, Mail, Lock, Loader2, ShieldCheck, Zap } from 'lucide-react';

interface LoginPageProps {
  onSessionStarted: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSessionStarted }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase.from('settings').select('logo_url').single();
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    };
    fetchLogo();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (signUpError) throw signUpError;
        if (data.user) {
          await supabase.from('users').insert([{ id: data.user.id, name, email, role: 'ejecutivo', active: true }]);
        }
      }
      onSessionStarted();
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#8a3ab9] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#fcc669] rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          {/* Logo or branding */}
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-20 sm:h-24 object-contain mx-auto mb-4" />
          ) : (
            <>
              <div className="inline-flex p-3 rounded-2xl primary-gradient mb-4 shadow-xl shadow-red-500/10">
                <Zap size={24} className="text-white" />
              </div>
            </>
          )}
        </div>

        <div className="border p-6 rounded-3xl backdrop-blur-xl shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-1 rounded-xl mb-6 border flex" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isLogin ? 'shadow-sm' : ''}`} style={isLogin ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : { color: 'var(--text-tertiary)' }}>Ingresar</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'shadow-sm' : ''}`} style={!isLogin ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : { color: 'var(--text-tertiary)' }}>Registro</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-tertiary)' }}>Nombre Completo</label>
                <div className="relative">
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Juan Perez" className="w-full rounded-xl py-2.5 px-3 pl-10 focus:border-purple-500 outline-none transition-all text-[11px] font-bold" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  <LogIn className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-tertiary)' }}>Email Corporativo</label>
              <div className="relative">
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@tuempresa.com" className="w-full rounded-xl py-2.5 px-3 pl-10 focus:border-purple-500 outline-none transition-all text-[11px] font-bold" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Contraseña</label>
              </div>
              <div className="relative">
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl py-2.5 px-3 pl-10 focus:border-purple-500 outline-none transition-all text-[11px] font-bold" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] font-black text-rose-500 uppercase tracking-widest text-center">{error}</div>}
            <button disabled={loading} className="w-full py-3 primary-gradient rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-red-500/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? <LogIn size={16} /> : <UserPlus size={16} />)}
              {isLogin ? 'Acceder al Sistema' : 'Crear Cuenta'}
            </button>
          </form>
        </div>

        <div className="mt-8 flex justify-center items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Supabase Protected</span></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;