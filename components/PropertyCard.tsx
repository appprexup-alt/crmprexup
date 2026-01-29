
import React from 'react';
import { Maximize2, MapPin, Tag, MoreHorizontal, Building, Home, Trash2, Edit2, CheckCircle, Package, Lock, Clock } from 'lucide-react';
import { Property, Project } from '../types';

interface PropertyCardProps {
  property: Property;
  project?: Project;
  onDelete?: (id: string) => void;
  onEdit?: (prop: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, project, onDelete, onEdit }) => {
  const pricePerM2 = property.area && property.area > 0 ? property.price / property.area : 0;
  const currencySymbol = property.currency === 'USD' ? '$' : 'S/';

  const isSold = property.status === 'vendido';
  const isBlocked = property.status === 'bloqueado';
  const isReserved = property.status === 'separado';

  const getStatusConfig = () => {
    switch (property.status) {
      case 'vendido': return { color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', label: 'Vendido', icon: CheckCircle };
      case 'separado': return { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', label: 'Separado', icon: Clock };
      case 'bloqueado': return { color: 'text-slate-400', border: 'border-slate-500/20', bg: 'bg-slate-500/10', label: 'Bloqueado', icon: Lock };
      default: return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', label: 'Disponible', icon: Home };
    }
  };

  const handleDeleteWithConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('PropertyCard: handleDeleteWithConfirmation clicked for prop:', property.id);
    if (window.confirm(`¿Seguro que quieres eliminar la propiedad "${property.description}"?`)) {
      console.log('PropertyCard: Confirmed, calling onDelete');
      onDelete?.(property.id);
    } else {
      console.log('PropertyCard: Cancelled or confirm failed');
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className={`bg-slate-900/50 border rounded-lg overflow-hidden transition-all group relative ${isSold ? 'border-rose-500/30 opacity-80' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="h-40 bg-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-10" />
        <img
          src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80`}
          alt={property.description}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSold || isBlocked ? 'grayscale' : ''}`}
        />
        <div className="absolute top-3 left-3 z-20 flex justify-between w-[calc(100%-1.5rem)]">
          <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
            {project?.name || 'Inmobiliaria'}
          </span>
          {!isSold && (
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(property); }} className="p-1.5 bg-slate-900/80 text-white rounded-md hover:bg-indigo-500 transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={10} /></button>
              <button onClick={handleDeleteWithConfirmation} className="p-1.5 bg-slate-900/80 text-white rounded-md hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={10} /></button>
            </div>
          )}
        </div>

        {isSold && (
          <div className="absolute inset-0 z-25 flex items-center justify-center">
            <div className="bg-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-2xl rotate-12 border-2 border-white/20">VENDIDO</div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-20">
          <p className="text-white font-black text-lg leading-tight tracking-tighter">{currencySymbol}{property.price.toLocaleString()}</p>
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">{currencySymbol}{pricePerM2.toFixed(2)} / m²</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-slate-100 font-black text-[11px] truncate uppercase tracking-tight group-hover:text-white transition-colors">
            {property.description}
          </h3>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[8px] font-bold uppercase tracking-widest">
              <Building size={8} className="text-indigo-500" />
              <span>{project?.name || 'Proyecto'}</span>
            </div>
            {property.location && (
              <div className="flex items-center gap-1.5 text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                <MapPin size={8} className="text-indigo-400" />
                <span className="truncate">{property.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg flex items-center gap-2">
            <Package size={12} className="text-slate-600" />
            <div className="text-[9px]">
              <p className="text-slate-600 leading-none font-black uppercase tracking-tighter">Metraje</p>
              <p className="text-slate-300 font-black mt-0.5">{property.area} m²</p>
            </div>
          </div>
          <div className={`bg-slate-950 border p-2 rounded-lg flex items-center gap-2 ${status.border}`}>
            <StatusIcon size={12} className={status.color.replace('text-', 'text-')} />
            <div className="text-[9px]">
              <p className="text-slate-600 leading-none font-black uppercase tracking-tighter">Status</p>
              <p className={`font-black mt-0.5 uppercase ${status.color}`}>
                {status.label}
              </p>
            </div>
          </div>
        </div>

        {property.status === 'disponible' && (
          <button className="w-full py-2.5 primary-gradient text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 shadow-lg shadow-red-500/10 transition-all">
            Iniciar Venta
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;