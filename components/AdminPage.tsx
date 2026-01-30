
import React, { useState } from 'react';
import { Users, Building, GitCommit, Plus, Edit2, Trash2, CheckCircle2, XCircle, Hash, X, Mail, Phone, Building2, Palette, Layers, Loader2, Lock, Tag } from 'lucide-react';
import { AppState, User, Project, PipelineStage, LeadSource } from '../types';

interface AdminPageProps {
  state: AppState;
  onAddProject: (p: Partial<Project>) => void;
  onUpdateProject: (id: string, d: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddUser: (u: Partial<User> & { password?: string }) => void;
  onUpdateUser: (id: string, d: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onAddStage: (s: Partial<PipelineStage>) => void;
  onUpdateStage: (id: string, d: Partial<PipelineStage>) => void;
  onDeleteStage: (id: string) => void;
  onAddLeadSource: (s: Partial<LeadSource>) => void;
  onUpdateLeadSource: (id: string, d: Partial<LeadSource>) => void;
  onDeleteLeadSource: (id: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({
  state,
  onAddProject, onUpdateProject, onDeleteProject,
  onAddUser, onUpdateUser, onDeleteUser,
  onAddStage, onUpdateStage, onDeleteStage,
  onAddLeadSource, onUpdateLeadSource, onDeleteLeadSource
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'pipeline' | 'sources'>('users');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [projectForm, setProjectForm] = useState<Partial<Project>>({ name: '', developer: '', units: 0, phone: '', status: 'active' });
  const [userForm, setUserForm] = useState<Partial<User> & { password?: string }>({ name: '', email: '', role: 'ejecutivo', active: true });
  const [stageForm, setStageForm] = useState<Partial<PipelineStage>>({ name: '', color: '#6366f1', order: 0 });
  const [sourceForm, setSourceForm] = useState<Partial<LeadSource>>({ name: '' });

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdateProject(editingId, projectForm);
    else onAddProject(projectForm);
    setShowProjectModal(false);
    setEditingId(null);
    setProjectForm({ name: '', developer: '', units: 0, phone: '', status: 'active' });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdateUser(editingId, userForm);
    else onAddUser(userForm);
    setShowUserModal(false);
    setEditingId(null);
    setUserForm({ name: '', email: '', role: 'ejecutivo', active: true });
  };

  const handleStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdateStage(editingId, stageForm);
    else onAddStage(stageForm);
    setShowStageModal(false);
    setEditingId(null);
    setStageForm({ name: '', color: '#6366f1', order: 0 });
  };

  const handleSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdateLeadSource(editingId, sourceForm);
    else onAddLeadSource(sourceForm);
    setShowSourceModal(false);
    setEditingId(null);
    setSourceForm({ name: '' });
  };

  const confirmThenDelete = (type: string, name: string, id: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar ${type}: "${name}"?`)) {
      switch (type) {
        case 'usuario': onDeleteUser(id); break;
        case 'proyecto': onDeleteProject(id); break;
        case 'etapa': onDeleteStage(id); break;
        case 'origen': onDeleteLeadSource(id); break;
      }
    }
  };

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'projects', label: 'Proyectos', icon: Building2 },
    { id: 'pipeline', label: 'Pipeline', icon: GitCommit },
    { id: 'sources', label: 'Orígenes', icon: Tag },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="flex flex-col h-full space-y-3 animate-in slide-in-from-bottom-2 duration-300 min-h-0">
            <header className="flex justify-between items-center p-3 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Gestión de <span className="primary-gradient-text">Fuerza Ventas</span></h3>
              <button onClick={() => { setEditingId(null); setUserForm({ name: '', email: '', role: 'ejecutivo', active: true }); setShowUserModal(true); }} className="px-3 py-1.5 primary-gradient rounded-lg text-[9px] font-bold text-white flex items-center gap-1.5 hover:opacity-90 uppercase tracking-widest shadow-md">
                <Plus size={14} /> Registrar
              </button>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 pb-2">
                {state.users.map((user) => (
                  <div key={user.id} className="p-3 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[11px] uppercase shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[11px] uppercase tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border shrink-0 ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-semibold truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</span>
                          {user.active ? <CheckCircle2 size={10} className="text-emerald-500 shrink-0" /> : <XCircle size={10} className="text-rose-500 shrink-0" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => { setUserForm(user); setEditingId(user.id); setShowUserModal(true); }} className="p-1.5 hover:bg-indigo-500/10 rounded-lg border transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                      <button onClick={() => confirmThenDelete('usuario', user.name, user.id)} className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg border transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="flex flex-col h-full space-y-3 animate-in slide-in-from-bottom-2 duration-300 min-h-0">
            <header className="flex justify-between items-center p-3 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Inventario de <span className="primary-gradient-text">Desarrollos</span></h3>
              <button onClick={() => { setEditingId(null); setProjectForm({ name: '', developer: '', units: 0, phone: '', status: 'active' }); setShowProjectModal(true); }} className="px-3 py-1.5 primary-gradient rounded-lg text-[9px] font-bold text-white flex items-center gap-1.5 hover:opacity-90 uppercase tracking-widest shadow-md">
                <Plus size={14} /> Crear
              </button>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-2">
                {state.projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-xl hover:border-indigo-500/30 transition-all group relative shadow-md" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                        <Building size={18} />
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}`} style={project.status !== 'active' ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' } : {}}>
                        {project.status === 'active' ? 'En Venta' : 'Cerrado'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold tracking-tight uppercase truncate" style={{ color: 'var(--text-primary)' }}>{project.name}</h4>
                    <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mb-3 truncate">{project.developer}</p>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <div className="flex gap-4">
                        <div><p className="text-[8px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Unidades</p><p className="text-[12px] font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>{project.units}</p></div>
                        <div><p className="text-[8px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Contacto</p><p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{project.phone}</p></div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setProjectForm(project); setEditingId(project.id); setShowProjectModal(true); }} className="p-1.5 rounded-lg transition-all" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                        <button onClick={() => confirmThenDelete('proyecto', project.name, project.id)} className="p-1.5 rounded-lg transition-all hover:text-rose-500" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="flex flex-col h-full space-y-3 animate-in slide-in-from-bottom-2 duration-300 min-h-0">
            <header className="flex justify-between items-center p-3 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Estructura del <span className="primary-gradient-text">Embudo</span></h3>
              <button onClick={() => { setEditingId(null); setStageForm({ name: '', color: '#6366f1', order: state.stages.length }); setShowStageModal(true); }} className="px-3 py-1.5 primary-gradient rounded-lg text-[9px] font-bold text-white flex items-center gap-1.5 hover:opacity-90 uppercase tracking-widest shadow-md">
                <Plus size={14} /> Nueva Etapa
              </button>
            </header>
            <div className="flex-1 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-[10px] min-w-[400px]">
                  <thead className="sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <tr className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      <th className="px-5 py-3">Orden</th>
                      <th className="px-5 py-3">Etapa</th>
                      <th className="px-5 py-3">Color</th>
                      <th className="px-5 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderColor: 'var(--border-color)' }}>
                    {state.stages.sort((a, b) => a.order - b.order).map((stage, index) => (
                      <tr key={stage.id} className="hover:bg-indigo-500/5 transition-colors group" style={{ borderBottom: index < state.stages.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <td className="px-5 py-3 font-bold text-indigo-500 text-[12px]">#{stage.order}</td>
                        <td className="px-5 py-3">
                          <span className="font-bold uppercase tracking-tight text-[11px]" style={{ color: 'var(--text-primary)' }}>{stage.name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded shadow-lg border border-white/10 shrink-0" style={{ backgroundColor: stage.color }} />
                            <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>{stage.color}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setStageForm(stage); setEditingId(stage.id); setShowStageModal(true); }} className="p-1.5 rounded transition-all" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                            <button onClick={() => confirmThenDelete('etapa', stage.name, stage.id)} className="p-1.5 rounded transition-all hover:text-rose-500" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'sources':
        return (
          <div className="flex flex-col h-full space-y-3 animate-in slide-in-from-bottom-2 duration-300 min-h-0">
            <header className="flex justify-between items-center p-3 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Canales de <span className="primary-gradient-text">Captación</span></h3>
              <button onClick={() => { setEditingId(null); setSourceForm({ name: '' }); setShowSourceModal(true); }} className="px-3 py-1.5 primary-gradient rounded-lg text-[9px] font-bold text-white flex items-center gap-1.5 hover:opacity-90 uppercase tracking-widest shadow-md">
                <Plus size={14} /> Nuevo Origen
              </button>
            </header>
            <div className="flex-1 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-[10px] min-w-[400px]">
                  <thead className="sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <tr className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      <th className="px-5 py-3">Nombre del Canal</th>
                      <th className="px-5 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.lead_sources.map((source, index) => (
                      <tr key={source.id} className="hover:bg-indigo-500/5 transition-colors group" style={{ borderBottom: index < state.lead_sources.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <td className="px-5 py-3">
                          <span className="font-bold uppercase tracking-tight text-[11px]" style={{ color: 'var(--text-primary)' }}>{source.name}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSourceForm(source); setEditingId(source.id); setShowSourceModal(true); }} className="p-1.5 rounded transition-all" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                            <button onClick={() => confirmThenDelete('origen', source.name, source.id)} className="p-1.5 rounded transition-all hover:text-rose-500" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto animate-in fade-in duration-700 min-h-0">
      <header className="mb-4 shrink-0">
        <h1 className="text-lg font-bold tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>Control <span className="primary-gradient-text">SaaS Panel</span></h1>
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-muted)' }}>Infraestructura del núcleo</p>
      </header>

      <div className="flex border-b mb-4 shrink-0 overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 ${activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent'
              }`}
            style={activeTab !== tab.id ? { color: 'var(--text-muted)' } : {}}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 rounded-3xl flex flex-col min-h-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        {renderTabContent()}
      </div>

      {/* MODAL PROYECTO */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-color)' }}>
            <header className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Proyecto <span className="primary-gradient-text">Engine</span></h2>
              <button onClick={() => setShowProjectModal(false)} className="transition-colors" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>
            <form onSubmit={handleProjectSubmit} className="p-4 space-y-3">
              <input required placeholder="Nombre Comercial" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <input required placeholder="Desarrolladora" value={projectForm.developer} onChange={e => setProjectForm({ ...projectForm, developer: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Unidades" value={projectForm.units} onChange={e => setProjectForm({ ...projectForm, units: Number(e.target.value) })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <input placeholder="Teléfono" value={projectForm.phone} onChange={e => setProjectForm({ ...projectForm, phone: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value as any })} className="w-full rounded-lg py-2 px-3 text-[11px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <option value="active">Activo</option>
                <option value="completed">Finalizado</option>
              </select>
              <button type="submit" className="w-full py-3 primary-gradient rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10 hover:opacity-90 transition-all active:scale-95">
                {editingId ? 'Actualizar Registro' : 'Registrar Proyecto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL USUARIO */}
      {showUserModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-color)' }}>
            <header className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Usuario <span className="primary-gradient-text">Core</span></h2>
              <button onClick={() => setShowUserModal(false)} className="transition-colors" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>
            <form onSubmit={handleUserSubmit} className="p-4 space-y-3">
              <input required placeholder="Nombre Completo" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <input required type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />

              <div className="relative">
                <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="tel" placeholder="Teléfono (opcional)" value={userForm.phone || ''} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} className="w-full rounded-lg py-2 px-3 pl-8 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              <input type="url" placeholder="Avatar URL (opcional)" value={userForm.avatar || ''} onChange={e => setUserForm({ ...userForm, avatar: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              {!editingId && (
                <div className="relative">
                  <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input required type="password" placeholder="Contraseña Inicial" onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full rounded-lg py-2 px-3 pl-8 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              )}
              <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as any })} className="w-full rounded-lg py-2 px-3 text-[11px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <option value="ejecutivo">Ejecutivo</option>
                <option value="admin">Administrador</option>
              </select>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <input type="checkbox" checked={userForm.active} onChange={e => setUserForm({ ...userForm, active: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Usuario Activo</span>
              </div>
              <button type="submit" className="w-full py-3 primary-gradient rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10 hover:opacity-90 transition-all active:scale-95">
                {editingId ? 'Actualizar Usuario' : 'Crear Acceso'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PIPELINE */}
      {showStageModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-color)' }}>
            <header className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Pipeline <span className="primary-gradient-text">Stage</span></h2>
              <button onClick={() => setShowStageModal(false)} className="transition-colors" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>
            <form onSubmit={handleStageSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Nombre de la Etapa</label>
                <input required placeholder="Ej. Calificado, Visita..." value={stageForm.name} onChange={e => setStageForm({ ...stageForm, name: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Color (Hex)</label>
                  <div className="flex gap-2">
                    <input type="color" value={stageForm.color} onChange={e => setStageForm({ ...stageForm, color: e.target.value })} className="w-10 h-8 rounded cursor-pointer" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }} />
                    <input required placeholder="#000000" value={stageForm.color} onChange={e => setStageForm({ ...stageForm, color: e.target.value })} className="w-full rounded-lg py-1 px-2 text-[10px] font-mono uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Prioridad (Orden)</label>
                  <div className="relative">
                    <Layers size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input required type="number" value={stageForm.order} onChange={e => setStageForm({ ...stageForm, order: Number(e.target.value) })} className="w-full rounded-lg py-2 pl-8 pr-3 text-[11px] font-bold outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-3 primary-gradient rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10 hover:opacity-90 transition-all active:scale-95">Sincronizar Pipeline</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SOURCE */}
      {showSourceModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-color)' }}>
            <header className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Origen <span className="primary-gradient-text">Lead</span></h2>
              <button onClick={() => setShowSourceModal(false)} className="transition-colors" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>
            <form onSubmit={handleSourceSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Nombre del Origen</label>
                <input required placeholder="Ej. Facebook, Referido..." value={sourceForm.name} onChange={e => setSourceForm({ ...sourceForm, name: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <button type="submit" className="w-full py-3 primary-gradient rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10 hover:opacity-90 transition-all active:scale-95">Sincronizar Orígenes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;