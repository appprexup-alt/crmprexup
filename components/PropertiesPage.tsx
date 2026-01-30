
import React, { useState, useMemo } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  X,
  DollarSign,
  Maximize2,
  Tag,
  Info,
  Edit2,
  Trash2,
  Home,
  SlidersHorizontal,
  Filter,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Clock,
  ChevronDown,
  FileText
} from 'lucide-react';
import { Property, Project } from '../types';
import PropertyCard from './PropertyCard';

interface PropertiesPageProps {
  properties: Property[];
  projects: Project[];
  onAddProperty?: (prop: Partial<Property>) => void;
  onUpdateProperty?: (id: string, prop: Partial<Property>) => void;
  onDeleteProperty?: (id: string) => void;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ properties, projects, onAddProperty, onUpdateProperty, onDeleteProperty }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtros Avanzados
  const [filterSearch, setFilterSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');

  const [newProp, setNewProp] = useState<Partial<Property>>({
    description: '',
    project_id: projects[0]?.id || null,
    location: '',
    price: 0,
    currency: 'USD',
    area: 0,
    details: '',
    status: 'disponible',
    property_type: 'terreno',
    bedrooms: undefined,
    bathrooms: undefined,
    built_area: undefined,
    floors: undefined
  });

  const resetFilters = () => {
    setFilterSearch('');
    setFilterProject('all');
    setFilterStatus('all');
    setFilterCurrency('all');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
  };

  const displayProperties = useMemo(() => {
    return properties
      .filter(prop => {
        const description = prop.description || '';
        const matchesSearch = description.toLowerCase().includes(filterSearch.toLowerCase());
        const matchesProject = filterProject === 'all' || prop.project_id === filterProject;
        const matchesStatus = filterStatus === 'all' || prop.status === filterStatus;
        const matchesCurrency = filterCurrency === 'all' || prop.currency === filterCurrency;

        const matchesMinPrice = minPrice === '' || (prop.price || 0) >= Number(minPrice);
        const matchesMaxPrice = maxPrice === '' || (prop.price || 0) <= Number(maxPrice);
        const matchesMinArea = minArea === '' || (prop.area || 0) >= Number(minArea);
        const matchesMaxArea = maxArea === '' || (prop.area || 0) <= Number(maxArea);

        return matchesSearch && matchesProject && matchesStatus && matchesCurrency &&
          matchesMinPrice && matchesMaxPrice && matchesMinArea && matchesMaxArea;
      })
      .sort((a, b) => (a.description || '').localeCompare(b.description || ''));
  }, [properties, filterSearch, filterProject, filterStatus, filterCurrency, minPrice, maxPrice, minArea, maxArea]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProp = { ...newProp, price_per_m2: (newProp.price || 0) / (newProp.area || 1) };
    if (editingId) onUpdateProperty?.(editingId, finalProp);
    else onAddProperty?.(finalProp);
    setShowAddModal(false);
    setEditingId(null);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'vendido': return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', label: 'Vendido', icon: CheckCircle2 };
      case 'separado': return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Separado', icon: Clock };
      case 'bloqueado': return { color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', label: 'Bloqueado', icon: Lock };
      default: return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Disponible', icon: Home };
    }
  };

  const handleDeleteWithConfirmation = (property: Property) => {
    console.log('PropertiesPage: handleDeleteWithConfirmation called for:', property.id);
    if (window.confirm(`¿Estás seguro de eliminar la propiedad "${property.description}"?`)) {
      console.log('PropertiesPage: Confirmed, calling onDeleteProperty');
      onDeleteProperty?.(property.id);
    } else {
      console.log('PropertiesPage: Cancelled');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const propertiesToUpload = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const prop: any = {
          project_id: projects[0]?.id,
          status: 'disponible',
          currency: 'USD'
        };

        headers.forEach((header, index) => {
          const value = values[index];
          if (header === 'descripcion' || header === 'description') prop.description = value;
          if (header === 'ubicacion' || header === 'location') prop.location = value;
          if (header === 'precio' || header === 'price') prop.price = Number(value);
          if (header === 'area') prop.area = Number(value);
          if (header === 'detalles' || header === 'details') prop.details = value;
          if (header === 'moneda' || header === 'currency') prop.currency = value;
          if (header === 'property_type' || header === 'tipo') prop.property_type = value;
          if (header === 'bedrooms' || header === 'dormitorios') prop.bedrooms = Number(value) || undefined;
          if (header === 'bathrooms' || header === 'banos' || header === 'baños') prop.bathrooms = Number(value) || undefined;
          if (header === 'built_area' || header === 'area_construida') prop.built_area = Number(value) || undefined;
          if (header === 'floors' || header === 'pisos') prop.floors = Number(value) || undefined;
          if (header === 'status' || header === 'estado') prop.status = value || 'disponible';
        });

        return prop;
      }).filter(prop => prop.description && prop.description.trim() !== ''); // Filtrar filas sin descripción

      if (propertiesToUpload.length > 0) {
        let uploaded = 0;
        let failed = 0;
        for (const p of propertiesToUpload) {
          try {
            await onAddProperty?.(p);
            uploaded++;
          } catch (error) {
            console.error('Error uploading property:', p, error);
            failed++;
          }
        }
        alert(`¡Éxito! ${uploaded} propiedades cargadas${failed > 0 ? `, ${failed} fallaron` : ''}.`);
      } else {
        alert('No se encontraron propiedades válidas en el CSV. Verifica que la columna "description" no esté vacía.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Tag size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight uppercase leading-none mb-1" style={{ color: 'var(--text-primary)' }}>Inventario <span className="primary-gradient-text">Unidades</span></h1>
            <p className="font-bold text-[9px] uppercase tracking-[0.2em] opacity-80 leading-none" style={{ color: 'var(--text-muted)' }}>Gestión de Stock Inmobiliario</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded p-0.5 shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setViewMode('grid')} className={`w-7 h-7 flex items-center justify-center rounded transition-all ${viewMode === 'grid' ? 'shadow-sm' : ''}`} style={viewMode === 'grid' ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : { color: 'var(--text-muted)' }}><LayoutGrid size={14} /></button>
            <button onClick={() => setViewMode('list')} className={`w-7 h-7 flex items-center justify-center rounded transition-all ${viewMode === 'list' ? 'shadow-sm' : ''}`} style={viewMode === 'list' ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : { color: 'var(--text-muted)' }}><List size={14} /></button>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${showAdvancedFilters ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : ''}`}
            style={!showAdvancedFilters ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
            title="Filtros Avanzados"
          >
            <SlidersHorizontal size={14} />
          </button>

          <label
            className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded flex items-center justify-center shadow-inner cursor-pointer hover:bg-purple-500/20 active:scale-95 transition-all"
            title="Carga Masiva (CSV)"
          >
            <FileText size={16} />
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>

          <button
            onClick={() => { setEditingId(null); setNewProp({ ...newProp, status: 'disponible', details: '' }); setShowAddModal(true); }}
            className="w-9 h-9 primary-gradient rounded text-white hover:opacity-90 flex items-center justify-center shadow shadow-red-500/10 active:scale-95 transition-all"
            title="Registrar Unidad"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {showAdvancedFilters && (
        <div className="border p-3 rounded space-y-3 animate-in slide-in-from-top-1 duration-200 shrink-0" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-2">
              <Filter size={10} /> Segmentación Avanzada
            </div>
            <button onClick={resetFilters} className="text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Descripción..." className="w-full rounded py-1.5 pl-8 pr-2 text-[9px] font-bold outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="rounded px-2 py-1.5 text-[9px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>
              <option value="all">Todos los proyectos</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded px-2 py-1.5 text-[9px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>
              <option value="all">Cualquier estado</option>
              <option value="disponible">Disponible</option>
              <option value="separado">Separado</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="vendido">Vendido</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Precio Mín." className="w-full rounded py-1.5 px-2 text-[9px] font-bold outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Precio Máx." className="w-full rounded py-1.5 px-2 text-[9px] font-bold outline-none focus:border-indigo-500" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 rounded overflow-hidden flex flex-col min-h-0 shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {viewMode === 'grid' ? (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  project={projects.find(p => p.id === property.project_id)}
                  onDelete={onDeleteProperty}
                  onEdit={prop => { setNewProp(prop); setEditingId(prop.id); setShowAddModal(true); }}
                />
              ))}
              {displayProperties.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20">
                  <AlertCircle size={48} className="mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sin resultados</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <tr className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  <th className="px-4 py-3">Unidad / Ubicación</th>
                  <th className="px-4 py-3">Especificaciones</th>
                  <th className="px-4 py-3 text-right">Precio / m²</th>
                  <th className="px-4 py-3 text-right">Precio Final</th>
                  <th className="px-4 py-3 text-center">Estado Operativo</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {displayProperties.map(property => {
                  const project = projects.find(p => p.id === property.project_id);
                  const status = getStatusBadge(property.status);
                  const StatusIcon = status.icon;
                  const isSold = property.status === 'vendido';

                  return (
                    <tr key={property.id} className={`hover:bg-indigo-500/[0.03] transition-all group ${isSold ? 'opacity-60 bg-rose-500/[0.02]' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${status.color.split(' ')[1]} ${status.color.split(' ')[2]} ${status.color.split(' ')[0]}`}>
                            <StatusIcon size={14} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-tight leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{property.description}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[8px] text-indigo-500 font-bold uppercase tracking-widest">{project?.name || 'S/P'}</p>
                              {property.location && (
                                <span className="text-[7px] font-bold uppercase tracking-widest px-1 rounded border" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                                  {property.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2 max-w-[200px]">
                          <FileText size={10} className="shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-[10px] font-medium line-clamp-2" style={{ color: 'var(--text-tertiary)' }} title={property.details}>
                            {property.details || 'Sin especificaciones registradas'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{property.currency === 'USD' ? '$' : 'S/'} {property.area && property.area > 0 ? (property.price / property.area).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-[12px] tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{property.currency === 'USD' ? '$' : 'S/'} {property.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <p className="text-[8px] font-bold uppercase mt-1" style={{ color: 'var(--text-muted)' }}>{property.area} m²</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isSold && (
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setNewProp(property); setEditingId(property.id); setShowAddModal(true); }} className="p-1.5 rounded border transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                            <button onClick={() => handleDeleteWithConfirmation(property)} className="p-1.5 rounded border text-rose-500 transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}><Trash2 size={11} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {displayProperties.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <AlertCircle size={40} className="mx-auto mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Sin registros coincidentes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-color)' }}>
            <header className="px-5 py-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-500/10 text-indigo-500 rounded flex items-center justify-center shadow-inner"><Maximize2 size={16} /></div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Editar Unidad' : 'Nueva Unidad'}</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="transition-colors" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </header>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Identificador</label>
                <input required placeholder="Ej. Dpto 101 Torre A" value={newProp.description} onChange={e => setNewProp({ ...newProp, description: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500 transition-all" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Ubicación / Dirección</label>
                <input placeholder="Ej. Av. Larco 123, Miraflores" value={newProp.location || ''} onChange={e => setNewProp({ ...newProp, location: e.target.value })} className="w-full rounded-lg py-2 px-3 text-[11px] font-medium outline-none focus:border-indigo-500 transition-all" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Proyecto</label>
                  <select
                    value={newProp.project_id || ''}
                    onChange={e => setNewProp({ ...newProp, project_id: e.target.value || null })}
                    className="w-full rounded-lg py-2 px-2 text-[10px] font-bold uppercase outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    <option value="">-- Seleccionar Proyecto --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Estado</label>
                  <select value={newProp.status} onChange={e => setNewProp({ ...newProp, status: e.target.value as any })} className="w-full rounded-lg py-2 px-2 text-[10px] font-bold uppercase outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <option value="disponible">Disponible</option>
                    <option value="separado">Separado</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Tipo de Propiedad</label>
                <select
                  value={newProp.property_type || 'terreno'}
                  onChange={e => setNewProp({ ...newProp, property_type: e.target.value as any })}
                  className="w-full rounded-lg py-2 px-2 text-[10px] font-bold uppercase outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <option value="terreno">Terreno / Lote</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Moneda / Precio</label>
                  <div className="flex gap-1">
                    <select value={newProp.currency} onChange={e => setNewProp({ ...newProp, currency: e.target.value as any })} className="rounded-lg px-1.5 py-2 text-[9px] font-bold uppercase outline-none shrink-0" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}><option value="USD">$</option><option value="PEN">S/</option></select>
                    <input required type="number" placeholder="0.00" value={newProp.price || ''} onChange={e => setNewProp({ ...newProp, price: Number(e.target.value) })} className="w-full rounded-lg py-1.5 px-3 text-[11px] font-bold text-emerald-600 outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Área (m²)</label>
                  <input required type="number" placeholder="Ej. 85" value={newProp.area || ''} onChange={e => setNewProp({ ...newProp, area: Number(e.target.value) })} className="w-full rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              {/* Campos condicionales para Casas/Departamentos */}
              {(newProp.property_type === 'casa' || newProp.property_type === 'departamento') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Habitaciones</label>
                      <input type="number" placeholder="Ej. 3" value={newProp.bedrooms || ''} onChange={e => setNewProp({ ...newProp, bedrooms: Number(e.target.value) || undefined })} className="w-full rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Baños</label>
                      <input type="number" placeholder="Ej. 2" value={newProp.bathrooms || ''} onChange={e => setNewProp({ ...newProp, bathrooms: Number(e.target.value) || undefined })} className="w-full rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Área Construida (m²)</label>
                      <input type="number" placeholder="Ej. 120" value={newProp.built_area || ''} onChange={e => setNewProp({ ...newProp, built_area: Number(e.target.value) || undefined })} className="w-full rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    {newProp.property_type === 'casa' && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Pisos</label>
                        <input type="number" placeholder="Ej. 2" value={newProp.floors || ''} onChange={e => setNewProp({ ...newProp, floors: Number(e.target.value) || undefined })} className="w-full rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Detalles y Especificaciones</label>
                <textarea
                  placeholder="Ej. Vista al mar, incluye cochera doble, acabados de mármol..."
                  value={newProp.details}
                  onChange={e => setNewProp({ ...newProp, details: e.target.value })}
                  className="w-full rounded-lg py-2 px-3 text-[11px] font-medium focus:border-indigo-500 outline-none transition-all h-20 resize-none shadow-inner"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <button type="submit" className="w-full py-3 primary-gradient rounded text-white text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">Sincronizar Inventario</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;