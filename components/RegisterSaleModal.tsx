import React, { useState, useEffect } from 'react';
import { X, DollarSign, User, Building, CheckCircle2, Percent, RefreshCcw, Landmark, ArrowRightLeft, Sparkles, Zap, UserCheck, Calendar } from 'lucide-react';
import { AppState, Sale, Lead, Property } from '../types';

interface RegisterSaleModalProps {
  state: AppState;
  initialData?: Sale;
  prefilledLead?: Lead;
  onClose: () => void;
  onSave: (sale: Partial<Sale>) => void;
}

const RegisterSaleModal: React.FC<RegisterSaleModalProps> = ({ state, initialData, prefilledLead, onClose, onSave }) => {
  const [selectedLeadId, setSelectedLeadId] = useState(initialData?.lead_id || prefilledLead?.id || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialData?.property_id || '');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(initialData?.advisor_id || prefilledLead?.advisor_id || '');
  const [amount, setAmount] = useState<number>(initialData?.sale_amount || prefilledLead?.budget || 0);
  const [currency, setCurrency] = useState<'USD' | 'PEN'>(initialData?.currency || prefilledLead?.budget_currency || 'USD');
  const [saleType, setSaleType] = useState<'completa' | 'compartida'>(initialData?.sale_type || 'completa');
  const [commissionPct, setCommissionPct] = useState<number>(initialData?.commission_percentage || 3);
  const [exchangeRate, setExchangeRate] = useState<number>(initialData?.exchange_rate || 3.75);
  const [date, setDate] = useState(initialData?.created_at ? new Date(initialData.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  // Se permite vender unidades disponibles o separadas
  const availableProperties = state.properties.filter(p =>
    p.status === 'disponible' || p.status === 'separado' || p.id === selectedPropertyId
  );

  useEffect(() => {
    if (initialData) {
      setSelectedLeadId(initialData.lead_id);
      setSelectedPropertyId(initialData.property_id);
      setSelectedAdvisorId(initialData.advisor_id);
      setAmount(initialData.sale_amount);
      setCurrency(initialData.currency);
      setSaleType(initialData.sale_type);
      setCommissionPct(initialData.commission_percentage || 3);
      setExchangeRate(initialData.exchange_rate || 3.75);
    } else if (prefilledLead) {
      setSelectedLeadId(prefilledLead.id);
      setSelectedAdvisorId(prefilledLead.advisor_id);
      setAmount(prefilledLead.budget);
      setCurrency(prefilledLead.budget_currency);
    }
  }, [initialData, prefilledLead]);

  const handleLeadChange = (id: string) => {
    setSelectedLeadId(id);
    const lead = state.leads.find(l => l.id === id);
    if (lead) {
      setSelectedAdvisorId(lead.advisor_id);
      setAmount(lead.budget);
      setCurrency(lead.budget_currency);
    }
  };

  const handlePropertyChange = (id: string) => {
    setSelectedPropertyId(id);
    const prop = state.properties.find(p => p.id === id);
    if (prop) {
      setAmount(prop.price);
      setCurrency(prop.currency);
    }
  };

  const isFormValid = selectedLeadId && selectedPropertyId && selectedAdvisorId && amount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const property = state.properties.find(p => p.id === selectedPropertyId);

    onSave({
      lead_id: selectedLeadId,
      property_id: selectedPropertyId,
      advisor_id: selectedAdvisorId,
      project_id: property?.project_id || '',
      sale_amount: amount,
      currency: currency,
      sale_type: saleType,
      commission_percentage: commissionPct,
      exchange_rate: exchangeRate,
      created_at: new Date(date).toISOString(),
    });
  };

  const commissionInOrigin = (amount * commissionPct) / 100;
  const estimatedCommissionPEN = currency === 'PEN' ? commissionInOrigin : commissionInOrigin * exchangeRate;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-color)' }}>
        <header className="p-5 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-amber-500" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-tighter italic" style={{ color: 'var(--text-primary)' }}>Confirmación de Cierre</h2>
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Operativa Supabase</p>
            </div>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Titular</label>
              <select required value={selectedLeadId} onChange={(e) => handleLeadChange(e.target.value)} className="w-full rounded-lg py-2 px-3 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="">Seleccionar Lead...</option>
                {state.leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Propiedad</label>
              <select required value={selectedPropertyId} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full rounded-lg py-2 px-3 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="">Asignar Unidad...</option>
                {availableProperties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.description} ({p.currency}) [{p.status?.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Asesor del Cierre</label>
              <select required value={selectedAdvisorId} onChange={(e) => setSelectedAdvisorId(e.target.value)} className="w-full rounded-lg py-2 px-3 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="">Seleccionar Asesor...</option>
                {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Fecha de Cierre</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg py-2 px-3 text-[10px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
          </div>


          <div className="grid grid-cols-4 gap-2 p-3 rounded-lg shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="space-y-1 col-span-2">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Precio Final</label>
              <div className="flex gap-1">
                <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="rounded-lg py-1 px-1 text-[8px] font-black uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <option value="USD">$</option>
                  <option value="PEN">S/</option>
                </select>
                <input type="number" required value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-lg py-1.5 px-2 text-[11px] font-black text-emerald-600 focus:border-emerald-500 outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Comm %</label>
              <input type="number" step="0.1" value={commissionPct} onChange={(e) => setCommissionPct(Number(e.target.value))} className="w-full rounded-lg py-1.5 px-2 text-[11px] font-black text-indigo-600 focus:border-indigo-500 outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }} />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>TC</label>
              <input type="number" step="0.01" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} className="w-full rounded-lg py-1.5 px-2 text-[11px] font-black focus:border-indigo-500 outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-indigo-500/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group" style={{ border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <ArrowRightLeft className="absolute -left-4 -top-4 text-amber-500/10" size={80} />
            <p className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1 z-10">Utilidad Estimada (PEN)</p>
            <span className="text-3xl font-black tracking-tighter z-10" style={{ color: 'var(--text-primary)' }}>S/ {estimatedCommissionPEN.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 primary-gradient rounded-lg text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${!isFormValid ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}
          >
            {/* FIX: The 'slabel' tag is not a standard HTML element and was causing a JSX error. Replaced with 'span' which is appropriate for this context. */}
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 size={14} />
              {initialData ? 'ACTUALIZAR CIERRE' : 'FINALIZAR Y CONFIRMAR'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterSaleModal;