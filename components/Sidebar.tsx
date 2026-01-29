
import React from 'react';
import { supabase } from '../lib/supabase.ts';
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  TrendingUp,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logoUrl?: string;
  companyName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, activeTab, setActiveTab, logoUrl, companyName = 'Prex CRM' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Inicio' },
    { id: 'leads', label: 'Leads (CRM)', icon: Target, shortLabel: 'Leads' },
    { id: 'conversations', label: 'WhatsApp', icon: MessageCircle, shortLabel: 'Chat' },
    { id: 'properties', label: 'Propiedades', icon: Building2, shortLabel: 'Props' },
    { id: 'sales', label: 'Ventas', icon: TrendingUp, shortLabel: 'Ventas' },
    { id: 'tasks', label: 'Calendario', icon: Calendar, shortLabel: 'Tareas' },
    { id: 'admin', label: 'Administración', icon: ShieldCheck, shortLabel: 'Admin' },
    { id: 'settings', label: 'Configuración', icon: Settings, shortLabel: 'Config' },
  ];

  const handleLogout = async () => {
    if (confirm('¿Cerrar sesión de Prex CRM?')) {
      await supabase.auth.signOut();
    }
  };

  // Mobile bottom navigation (mostrar solo items principales)
  const mobileMenuItems = menuItems.filter(item =>
    ['dashboard', 'leads', 'conversations', 'tasks', 'properties', 'settings'].includes(item.id)
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 z-50 flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 flex items-center justify-between h-20 border-b border-slate-800/50">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 object-contain shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center font-bold text-white shrink-0">
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-base tracking-tight truncate text-white">{companyName}</span>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center font-bold text-white">
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id
                ? 'sidebar-item-active text-white'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {!collapsed && <span className="font-medium text-[11px] uppercase tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-all rounded-xl border border-transparent hover:border-slate-700"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="font-bold text-[9px] uppercase tracking-[0.2em]">Ocultar Menú</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-rose-500 hover:bg-rose-500/10 transition-colors rounded-xl group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            {!collapsed && <span className="font-bold text-[9px] uppercase tracking-[0.2em]">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${activeTab === item.id
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-slate-400 active:bg-slate-800'
                }`}
            >
              <item.icon
                className="w-5 h-5 shrink-0"
                strokeWidth={activeTab === item.id ? 2.5 : 2}
              />
              <span className="text-[9px] font-bold uppercase tracking-wide truncate max-w-[60px]">
                {item.shortLabel}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
