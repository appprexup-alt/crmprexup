
import React, { useState } from 'react';
import { MessageSquare, Phone, MoreVertical, Sparkles, Bot, Clock, Edit2 } from 'lucide-react';
import { Lead } from '../types';
import { getLeadInsight } from '../services/geminiService';

interface LeadCardProps {
  lead: Lead;
  onOpenLead: (lead: Lead) => void;
  onToggleChatbot: (leadId: string, status: boolean) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onOpenLead, onToggleChatbot }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const fetchInsight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingInsight(true);
    const text = await getLeadInsight(lead);
    setInsight(text);
    setLoadingInsight(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenLead(lead)}
      className="border p-2.5 rounded-xl shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all cursor-grab active:cursor-grabbing group"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5">
          <h4 className="text-[10px] font-bold uppercase tracking-tight group-hover:opacity-80 truncate max-w-[90px]" style={{ color: 'var(--text-primary)' }}>{lead.name}</h4>
          <span className={`px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${lead.status === 'activo' ? 'bg-emerald-500/20 text-emerald-400' :
            lead.status === 'inactivo' ? 'bg-slate-500/20 text-slate-400' :
              lead.status === 'pausado' ? 'bg-amber-500/20 text-amber-400' :
                lead.status === 'convertido' ? 'bg-blue-500/20 text-blue-400' :
                  lead.status === 'perdido' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-purple-500/20 text-purple-400'
            }`}>{lead.status || 'nuevo'}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenLead(lead); }}
          className="text-slate-500 hover:text-white transition-colors p-1"
        >
          <Edit2 size={11} />
        </button>
      </div>

      <div className="space-y-1 mb-2.5">
        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          <Phone size={9} className="text-purple-500" /> <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
          <Clock size={9} /> <span className="truncate tracking-tight">Interés: {lead.interest || 'No especificado'}</span>
        </div>
        <div className="text-[11px] font-bold text-emerald-400 mt-1 tracking-tighter uppercase">
          {lead.budget_currency === 'USD' ? '$' : 'S/'} {(lead.budget || 0).toLocaleString()}
        </div>
      </div>

      {insight && (
        <div className="mb-2.5 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[8px] font-bold uppercase text-purple-300 flex items-start gap-1.5 animate-in slide-in-from-top-1 duration-300 tracking-tight">
          <Sparkles size={10} className="shrink-0 mt-0.5 text-purple-400" />
          <p className="leading-tight">{insight}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/${lead.phone.replace('+', '')}`, '_blank');
            }}
            className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          >
            <MessageSquare size={11} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleChatbot(lead.id, !lead.chatbot_enabled);
            }}
            className={`px-1.5 py-0.5 rounded-lg transition-all flex items-center gap-1 border ${lead.chatbot_enabled ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'border-opacity-50'}`}
            style={!lead.chatbot_enabled ? { backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
          >
            <Bot size={11} />
            <span className="text-[7px] font-bold uppercase tracking-widest">{lead.chatbot_enabled ? 'AI' : 'OFF'}</span>
          </button>
        </div>

        <button
          onClick={fetchInsight}
          disabled={loadingInsight}
          className="text-slate-500 hover:text-purple-400 transition-all active:scale-90"
        >
          {loadingInsight ? <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={11} />}
        </button>
      </div>
    </div>
  );
};

export default LeadCard;