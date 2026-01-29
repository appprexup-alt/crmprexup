
import React from 'react';
import { Task } from '../types';
import { AlarmClock, Bell, X } from 'lucide-react';

interface AlarmModalProps {
    task: Task;
    onDismiss: () => void;
}

const AlarmModal: React.FC<AlarmModalProps> = ({ task, onDismiss }) => {
    return (
        <div className="fixed top-5 right-5 z-[250] w-full max-w-sm animate-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/10 p-5 text-white relative overflow-hidden">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full animate-ping opacity-50"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                            <AlarmClock size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-amber-400 text-sm uppercase tracking-widest">Recordatorio</h3>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Tarea programada en 5 minutos</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-1 mb-4">
                         <p className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">{task.description}</p>
                         <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                            {new Date(task.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                    </div>

                    <button 
                        onClick={onDismiss}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Bell size={14} /> Desactivar Alarma
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlarmModal;
