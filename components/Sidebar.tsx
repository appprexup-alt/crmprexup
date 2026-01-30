
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

  // Mobile bottom navigation - todos los items
  const mobileMenuItems = menuItems;

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen transition-all duration-300 z-50 flex-col shadow-xl ${collapsed ? 'w-20' : 'w-64'}`} style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', boxShadow: '4px 0 20px rgba(0,0,0,0.08)' }}>
        <div className="p-4 flex items-center justify-between h-20" style={{ borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 object-contain shrink-0" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center font-bold text-white shrink-0">
                    {companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-base tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{companyName}</span>
                </>
              )}
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
                ? 'sidebar-item-active'
                : ''
                }`}
              style={{
                color: activeTab === item.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-hover)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                }
              }}
            >
              <item.icon className="w-5 h-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {!collapsed && <span className="font-medium text-[11px] uppercase tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--sidebar-bg)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 p-3 transition-all rounded-xl border border-transparent"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-hover)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
            }}
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

      {/* Mobile Bottom Navigation - Compact with horizontal scroll */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom backdrop-blur-xl" style={{ backgroundColor: 'var(--sidebar-bg)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-1 py-1.5 overflow-x-auto scrollbar-hide">
          {mobileMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] px-1.5 py-1.5 rounded-xl transition-all shrink-0 ${activeTab === item.id
                ? 'text-purple-500 bg-purple-500/15 shadow-sm'
                : ''
                }`}
              style={activeTab !== item.id ? { color: 'var(--text-tertiary)' } : {}}
            >
              <item.icon
                className="w-4 h-4 shrink-0"
                strokeWidth={activeTab === item.id ? 2.5 : 1.8}
              />
              <span className="text-[7px] font-bold uppercase tracking-tight">
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
