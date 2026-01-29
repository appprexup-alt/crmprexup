
import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Plus, Clock, CheckCircle2, Trash2, Phone, DollarSign, Target, User, Bot, Info, UserCheck, StickyNote, Tag, Brain } from 'lucide-react';
import { Lead, Task } from '../types';
import AILeadAnalysis from './AILeadAnalysis';

interface LeadModalProps {
  lead: Lead;
  tasks: Task[];
  projects: any[];
  users: any[];
  stages: any[];
  lead_sources: any[];
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const getLocalDateTimeString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const LeadModal: React.FC<LeadModalProps> = ({ lead, tasks, projects, users, stages, lead_sources, onClose, onUpdateLead, onDeleteLead, onAddTask, onDeleteTask }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'notes' | 'ai'>('info');
  const [editedLead, setEditedLead] = useState<Lead>({ ...lead });
  const isCreation = !lead.id;

  const [newTask, setNewTask] = useState({
    description: '',
    datetime: getLocalDateTimeString(),
    status: 'pendiente' as any,
    notes: ''
  });

  const leadTasks = tasks.filter(t => t.lead_id === lead.id);

  const handleSave = () => {
    onUpdateLead(editedLead);
  };

  const handleDeleteWithConfirmation = () => {
    if (window.confirm(`¿Seguro que quieres eliminar al lead "${lead.name}"? Esta acción es irreversible.`)) {
      onDeleteLead(lead.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <header className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">{isCreation ? 'Nuevo Lead' : editedLead.name}</h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{isCreation ? 'Ingresa los datos del nuevo prospecto' : `Prospecto ID: ${editedLead.id.slice(0, 8)}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        <div className="flex border-b border-slate-800 bg-slate-900/30">
          {[
            { id: 'info', label: 'Info', icon: Info },
            ...(!isCreation ? [{ id: 'tasks', label: `Tareas (${leadTasks.length})`, icon: Calendar }] : []),
            { id: 'notes', label: 'Notas', icon: MessageSquare },
            ...(!isCreation ? [{ id: 'ai', label: 'AI', icon: Brain }] : [])
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><User size={10} /> Nombre Completo</span>
                  <input type="text" value={editedLead.name} onChange={e => setEditedLead({ ...editedLead, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-bold text-slate-100 outline-none" placeholder="Juan Perez" />
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><Phone size={10} /> Teléfono</span>
                  <input type="text" value={editedLead.phone} onChange={e => setEditedLead({ ...editedLead, phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-bold text-slate-100 outline-none" placeholder="987654321" />
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><DollarSign size={10} /> Presupuesto</span>
                  <div className="flex gap-1">
                    <select value={editedLead.budget_currency} onChange={e => setEditedLead({ ...editedLead, budget_currency: e.target.value as any })} className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-1 text-[9px] font-black text-slate-400 uppercase outline-none shrink-0">
                      <option value="USD">USD</option>
                      <option value="PEN">PEN</option>
                    </select>
                    <input type="number" value={editedLead.budget} onChange={e => setEditedLead({ ...editedLead, budget: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-black text-emerald-400 outline-none" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><Tag size={10} /> Origen del Lead</span>
                  <select value={editedLead.source_id || ''} onChange={e => setEditedLead({ ...editedLead, source_id: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none">
                    <option value="">Sin Origen</option>
                    {lead_sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><Target size={10} /> Proyecto</span>
                  <select value={editedLead.project_id} onChange={e => setEditedLead({ ...editedLead, project_id: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none">
                    <option value="">Selecciona Proyecto</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><UserCheck size={10} /> Asesor Responsable</span>
                  <select value={editedLead.advisor_id} onChange={e => setEditedLead({ ...editedLead, advisor_id: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none">
                    <option value="">Selecciona Asesor</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><Clock size={10} /> Etapa Actual</span>
                  <select value={editedLead.pipeline_stage_id} onChange={e => setEditedLead({ ...editedLead, pipeline_stage_id: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest outline-none">
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest"><CheckCircle2 size={10} /> Estado del Lead</span>
                  <select value={editedLead.status || 'activo'} onChange={e => setEditedLead({ ...editedLead, status: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-[10px] font-black uppercase tracking-widest outline-none" style={{ color: editedLead.status === 'activo' ? '#22c55e' : editedLead.status === 'inactivo' ? '#94a3b8' : editedLead.status === 'pausado' ? '#f59e0b' : editedLead.status === 'convertido' ? '#3b82f6' : editedLead.status === 'perdido' ? '#ef4444' : '#a78bfa' }}>
                    <option value="activo">🟢 Activo</option>
                    <option value="inactivo">⚪ Inactivo</option>
                    <option value="pausado">🟡 Pausado</option>
                    <option value="convertido">🔵 Convertido</option>
                    <option value="perdido">🔴 Perdido</option>
                  </select>
                </label>
                <div className="flex items-center justify-between p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mt-2">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Chatbot AI</span>
                  </div>
                  <button onClick={() => setEditedLead({ ...editedLead, chatbot_enabled: !editedLead.chatbot_enabled })} className={`w-9 h-4.5 rounded-full relative transition-colors ${editedLead.chatbot_enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${editedLead.chatbot_enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isCreation && activeTab === 'tasks' && (
            <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Plus size={12} /> Programar Actividad</h4>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all text-slate-200"
                  >
                    <option value="">¿Qué hay que hacer?</option>
                    <option value="Llamada">Llamada</option>
                    <option value="Visita al proyecto">Visita al proyecto</option>
                    <option value="Visita en oficina">Visita en oficina</option>
                    <option value="Reunión virtual">Reunión virtual</option>
                    <option value="Confirmación por WhatsApp">Confirmación por WhatsApp</option>
                    <option value="Otros">Otros</option>
                  </select>
                  <input type="datetime-local" value={newTask.datetime} onChange={e => setNewTask({ ...newTask, datetime: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold outline-none [color-scheme:dark] text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest pl-1">Notas de la actividad</label>
                  <textarea
                    placeholder="Detalles adicionales o instrucciones para esta tarea..."
                    value={newTask.notes}
                    onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all text-slate-300 h-16 resize-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (newTask.description) {
                      onAddTask({
                        ...newTask,
                        lead_id: lead.id,
                        datetime: new Date(newTask.datetime).toISOString()
                      });
                      setNewTask({ description: '', datetime: getLocalDateTimeString(), status: 'pendiente', notes: '' });
                    }
                  }}
                  className="w-full py-3 primary-gradient rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
                >
                  Añadir a la Agenda
                </button>
              </div>

              <div className="space-y-2">
                {leadTasks.map(task => (
                  <div key={task.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${task.status === 'completado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-500'}`}><CheckCircle2 size={14} /></div>
                      <div>
                        <p className={`text-[10px] font-bold ${task.status === 'completado' ? 'text-slate-600 line-through' : 'text-slate-200 uppercase tracking-tight'}`}>{task.description}</p>
                        <p className="text-[8px] text-indigo-500 font-black uppercase mt-0.5">{new Date(task.datetime).toLocaleString()}</p>
                        {task.notes && <p className="text-[8px] text-slate-500 italic mt-1 line-clamp-1">{task.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${task.status === 'pendiente' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>{task.status}</span>
                      <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <textarea placeholder="Comentarios internos sobre el prospecto..." className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all resize-none text-slate-300" defaultValue={editedLead.interest} onChange={e => setEditedLead({ ...editedLead, interest: e.target.value })} />
              {!isCreation && <button onClick={() => onUpdateLead(editedLead)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">Actualizar Notas</button>}
            </div>
          )}

          {!isCreation && activeTab === 'ai' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <AILeadAnalysis
                lead={editedLead}
              />
            </div>
          )}
        </div>

        <footer className="p-5 bg-slate-950/50 border-t border-slate-800 flex justify-between gap-2">
          {!isCreation ? (
            <button onClick={handleDeleteWithConfirmation} className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><Trash2 size={14} /></button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cerrar</button>
            <button onClick={handleSave} className="px-6 py-2 primary-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-red-500/10">
              {isCreation ? 'Crear Prospecto' : 'Guardar Cambios'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LeadModal;
