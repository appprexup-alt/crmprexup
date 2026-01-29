
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, LayoutGrid, List, SlidersHorizontal, Search, User, Briefcase, DollarSign, Phone, Bot, MessageSquare, ChevronRight, X, Target, UserPlus, Filter, RotateCcw, Calendar, MoreHorizontal, Sparkles, UserCheck, GitCommit, Edit2, Trash2 } from 'lucide-react';
import { Lead, AppState, Task } from '../types';
import LeadCard from './LeadCard';
import LeadModal from './LeadModal';

interface KanbanBoardProps {
  state: AppState;
  preselectedLeadId?: string | null;
  onClearPreselection?: () => void;
  onUpdateLeadStage: (leadId: string, stageId: string) => void;
  onToggleChatbot: (id: string, val: boolean) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onAddLead: (lead: Partial<Lead>) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ state, preselectedLeadId, onClearPreselection, onUpdateLeadStage, onToggleChatbot, onUpdateLead, onDeleteLead, onAddLead, onAddTask, onDeleteTask }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (preselectedLeadId) {
      const lead = state.leads.find(l => l.id === preselectedLeadId);
      if (lead) {
        setSelectedLead(lead);
        if (onClearPreselection) onClearPreselection();
      }
    }
  }, [preselectedLeadId, state.leads, onClearPreselection]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterAdvisor, setFilterAdvisor] = useState('all');
  const [filterChatbot, setFilterChatbot] = useState('all');

  const filteredLeads = useMemo(() => {
    return state.leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
      const matchesProject = filterProject === 'all' || l.project_id === filterProject;
      const matchesStage = filterStage === 'all' || l.pipeline_stage_id === filterStage;
      const matchesAdvisor = filterAdvisor === 'all' || l.advisor_id === filterAdvisor;
      const matchesChatbot = filterChatbot === 'all' || (filterChatbot === 'on' ? l.chatbot_enabled : !l.chatbot_enabled);
      let matchesBudget = true;
      if (filterBudget === 'low') matchesBudget = l.budget < 50000;
      else if (filterBudget === 'mid') matchesBudget = l.budget >= 50000 && l.budget <= 150000;
      else if (filterBudget === 'high') matchesBudget = l.budget > 150000;
      return matchesSearch && matchesProject && matchesBudget && matchesStage && matchesAdvisor && matchesChatbot;
    });
  }, [state.leads, searchTerm, filterProject, filterBudget, filterStage, filterAdvisor, filterChatbot]);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, stageId: string) => {
    const leadId = e.dataTransfer.getData('leadId');
    onUpdateLeadStage(leadId, stageId);
  };

  // Safety check for data integrity
  if (!state || !state.leads || !state.stages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Target className="mx-auto text-slate-700 mb-3 w-12 h-12" />
          <p className="text-slate-500 font-medium text-[11px]">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="order-1 text-left shrink-0">
          <h1 className="text-lg font-bold text-white tracking-tight uppercase">CRM <span className="primary-gradient-text">Proyectos</span></h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em] opacity-80 leading-none">Gestión táctica y AI</p>
        </div>

        <div className="flex gap-2 order-2 justify-end items-center">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-inner shrink-0">
            <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'kanban' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
              <LayoutGrid className="w-[15px] h-[15px]" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
              <List className="w-[15px] h-[15px]" />
            </button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-1.5 border rounded-xl transition-all flex items-center justify-center shrink-0 ${showFilters ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}>
            <SlidersHorizontal className="w-[15px] h-[15px]" />
          </button>
          <button onClick={() => setShowAddLeadModal(true)} className="p-1.5 primary-gradient rounded-xl text-white shadow-lg flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl mb-4 space-y-2.5 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-[9px] font-bold outline-none focus:border-indigo-500 text-slate-200" />
            <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-[9px] font-bold text-slate-400 uppercase outline-none">
              <option value="all">Proyectos</option>
              {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-[9px] font-bold text-slate-400 uppercase outline-none">
              <option value="all">Etapas</option>
              {state.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-3 custom-scrollbar min-h-0">
          <div className="flex gap-3 h-full min-w-max pr-3">
            {state.stages.map((stage) => (
              <div key={stage.id} className="w-56 flex flex-col h-full bg-slate-900/20 rounded-xl border border-slate-800/40 p-2 shrink-0" onDragOver={onDragOver} onDrop={(e) => onDrop(e, stage.id)}>
                <div className="flex items-center justify-between mb-2.5 px-2 py-1.5 bg-slate-900/40 rounded-xl border border-slate-800/30">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-bold text-slate-300 uppercase tracking-widest text-[9px] truncate max-w-[90px]">{stage.name}</h3>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5 overflow-y-auto px-0.5 custom-scrollbar">
                  {filteredLeads.filter(l => l.pipeline_stage_id === stage.id).map(lead => (
                    <LeadCard key={lead.id} lead={lead} onOpenLead={setSelectedLead} onToggleChatbot={onToggleChatbot} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-slate-900/30 border border-slate-800 rounded-xl shadow-2xl custom-scrollbar min-h-0">
          {filteredLeads.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center">
                <Target size={48} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 font-medium text-[11px]">No hay leads que coincidan con los filtros</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterProject('all');
                    setFilterBudget('all');
                    setFilterStage('all');
                    setFilterAdvisor('all');
                    setFilterChatbot('all');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-bold uppercase transition-all"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 sticky top-0 z-10 text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-5 py-4">Prospecto</th>
                  <th className="px-5 py-4">Etapa</th>
                  <th className="px-5 py-4">Inversión</th>
                  <th className="px-5 py-4">Proyecto</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredLeads.map(lead => {
                  const stage = state.stages.find(s => s.id === lead.pipeline_stage_id);
                  const project = state.projects.find(p => p.id === lead.project_id);
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-indigo-500/5 transition-all cursor-pointer group">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-100 uppercase leading-none mb-0.5">{lead.name}</p>
                          <p className="text-slate-500 text-[8px] font-semibold tracking-widest uppercase">{lead.phone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage?.color || '#6366f1' }} />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stage?.name || 'Sin etapa'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">{lead.budget_currency === 'USD' ? '$' : 'S/'} {lead.budget?.toLocaleString() || '0'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[9px] font-bold text-slate-300 uppercase truncate max-w-[120px] inline-block">{project?.name || 'General'}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                          <button
                            onPointerDown={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                            className="p-2 bg-slate-800/50 border border-slate-700 text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-all shadow-inner"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteLead(lead.id);
                            }}
                            className="p-2 bg-slate-800/50 border border-slate-700 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all shadow-inner"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(selectedLead || showAddLeadModal) && (
        <LeadModal
          lead={selectedLead || {
            id: '',
            name: '',
            phone: '',
            budget: 0,
            budget_currency: 'USD',
            interest: '',
            project_id: state.projects[0]?.id || null,
            advisor_id: state.users[0]?.id || null,
            pipeline_stage_id: state.stages[0]?.id || null,
            chatbot_enabled: true,
            created_at: new Date().toISOString()
          }}
          tasks={state.tasks} projects={state.projects} users={state.users} stages={state.stages} lead_sources={state.lead_sources}
          onClose={() => { setSelectedLead(null); setShowAddLeadModal(false); }}
          onUpdateLead={(updated) => {
            if (showAddLeadModal) onAddLead(updated);
            else onUpdateLead(updated);
            setSelectedLead(null);
            setShowAddLeadModal(false);
          }}
          onDeleteLead={(id) => { onDeleteLead(id); setSelectedLead(null); setShowAddLeadModal(false); }}
          onAddTask={onAddTask} onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
