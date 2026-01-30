
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import KanbanBoard from './components/KanbanBoard.tsx';
import PropertiesPage from './components/PropertiesPage.tsx';
import SalesPage from './components/SalesPage.tsx';
import CalendarPage from './components/CalendarPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import AdminPage from './components/AdminPage.tsx';
import LoginPage from './components/LoginPage.tsx';
import AlarmModal from './components/AlarmModal.tsx';
import ConversationsPage from './components/ConversationsPage.tsx';
import NotificationManager from './components/NotificationManager.tsx';
import { MOCK_DATA } from './constants.tsx';
import { AppState, Lead, Sale, Task, Property, Project, User, IncomeExpense, PipelineStage, LeadSource } from './types.ts';
import { Search, Bell, User as UserIcon, Loader2, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';
import ThemeToggle from './components/ThemeToggle.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [state, setState] = useState<AppState>({ ...MOCK_DATA, income_expenses: [] });
  const [settings, setSettings] = useState<any>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preselectedLeadId, setPreselectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchInitialData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchInitialData();
      else setState({ ...MOCK_DATA, income_expenses: [] });
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [leads, projects, stages, users, properties, tasks, sales, cashflow, settingsData, leadSources] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('name', { ascending: true }),
        supabase.from('pipeline_stages').select('*').order('order', { ascending: true }),
        supabase.from('users').select('*'),
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('lead_tasks').select('*').order('datetime', { ascending: true }),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('income_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').single(),
        supabase.from('lead_sources').select('*').order('name', { ascending: true })
      ]);

      setUsingMockData(!!leads.error);
      setState({
        leads: leads.data || MOCK_DATA.leads,
        projects: projects.data || MOCK_DATA.projects,
        stages: stages.data || MOCK_DATA.stages,
        users: users.data || MOCK_DATA.users,
        properties: (properties.data || MOCK_DATA.properties).map((p: any) => ({ ...p, status: p.status || 'disponible' })),
        tasks: tasks.data || MOCK_DATA.tasks,
        sales: sales.data || MOCK_DATA.sales,
        income_expenses: cashflow.data || [],
        lead_sources: leadSources.data || MOCK_DATA.lead_sources
      });
      setSettings(settingsData.data || {});
    } catch (err) {
      console.error('Error loading data:', err);
      setUsingMockData(true);
      setState({ ...MOCK_DATA, income_expenses: [] });
    } finally { setLoading(false); }
  };

  const showFeedback = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(null), 4000); }
    else { setError(msg); setTimeout(() => setError(null), 5000); }
  };

  const handleCreateEntity = async (table: string, data: any, stateKeyOverride?: keyof AppState) => {
    // Robust data cleaning: remove empty IDs and transform empty strings to NULL
    const cleanedData = { ...data };
    if (cleanedData.id === '') delete cleanedData.id;

    // Remove metadata/calculated fields that Supabase shouldn't receive for new rows
    const keysToRemove = ['created_at', 'price_per_m2', 'last_message'];
    keysToRemove.forEach(k => delete cleanedData[k]);

    // Special handling for users table - remove password as it's not a column (auth handled separately)
    if (table === 'users') {
      delete cleanedData.password;
    }

    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '') cleanedData[key] = null;
    });

    const stateKey = stateKeyOverride || (table === 'lead_tasks' ? 'tasks' : table === 'income_expenses' ? 'income_expenses' : table === 'pipeline_stages' ? 'stages' : table === 'lead_sources' ? 'lead_sources' : table as keyof AppState);

    if (usingMockData) {
      const newItem = {
        ...cleanedData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      setState(prev => ({ ...prev, [stateKey]: [newItem, ...(prev[stateKey] as any)] }));
      return newItem;
    }

    try {
      console.log('Creating', table, 'with data:', cleanedData);
      const { data: ins, error: e } = await supabase.from(table).insert([cleanedData]).select().single();
      if (e) {
        console.error('Insert error from Supabase:', e);
        throw e;
      }
      setState(prev => ({ ...prev, [stateKey]: [ins, ...(prev[stateKey] as any)] }));
      showFeedback('Registro creado con éxito', 'success');
      return ins;
    } catch (e: any) {
      console.error('Insert Error - Full details:', JSON.stringify(e, null, 2));
      showFeedback(e.message, 'error');
      return null;
    }
  };

  const handleUpdateEntity = async (table: string, id: string, data: any, stateKeyOverride?: keyof AppState) => {
    const stateKey = stateKeyOverride || (table === 'lead_tasks' ? 'tasks' : table === 'income_expenses' ? 'income_expenses' : table === 'pipeline_stages' ? 'stages' : table as keyof AppState);
    if (usingMockData) {
      setState(prev => ({ ...prev, [stateKey]: (prev[stateKey] as any).map((i: any) => i.id === id ? { ...i, ...data } : i) }));
      return data;
    }
    try {
      // Remove read-only/generated fields
      const { id: _, created_at, updated_at, last_message, price_per_m2, ...dataToUpdate } = data;

      console.log('Updating', table, 'with ID:', id);
      console.log('Data to update:', dataToUpdate);

      const { data: upd, error: e } = await supabase
        .from(table)
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no rows match

      if (e) {
        console.error('Update error from Supabase:', e);
        throw e;
      }

      // If update was successful but no data returned, use the original data
      const updated = upd || { id, ...dataToUpdate };

      setState(prev => ({ ...prev, [stateKey]: (prev[stateKey] as any).map((i: any) => i.id === id ? updated : i) }));
      showFeedback('Actualizado correctamente', 'success');
      return updated;
    } catch (e: any) {
      console.error('Update Error - Full details:', JSON.stringify(e, null, 2));
      showFeedback(e.message || 'Error al actualizar', 'error');
      return null;
    }
  };

  const handleActionClick = (type: string, id: string) => {
    if (type === 'call' || type === 'follow-up') {
      const leadId = type === 'follow-up' ? state.tasks.find(t => t.id === id)?.lead_id : id;
      if (leadId) {
        setPreselectedLeadId(leadId);
        setActiveTab('leads');
      }
    } else {
      setActiveTab('tasks');
    }
  };

  const handleDeleteEntity = async (table: string, id: string, stateKeyOverride?: keyof AppState) => {
    const stateKey = stateKeyOverride || (table === 'lead_tasks' ? 'tasks' : table === 'income_expenses' ? 'income_expenses' : table === 'pipeline_stages' ? 'stages' : table as keyof AppState);
    const backup = [...(state[stateKey] as any)];

    // UI Optimista
    console.log('handleDeleteEntity triggered:', { table, id, stateKey });
    setState(prev => ({ ...prev, [stateKey]: (prev[stateKey] as any).filter((i: any) => i.id !== id) }));

    if (usingMockData) {
      showFeedback('Local: Eliminado', 'success');
      return;
    }

    try {
      const { error: e } = await supabase.from(table).delete().eq('id', id);
      if (e) throw e;
      showFeedback('Cloud: Eliminado', 'success');
    } catch (e: any) {
      setState(prev => ({ ...prev, [stateKey]: backup }));
      showFeedback(`Fallo: ${e.message}`, 'error');
    }
  };

  // ELIMINACIÓN RECURSIVA BLINDADA
  const handleDeleteLeadWithCheck = async (id: string) => {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;

    const associatedSales = state.sales.filter(s => s.lead_id === id);
    const confirmMsg = associatedSales.length > 0
      ? `¡ATENCIÓN! Este lead tiene ${associatedSales.length} ventas y registros financieros vinculados. ¿Deseas purgar TODO el historial de ${lead.name}?`
      : `¿Eliminar permanentemente a ${lead.name}?`;

    console.log('handleDeleteLeadWithCheck triggered:', id);
    if (!window.confirm(confirmMsg)) {
      console.log('Delete cancelled by user');
      return;
    }
    console.log('Delete confirmed, proceeding...');

    // Estado Optimista: Desaparece de la vista YA
    const prevStateBackup = { ...state };
    const saleIds = associatedSales.map(s => s.id);

    setState(prev => ({
      ...prev,
      leads: prev.leads.filter(l => l.id !== id),
      tasks: prev.tasks.filter(t => t.lead_id !== id),
      sales: prev.sales.filter(s => s.lead_id !== id),
      income_expenses: prev.income_expenses.filter(ie => !ie.sale_id || !saleIds.includes(ie.sale_id))
    }));

    if (usingMockData) return showFeedback('Purga local completada', 'success');

    try {
      // 1. Limpiar Caja vinculada a las ventas de este lead
      if (saleIds.length > 0) {
        await supabase.from('income_expenses').delete().in('sale_id', saleIds);
        // 2. Limpiar Ventas
        await supabase.from('sales').delete().eq('lead_id', id);
      }

      // 3. Limpiar Tareas
      await supabase.from('lead_tasks').delete().eq('lead_id', id);

      // 4. Limpiar Lead (Acción final)
      const { error: e } = await supabase.from('leads').delete().eq('id', id);
      if (e) throw e;

      showFeedback('Lead y registros vinculados purgados con éxito', 'success');
    } catch (e: any) {
      setState(prevStateBackup); // Restaurar si falla
      showFeedback(`Fallo en purga: ${e.message}`, 'error');
      console.error("Critical Delete Fail:", e);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}><Loader2 className="animate-spin text-purple-500" size={40} /></div>;
  if (!session && !usingMockData) return <LoginPage onSessionStarted={() => fetchInitialData()} />;

  return (
    <div className="flex min-h-screen overflow-hidden font-inter text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logoUrl={settings?.logo_url}
        companyName={settings?.company_name}
      />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'} relative min-w-0 h-screen flex flex-col pb-16 md:pb-0`}>

        <div className="fixed top-4 md:top-24 right-4 md:right-8 z-[999] space-y-2 pointer-events-none max-w-[calc(100vw-2rem)]">
          {error && <div className="p-3 md:p-4 bg-rose-600 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase pointer-events-auto shadow-2xl border border-white/10">{error}</div>}
          {success && <div className="p-3 md:p-4 bg-emerald-600 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase pointer-events-auto shadow-2xl border border-white/10">{success}</div>}
        </div>

        <header className="h-12 md:h-16 border-b backdrop-blur-md shrink-0 z-40 flex items-center justify-between px-3 md:px-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--header-bg)' }}>
          <div className="flex-1 max-w-sm relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={14} />
            <input type="text" placeholder="Buscar..." className="w-full rounded-lg py-1.5 pl-9 pr-3 outline-none text-[10px] md:text-[11px] font-bold" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            {usingMockData && (
              <div className="flex items-center gap-1.5 md:gap-2 bg-amber-500/10 text-amber-500 px-2 md:px-3 py-1 rounded-full border border-amber-500/20">
                <Database size={10} className="md:hidden" />
                <Database size={12} className="hidden md:block" />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Demo</span>
              </div>
            )}
            <ThemeToggle />
            <NotificationManager tasks={state.tasks} />
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <UserIcon size={14} className="md:hidden" />
              <UserIcon size={18} className="hidden md:block" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-hidden min-h-0 min-w-0">
          <div className="h-full p-3 md:p-4 lg:p-6 w-full flex flex-col min-h-0">
            {activeTab === 'dashboard' && <Dashboard state={state} onActionClick={handleActionClick} />}
            {activeTab === 'leads' && <KanbanBoard state={state} preselectedLeadId={preselectedLeadId} onClearPreselection={() => setPreselectedLeadId(null)} onUpdateLeadStage={(id, s) => handleUpdateEntity('leads', id, { pipeline_stage_id: s })} onToggleChatbot={(id, v) => handleUpdateEntity('leads', id, { chatbot_enabled: v })} onUpdateLead={(l) => handleUpdateEntity('leads', l.id, l)} onDeleteLead={handleDeleteLeadWithCheck} onAddLead={(ld) => handleCreateEntity('leads', ld)} onAddTask={(tk) => handleCreateEntity('lead_tasks', tk, 'tasks')} onDeleteTask={(id) => handleDeleteEntity('lead_tasks', id, 'tasks')} />}
            {activeTab === 'conversations' && <ConversationsPage leads={state.leads} onUpdateLead={(l) => handleUpdateEntity('leads', l.id, l)} />}
            {activeTab === 'properties' && <PropertiesPage properties={state.properties} projects={state.projects} onAddProperty={(p) => handleCreateEntity('properties', p)} onDeleteProperty={(id) => handleDeleteEntity('properties', id)} onUpdateProperty={(id, d) => handleUpdateEntity('properties', id, d)} />}
            {activeTab === 'sales' && <SalesPage state={state} onAddSale={(s) => handleCreateEntity('sales', s)} onUpdateSale={(id, d) => handleUpdateEntity('sales', id, d)} onDeleteSale={(id) => handleDeleteEntity('sales', id)} onAddCashMovement={(m) => handleCreateEntity('income_expenses', m)} onDeleteCashMovement={(id) => handleDeleteEntity('income_expenses', id)} />}
            {activeTab === 'tasks' && <CalendarPage state={state} onUpdateTask={(id, d) => handleUpdateEntity('lead_tasks', id, d, 'tasks')} onDeleteTask={(id) => handleDeleteEntity('lead_tasks', id, 'tasks')} onAddTask={(tk) => handleCreateEntity('lead_tasks', tk, 'tasks')} />}
            {activeTab === 'admin' && <AdminPage state={state} onAddProject={(p) => handleCreateEntity('projects', p)} onUpdateProject={(id, d) => handleUpdateEntity('projects', id, d)} onDeleteProject={(id) => handleDeleteEntity('projects', id)} onAddUser={(u) => handleCreateEntity('users', u)} onUpdateUser={(id, d) => handleUpdateEntity('users', id, d)} onDeleteUser={(id) => handleDeleteEntity('users', id)} onAddStage={(s) => handleCreateEntity('pipeline_stages', s, 'stages')} onUpdateStage={(id, d) => handleUpdateEntity('pipeline_stages', id, d, 'stages')} onDeleteStage={(id) => handleDeleteEntity('pipeline_stages', id, 'stages')} onAddLeadSource={(s) => handleCreateEntity('lead_sources', s, 'lead_sources')} onUpdateLeadSource={(id, d) => handleUpdateEntity('lead_sources', id, d, 'lead_sources')} onDeleteLeadSource={(id) => handleDeleteEntity('lead_sources', id, 'lead_sources')} />}
            {activeTab === 'settings' && <SettingsPage initialSettings={settings} onSettingsUpdate={(s: any) => setSettings(s)} />}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
