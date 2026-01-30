
import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  User,
  SlidersHorizontal,
  Filter,
  RotateCcw,
  Search,
  Briefcase,
  UserCheck,
  Lock,
  X,
  List,
  Trash2,
  ChevronDown,
  XCircle,
  CalendarDays,
  StickyNote,
  Save,
  Ban
} from 'lucide-react';
import { AppState, Task, Lead } from '../types';

interface CalendarPageProps {
  state: AppState;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
}

const getLocalDateTimeString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CalendarPage: React.FC<CalendarPageProps> = ({ state, onUpdateTask, onDeleteTask, onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [managingTask, setManagingTask] = useState<Task | null>(null);

  // Filtros
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLead, setFilterLead] = useState('all');

  // Nueva tarea
  const [newTask, setNewTask] = useState<Partial<Task>>({
    description: '',
    datetime: getLocalDateTimeString(),
    status: 'pendiente',
    lead_id: 'personal',
    notes: ''
  });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const matchesSearch = task.description.toLowerCase().includes(filterSearch.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesLead = filterLead === 'all' || task.lead_id === filterLead;
      return matchesSearch && matchesStatus && matchesLead;
    });
  }, [state.tasks, filterSearch, filterStatus, filterLead]);

  const getTasksForDay = (day: number) => {
    return filteredTasks.filter(task => {
      const d = new Date(task.datetime);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
      case 'vencido': return 'bg-rose-500/20 text-rose-500 border-rose-500/20';
      case 'reprogramado': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
      case 'descartado': return 'bg-slate-800 text-slate-500 border-slate-700';
      default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
    }
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTask) {
      const t = { ...newTask };
      if (!t.lead_id || t.lead_id === 'personal' || t.lead_id === '') {
        delete t.lead_id;
      }
      onAddTask({ ...t, datetime: new Date(t.datetime!).toISOString() });
      setShowAddModal(false);
      setNewTask({
        description: '',
        datetime: getLocalDateTimeString(),
        status: 'pendiente',
        lead_id: 'personal',
        notes: ''
      });
    }
  };

  const handleUpdateStatus = (task: Task, newStatus: Task['status'], extraData: Partial<Task> = {}) => {
    onUpdateTask(task.id, { ...extraData, status: newStatus });
    setManagingTask(null);
  };

  const handleDeleteWithConfirmation = (taskId: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta tarea?')) {
      onDeleteTask(taskId);
      setManagingTask(null);
    }
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`prev-${i}`} className="min-h-[100px]" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }} />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayTasks = getTasksForDay(d);
    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

    calendarDays.push(
      <div
        key={`day-${d}`}
        className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-1.5 transition-all group relative flex flex-col ${isToday ? 'bg-indigo-500/5' : ''}`}
        style={{ borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isToday ? 'rgba(99, 102, 241, 0.05)' : 'transparent')}
      >
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[8px] sm:text-[10px] font-bold tracking-tight ${isToday ? 'bg-indigo-600 text-white w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center' : 'text-slate-500'}`}>
            {d}
          </span>
          <button
            onClick={() => {
              setNewTask(prev => ({ ...prev, datetime: getLocalDateTimeString(new Date(year, month, d, 9, 0)) }));
              setShowAddModal(true);
            }}
            className="p-1 text-slate-700 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus size={10} />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-hidden">
          {dayTasks.map(task => (
            <div
              key={task.id}
              onClick={() => setManagingTask(task)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase truncate border ${getStatusBadge(task.status)} cursor-pointer hover:brightness-110`}
              title={task.description}
            >
              {task.description}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 0; i < remaining; i++) {
    calendarDays.push(<div key={`next-${i}`} className="min-h-[100px] bg-slate-900/10 border-r border-b border-slate-800/40" />);
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-tight leading-none mb-1" style={{ color: 'var(--text-primary)' }}>Agenda <span className="primary-gradient-text">Estratégica</span></h1>
            <p className="font-bold text-[9px] uppercase tracking-[0.2em] opacity-80 leading-none" style={{ color: 'var(--text-muted)' }}>Master Planning Real Estate</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
          <div className="hidden sm:flex rounded p-0.5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setViewMode('month')} className={`px-3 py-1 rounded text-[8px] font-bold uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-indigo-600 text-white shadow-sm' : ''}`} style={viewMode !== 'month' ? { color: 'var(--text-muted)' } : {}}>Calendario</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded text-[8px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : ''}`} style={viewMode !== 'list' ? { color: 'var(--text-muted)' } : {}}>Seguimiento</button>
          </div>

          <div className="flex items-center rounded px-1 sm:px-1.5 py-0.5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <button onClick={prevMonth} className="p-0.5 sm:p-1 hover:text-indigo-500" style={{ color: 'var(--text-muted)' }}><ChevronLeft size={14} /></button>
            <span className="px-1 sm:px-2 text-[8px] sm:text-[9px] font-bold uppercase min-w-[70px] sm:min-w-[100px] text-center" style={{ color: 'var(--text-secondary)' }}>{monthNames[month].slice(0, 3)} {year}</span>
            <button onClick={nextMonth} className="p-0.5 sm:p-1 hover:text-indigo-500" style={{ color: 'var(--text-muted)' }}><ChevronRight size={14} /></button>
          </div>

          <button onClick={() => setShowFilters(!showFilters)} className={`p-1 sm:p-1.5 rounded transition-colors ${showFilters ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : ''}`} style={!showFilters ? { backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' } : { border: '1px solid' }}><Filter size={12} /></button>
          <button onClick={() => setShowAddModal(true)} className="p-1 sm:px-4 sm:py-1.5 primary-gradient rounded text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 shadow shadow-red-500/10"><Plus size={12} /> <span className="hidden sm:inline">Nuevo</span></button>
        </div>
      </header>

      {showFilters && (
        <div className="p-3 rounded-xl mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in slide-in-from-top-1 duration-200" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Filtrar tarea..." className="w-full rounded py-1.5 pl-8 pr-2 text-[9px] font-bold outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded px-2 py-1.5 text-[9px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <option value="all">Cualquier estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="reprogramado">Reprogramado</option>
            <option value="vencido">Vendido</option>
            <option value="descartado">Descartado</option>
          </select>
          <select value={filterLead} onChange={e => setFilterLead(e.target.value)} className="rounded px-2 py-1.5 text-[9px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <option value="all">Todos los Leads</option>
            {state.leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button onClick={() => { setFilterSearch(''); setFilterStatus('all'); setFilterLead('all'); }} className="text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-70" style={{ color: 'var(--text-muted)' }}><RotateCcw size={10} /> Resetear</button>
        </div>
      )}

      <div className="flex-1 rounded overflow-hidden flex flex-col min-h-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {viewMode === 'month' ? (
          <>
            <div className="grid grid-cols-7 sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="py-2.5 text-center text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)' }}>
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-7 min-h-full" style={{ borderLeft: '1px solid var(--border-color)' }}>
                {calendarDays}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
                <tr className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">
                  <th className="px-4 py-3">Cronograma</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Lead / Proyecto</th>
                  <th className="px-4 py-3">Notas</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredTasks
                  .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
                  .map(task => {
                    const lead = state.leads.find(l => l.id === task.lead_id);
                    const taskDate = new Date(task.datetime);
                    const isOverdue = task.status === 'pendiente' && taskDate < new Date();

                    return (
                      <tr key={task.id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                            <div>
                              <p className="text-[10px] font-bold tracking-tight leading-none mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                                {taskDate.toLocaleDateString()}
                              </p>
                              <p className="text-[8px] font-bold text-indigo-500/60 uppercase">
                                {taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold uppercase tracking-tight ${task.status === 'completado' ? 'line-through' : ''}`} style={{ color: task.status === 'completado' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {task.description}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lead ? (
                            <div className="flex items-center gap-1.5">
                              <User size={10} className="text-indigo-500" />
                              <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{lead.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Actividad Interna</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[10px] font-medium line-clamp-1 max-w-[150px]" title={task.notes} style={{ color: 'var(--text-muted)' }}>
                            {task.notes || '---'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border ${getStatusBadge(isOverdue ? 'vencido' : task.status)}`}>
                            {isOverdue ? 'Vencido' : task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setManagingTask(task)}
                              className="p-1.5 bg-slate-800 text-slate-500 hover:text-white rounded border border-slate-700 transition-all opacity-0 group-hover:opacity-100"
                              title="Gestionar Seguimiento"
                            >
                              <MoreHorizontal size={12} />
                            </button>
                            {task.status !== 'completado' && (
                              <button
                                onClick={() => handleUpdateStatus(task, 'completado')}
                                className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded border border-emerald-500/20 transition-all"
                                title="Completar"
                              >
                                <CheckCircle2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <AlertCircle size={40} className="mx-auto mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Sin tareas en registro</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nueva Tarea */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center backdrop-blur-md animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="w-full h-[90vh] sm:h-auto sm:max-w-sm rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <header className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-500/10 text-indigo-500 rounded flex items-center justify-center"><CalendarIcon size={16} /></div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Nueva Tarea</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>
            <form onSubmit={handleAddTaskSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Asignación</label>
                <select
                  required
                  value={newTask.lead_id || 'personal'}
                  onChange={e => setNewTask({ ...newTask, lead_id: e.target.value })}
                  className="w-full rounded-lg py-2 px-3 text-[10px] font-bold uppercase tracking-widest outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <option value="personal">🔒 Actividad Interna / Personal</option>
                  <optgroup label="Prospectos Activos">
                    {state.leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Tipo de Actividad</label>
                <select
                  required
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full rounded-lg py-2 px-3 text-[11px] font-bold outline-none focus:border-indigo-500 transition-all"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="">Seleccione una opción...</option>
                  <option value="Llamada">Llamada</option>
                  <option value="Visita al proyecto">Visita al proyecto</option>
                  <option value="Visita en oficina">Visita en oficina</option>
                  <option value="Reunión virtual">Reunión virtual</option>
                  <option value="Confirmación por WhatsApp">Confirmación por WhatsApp</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Programación</label>
                <input required type="datetime-local" value={newTask.datetime} onChange={e => setNewTask({ ...newTask, datetime: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Notas Adicionales</label>
                <textarea
                  placeholder="Detalles sobre el contacto o la tarea..."
                  value={newTask.notes}
                  onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full rounded-lg py-2 px-3 text-[11px] font-medium focus:border-indigo-500 outline-none transition-all h-20 resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <button type="submit" className="w-full py-3 primary-gradient rounded-lg text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Sincronizar Agenda</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Tarea (Seguimiento) */}
      {managingTask && (
        <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center backdrop-blur-md animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="w-full h-[90vh] sm:h-auto sm:max-w-sm rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <header className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded border ${getStatusBadge(managingTask.status)}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Gestión Seguimiento</h2>
                  <p className="text-[7px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Master Planning CRM</p>
                </div>
              </div>
              <button onClick={() => setManagingTask(null)} className="transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-bold uppercase tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>{managingTask.description}</p>
                <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                  <Clock size={10} /> {new Date(managingTask.datetime).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Notas Operativas / Conclusión</label>
                <textarea
                  value={managingTask.notes || ''}
                  onChange={e => setManagingTask({ ...managingTask, notes: e.target.value })}
                  placeholder="Registrar detalles del contacto o motivo de reprogramación..."
                  className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500 transition-all h-24 resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Acciones Rápidas</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(managingTask, 'completado', { notes: managingTask.notes })}
                    className="flex flex-col items-center gap-1.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all group"
                  >
                    <CheckCircle2 size={16} className="text-emerald-500 group-hover:text-white" />
                    <span className="text-[7px] font-bold uppercase">Éxito</span>
                  </button>
                  <button
                    onClick={() => {
                      const newDate = prompt("Nueva Fecha (YYYY-MM-DD HH:MM):", managingTask.datetime.slice(0, 16).replace('T', ' '));
                      if (newDate) handleUpdateStatus(managingTask, 'reprogramado', { notes: managingTask.notes, datetime: new Date(newDate).toISOString() });
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500 hover:text-white transition-all group"
                  >
                    <CalendarDays size={16} className="text-amber-500 group-hover:text-white" />
                    <span className="text-[7px] font-bold uppercase">Posponer</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(managingTask, 'descartado', { notes: managingTask.notes })}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-rose-500 hover:text-white transition-all group"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <Ban size={16} className="group-hover:text-white" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[7px] font-bold uppercase">Descartar</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-between gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => handleDeleteWithConfirmation(managingTask.id)}
                  className="px-3 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => handleUpdateStatus(managingTask, managingTask.status, { notes: managingTask.notes })}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Solo Guardar Notas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
