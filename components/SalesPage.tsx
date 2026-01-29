
import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Search, DollarSign, Plus, Edit2, Trash2, Wallet, ArrowUpCircle, X, Coins, ArrowRightLeft, Landmark, Zap, CheckCircle2, User, Building2, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import { AppState, Sale, IncomeExpense, Lead } from '../types';
import RegisterSaleModal from './RegisterSaleModal';

interface SalesPageProps {
  state: AppState;
  onAddSale: (sale: Partial<Sale>) => void;
  onUpdateSale: (id: string, sale: Partial<Sale>) => void;
  onDeleteSale: (id: string) => void;
  onAddCashMovement: (movement: Partial<IncomeExpense>) => void;
  onDeleteCashMovement: (id: string) => void;
}

const getISODate = (date: Date) => date.toISOString().split('T')[0];

const SalesPage: React.FC<SalesPageProps> = ({ state, onAddSale, onUpdateSale, onDeleteSale, onAddCashMovement, onDeleteCashMovement }) => {
  const [activeSubTab, setActiveSubTab] = useState<'cierres' | 'caja'>('cierres');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [prefilledLead, setPrefilledLead] = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return getISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return getISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  });

  const leadsInNegotiation = state.leads.filter(l => l.pipeline_stage_id === '4');

  const filteredSales = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return state.sales.filter(sale => {
      const lead = state.leads.find(l => l.id === sale.lead_id);
      const saleDate = new Date(sale.created_at);

      const matchesSearch = lead?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = saleDate >= start && saleDate <= end;

      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [state.sales, state.leads, searchTerm, startDate, endDate]);

  const filteredCash = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return state.income_expenses.filter(m => {
      const movementDate = new Date(m.created_at);
      const description = m.description || '';
      const category = m.category || '';
      const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) || category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = movementDate >= start && movementDate <= end;
      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [state.income_expenses, searchTerm, startDate, endDate]);

  // Calculate totals from SALES commissions (filtered by date range)
  const totalIncomePEN = filteredSales.reduce((acc, sale) => {
    const commInOrigin = (sale.sale_amount * (sale.commission_percentage || 0) / 100);
    const commPEN = sale.currency === 'PEN' ? commInOrigin : commInOrigin * (sale.exchange_rate || 3.75);
    return acc + commPEN;
  }, 0);

  const totalExpensePEN = filteredCash
    .filter(m => m.type === 'egreso')
    .reduce((acc, m) => acc + m.amount_pen, 0);

  const balancePEN = totalIncomePEN - totalExpensePEN;

  const resetFilters = () => {
    setSearchTerm('');
    const now = new Date();
    setStartDate(getISODate(new Date(now.getFullYear(), now.getMonth(), 1)));
    setEndDate(getISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  };


  const handleQuickConfirm = (lead: Lead) => {
    setPrefilledLead(lead);
    setIsSaleModalOpen(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    const lead = state.leads.find(l => l.id === sale.lead_id);
    if (window.confirm(`¿Seguro que quieres eliminar la venta de ${lead?.name}?`)) {
      onDeleteSale(sale.id);
    }
  };

  const handleDeleteCash = (movement: IncomeExpense) => {
    if (window.confirm(`¿Seguro que quieres eliminar el movimiento "${movement.description}"?`)) {
      onDeleteCashMovement(movement.id);
    }
  };


  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-1">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight uppercase">Control <span className="primary-gradient-text">Financiero PEN</span></h1>
          <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-60 leading-none">Análisis consolidado</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-lg">
          <button onClick={() => setActiveSubTab('cierres')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'cierres' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Cierres</button>
          <button onClick={() => setActiveSubTab('caja')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'caja' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Caja (PEN)</button>
        </div>
      </header>

      {leadsInNegotiation.length > 0 && activeSubTab === 'cierres' && (
        <section className="animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={10} className="text-amber-500 animate-pulse" />
            <h3 className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Leads en Negociación</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {leadsInNegotiation.map(lead => (
              <div key={lead.id} className="min-w-[220px] bg-slate-900 border border-slate-800 p-3 rounded-xl hover:border-amber-500/30 transition-all group relative overflow-hidden shadow-xl">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-100 uppercase truncate max-w-[140px]">{lead.name}</h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{lead.budget_currency === 'USD' ? '$' : 'S/'} {lead.budget.toLocaleString()}</p>
                  </div>
                  <User size={12} className="text-slate-700" />
                </div>
                <button
                  onClick={() => handleQuickConfirm(lead)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg"
                >
                  Confirmar Cierre
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-xl border-l-4 border-l-indigo-500 shadow-xl backdrop-blur-sm">
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Caja Neta Consolidada</p>
          <p className="text-xl font-bold text-white tracking-tighter">S/ {balancePEN.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 text-emerald-400 text-[8px] mt-0.5 font-bold uppercase">
            <TrendingUp size={10} /> <span>Utilidad Operativa</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-xl shadow-xl backdrop-blur-sm">
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Ingresos (Comisiones)</p>
          <p className="text-lg font-bold text-emerald-400 tracking-tighter">S/ {totalIncomePEN.toLocaleString()}</p>
          <p className="text-slate-600 text-[8px] mt-0.5 font-bold uppercase tracking-widest">Tipo de Cambio Actual</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-xl shadow-xl border-r-4 border-r-rose-500 backdrop-blur-sm">
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Egresos / Gastos</p>
          <p className="text-lg font-bold text-rose-400 tracking-tighter">S/ {totalExpensePEN.toLocaleString()}</p>
          <p className="text-slate-600 text-[8px] mt-0.5 font-bold uppercase tracking-widest">Marketing y Operativo</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-2 border-b border-slate-800 flex flex-wrap gap-2 items-center justify-between bg-slate-900/40">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 outline-none text-[10px] font-semibold text-slate-200 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-white'}`}>
              <SlidersHorizontal size={14} />
            </button>
            <button
              onClick={() => {
                setPrefilledLead(null);
                activeSubTab === 'cierres' ? setIsSaleModalOpen(true) : setIsCashModalOpen(true);
              }}
              className="px-4 py-1.5 primary-gradient rounded-lg text-[9px] font-bold text-white hover:opacity-90 flex items-center gap-2 uppercase tracking-widest shadow-lg"
            >
              <Plus size={14} /> {activeSubTab === 'cierres' ? 'Cierre' : 'Movimiento'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-3 bg-slate-900/20 border-b border-slate-800 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest pl-1">Desde</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-200 outline-none [color-scheme:dark]" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hasta</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-200 outline-none [color-scheme:dark]" />
              </div>
              <div className="flex items-end">
                <button onClick={resetFilters} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  <RotateCcw size={12} />
                  Resetear Mes
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {activeSubTab === 'cierres' ? (
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="bg-slate-900 text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Prospecto / Unidad</th>
                  <th className="px-4 py-3">Monto Venta</th>
                  <th className="px-4 py-3">Comisión %</th>
                  <th className="px-4 py-3">Utilidad PEN</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredSales.map((sale) => {
                  const lead = state.leads.find(l => l.id === sale.lead_id);
                  const currencySym = sale.currency === 'USD' ? '$' : 'S/';
                  const commInOrigin = (sale.sale_amount * (sale.commission_percentage || 0) / 100);
                  const utilPEN = sale.currency === 'PEN' ? commInOrigin : commInOrigin * (sale.exchange_rate || 3.75);

                  return (
                    <tr key={sale.id} className="hover:bg-indigo-500/5 transition-colors group">
                      <td className="px-4 py-2">
                        <p className="font-bold text-slate-400 text-[10px] whitespace-nowrap">{new Date(sale.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-2">
                        <p className="font-bold text-slate-100 uppercase leading-none text-[11px] truncate max-w-[150px]">{lead?.name || 'S/N'}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">ID: {sale.id.slice(0, 6)}</p>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-bold text-slate-300 text-[11px]">{currencySym}{sale.sale_amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold text-[10px]">{sale.commission_percentage}%</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-[11px]">S/ {utilPEN.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-[7px] text-slate-600 font-bold uppercase leading-none mt-0.5">TC {sale.exchange_rate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingSale(sale); setIsSaleModalOpen(true); }} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-500 rounded border border-slate-700 transition-all"><Edit2 size={11} /></button>
                          <button onClick={() => handleDeleteSale(sale)} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded border border-slate-700 transition-all"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="bg-slate-900 text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-4 py-3">Fecha / Cat</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Importe</th>
                  <th className="px-4 py-3">Soles (PEN)</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredCash.map((m) => (
                  <tr key={m.id} className="hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-4 py-2">
                      <p className="text-[8px] text-slate-600 font-bold leading-none mb-1">{new Date(m.created_at).toLocaleDateString()}</p>
                      <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase ${m.type === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {m.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-slate-400 font-medium truncate max-w-[120px] text-[10px]">{m.description}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-bold text-[11px] ${m.type === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.currency === 'USD' ? '$' : 'S/'} {m.currency === 'USD' ? m.amount_usd.toLocaleString() : m.amount_pen.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-[11px]">S/ {m.amount_pen.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[7px] text-slate-700 font-bold uppercase leading-none mt-0.5">TC {m.exchange_rate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => handleDeleteCash(m)} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded border border-slate-700 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={11} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isSaleModalOpen && (
        <RegisterSaleModal
          state={state}
          initialData={editingSale || undefined}
          prefilledLead={prefilledLead || undefined}
          onClose={() => {
            setIsSaleModalOpen(false);
            setEditingSale(null);
            setPrefilledLead(null);
          }}
          onSave={(saleData) => {
            if (editingSale) onUpdateSale(editingSale.id, saleData);
            else onAddSale(saleData);
            setIsSaleModalOpen(false);
          }}
        />
      )}

      {isCashModalOpen && (
        <CashMovementModal
          onClose={() => setIsCashModalOpen(false)}
          onAdd={onAddCashMovement}
        />
      )}
    </div>
  );
};

const CashMovementModal = ({ onClose, onAdd }: any) => {
  const [data, setData] = useState({
    type: 'ingreso' as 'ingreso' | 'egreso',
    currency: 'USD' as 'USD' | 'PEN',
    category: 'Varios',
    description: '',
    amount_input: 0,
    exchange_rate: 3.75,
    created_at: new Date().toISOString().split('T')[0]
  });

  const getPenAmount = () => {
    return data.currency === 'USD' ? data.amount_input * data.exchange_rate : data.amount_input;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xs rounded-xl overflow-hidden shadow-2xl">
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-[10px] font-bold text-white uppercase tracking-widest">Nuevo Movimiento</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
        </header>
        <div className="p-4 space-y-3">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button onClick={() => setData({ ...data, type: 'ingreso' })} className={`flex-1 py-1.5 rounded-md text-[8px] font-bold uppercase transition-all ${data.type === 'ingreso' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Ingreso</button>
            <button onClick={() => setData({ ...data, type: 'egreso' })} className={`flex-1 py-1.5 rounded-md text-[8px] font-bold uppercase transition-all ${data.type === 'egreso' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}>Egreso</button>
          </div>

          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button onClick={() => setData({ ...data, currency: 'USD' })} className={`flex-1 py-1.5 rounded-md text-[8px] font-bold uppercase transition-all ${data.currency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>$ USD</button>
            <button onClick={() => setData({ ...data, currency: 'PEN' })} className={`flex-1 py-1.5 rounded-md text-[8px] font-bold uppercase transition-all ${data.currency === 'PEN' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>S/ PEN</button>
          </div>

          <div className="space-y-2">
            <input placeholder="Categoría" value={data.category} onChange={e => setData({ ...data, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-[10px] font-semibold text-slate-200 focus:border-indigo-500 outline-none" />
            <textarea placeholder="Descripción..." value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-[10px] h-14 resize-none text-slate-400 outline-none font-medium" />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[7px] font-bold text-slate-600 uppercase tracking-widest pl-1">Monto</label>
                <input type="number" value={data.amount_input} onChange={e => setData({ ...data, amount_input: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-[11px] font-bold text-white focus:border-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-bold text-slate-600 uppercase tracking-widest pl-1">T. Cambio</label>
                <input type="number" step="0.01" value={data.exchange_rate} onChange={e => setData({ ...data, exchange_rate: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-[11px] font-bold text-indigo-400 focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex flex-col items-center">
            <span className="text-[7px] font-bold text-indigo-400/60 uppercase mb-1 tracking-[0.2em]">Equivalente PEN</span>
            <span className="text-xl font-bold text-white tracking-tighter">S/ {getPenAmount().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <button
            onClick={() => {
              onAdd({
                type: data.type,
                category: data.category,
                description: data.description,
                amount_pen: getPenAmount(),
                amount_usd: data.currency === 'USD' ? data.amount_input : data.amount_input / data.exchange_rate,
                currency: data.currency,
                exchange_rate: data.exchange_rate,
                created_at: new Date(data.created_at).toISOString()
              });
              onClose();
            }}
            className="w-full py-2.5 primary-gradient rounded-lg text-white font-bold uppercase text-[9px] tracking-[0.1em] shadow-lg active:scale-95 transition-all"
          >
            Sincronizar Libro
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
