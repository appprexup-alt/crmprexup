
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Funnel, FunnelChart, LabelList, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { AppState } from '../types.ts';
import {
  Users, Target, TrendingUp, Phone, BarChart2, GitCommit, Share2, Award
} from 'lucide-react';
import RecommendedActions from './RecommendedActions.tsx';

interface DashboardProps {
  state: AppState;
  onActionClick: (type: string, id: string) => void;
}

const KPICard = ({ title, value, icon: Icon, colorClass, footer, compact = false }: { title: string, value: string | number, icon: React.ElementType, colorClass: string, footer: string, compact?: boolean }) => {
  const color = colorClass.replace('bg-', '').replace('-500', '');
  // Colores vibrantes con gradientes y sombras que resaltan en modo claro
  const styles: any = {
    purple: {
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      iconText: 'text-white',
      shadow: 'shadow-purple-500/30',
      accent: 'border-l-purple-500'
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      iconText: 'text-white',
      shadow: 'shadow-amber-500/30',
      accent: 'border-l-amber-500'
    },
    pink: {
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
      iconText: 'text-white',
      shadow: 'shadow-pink-500/30',
      accent: 'border-l-pink-500'
    },
    emerald: {
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
      iconText: 'text-white',
      shadow: 'shadow-emerald-500/30',
      accent: 'border-l-emerald-500'
    },
  };
  const currentStyle = styles[color] || { iconBg: 'bg-slate-600', iconText: 'text-white', shadow: '', accent: 'border-l-slate-500' };

  return (
    <div
      className={`border border-l-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${currentStyle.accent} ${currentStyle.shadow} ${compact ? 'p-3' : 'p-4'}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`rounded-xl shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${currentStyle.iconBg} ${currentStyle.iconText} ${compact ? 'w-10 h-10' : 'w-11 h-11'}`}>
          <Icon className={compact ? 'w-[18px] h-[18px]' : 'w-5 h-5'} strokeWidth={2.5} />
        </div>
      </div>
      <p className={`font-black tracking-tighter ${compact ? 'text-2xl' : 'text-3xl'}`} style={{ color: 'var(--text-primary)' }}>{value}</p>
      <h3 className={`font-bold uppercase tracking-[0.15em] mt-1 ${compact ? 'text-[8px]' : 'text-[9px]'}`} style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      <p className={`font-semibold uppercase tracking-wider mt-3 pt-2 border-t ${compact ? 'text-[7px]' : 'text-[8px]'}`} style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>{footer}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ state, onActionClick }) => {

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const kpis = useMemo(() => {
    const leadsMes = state.leads.filter(l => new Date(l.created_at) >= startOfMonth);
    const ventasMes = state.sales.filter(s => new Date(s.created_at) >= startOfMonth);
    const tasaConversion = leadsMes.length > 0 ? ((ventasMes.length / leadsMes.length) * 100).toFixed(1) + '%' : '0%';

    return {
      nuevosLeadsHoy: state.leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
      contactosPendientes: state.leads.filter(l => l.pipeline_stage_id === '1').length,
      unidadesVendidasMes: ventasMes.length,
      tasaConversionMes: tasaConversion,
    };
  }, [state]);

  const advisorPerformanceData = useMemo(() => {
    const advisorMetrics = state.users.map(user => {
      const leadsCount = state.leads.filter(l => l.advisor_id === user.id).length;
      const salesCount = state.sales.filter(s => s.advisor_id === user.id).length;
      return {
        name: user.name.split(' ')[0],
        leads: leadsCount,
        sales: salesCount,
      };
    });
    return advisorMetrics;
  }, [state.leads, state.sales, state.users]);

  const leadSourceData = useMemo(() => {
    const sourceCounts = state.leads.reduce((acc, lead) => {
      const source = state.lead_sources.find(s => s.id === lead.source_id);
      const sourceName = source ? source.name : 'Desconocido';
      acc[sourceName] = (acc[sourceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
  }, [state.leads, state.lead_sources]);

  const pipelineData = useMemo(() => {
    const validStages = state.stages
      .filter(s => s.name.toLowerCase() !== 'descartado')
      .sort((a, b) => a.order - b.order);

    const data = validStages.map(stage => ({
      name: stage.name,
      value: state.leads.filter(l => l.pipeline_stage_id === stage.id).length,
      fill: stage.color
    }));

    const totalLeads = data.reduce((sum, item) => sum + item.value, 0) || 1;

    return data.map(d => ({
      ...d,
      percentage: ((d.value / totalLeads) * 100).toFixed(0) + '%'
    }));
  }, [state.stages, state.leads]);

  // Paleta de colores vibrantes optimizada para modo claro
  const COLORS = ['#7c3aed', '#f59e0b', '#ec4899', '#10b981', '#6366f1', '#3b82f6', '#ef4444'];

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pr-2 min-h-0 min-w-0">
      <header>
        <h1 className="text-lg font-bold tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>Dashboard <span className="primary-gradient-text">Analítico</span></h1>
        <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Inteligencia de Negocio y KPIs</p>
      </header>

      <RecommendedActions state={state} onActionClick={onActionClick} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <KPICard title="Nuevos Leads (Hoy)" value={kpis.nuevosLeadsHoy} icon={Users} colorClass="bg-purple-500" footer="Captura diaria" compact />
        <KPICard title="Contactos Pendientes" value={kpis.contactosPendientes} icon={Phone} colorClass="bg-amber-500" footer="Etapa: Nuevo" compact />
        <KPICard title="Ventas del Mes" value={kpis.unidadesVendidasMes} icon={Target} colorClass="bg-pink-500" footer="Cierres Exitosos" compact />
        <KPICard title="Tasa de Conversión" value={kpis.tasaConversionMes} icon={TrendingUp} colorClass="bg-emerald-500" footer="Este Mes" compact />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
        <div className="border p-4 rounded-2xl h-[260px] flex flex-col min-h-0 relative shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart2 size={12} className="text-white" />
            </div>
            Carga por Asesor
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advisorPerformanceData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={9} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.08)' }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]} barSize={24} fill="url(#purpleGradient)" />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border p-4 rounded-2xl h-[260px] flex flex-col min-h-0 relative shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Award size={12} className="text-white" />
            </div>
            Eficiencia por Asesor
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advisorPerformanceData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={9} width={55} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Bar dataKey="sales" name="Ventas" fill="url(#emeraldGradient)" radius={[0, 6, 6, 0]} barSize={10} />
                <Bar dataKey="leads" name="Leads" fill="url(#purpleGradient2)" radius={[0, 6, 6, 0]} barSize={10} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', paddingTop: '8px' }} />
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="purpleGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border p-4 rounded-2xl h-[260px] flex flex-col min-h-0 relative shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Share2 size={12} className="text-white" />
            </div>
            Origen de Leads
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  className="text-[9px] font-bold"
                >
                  {leadSourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border p-4 rounded-2xl h-[260px] flex flex-col min-h-0 relative shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <GitCommit size={12} className="text-white" />
            </div>
            Embudo de Conversión
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Funnel
                  dataKey="value"
                  data={pipelineData}
                  isAnimationActive
                  labelLine={false}
                >
                  {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />)}
                  <LabelList
                    position="center"
                    fill="#fff"
                    stroke="none"
                    content={(props: any) => {
                      const { x, y, width, height, value, index } = props;
                      const entry = pipelineData[index];
                      if (!entry) return null;
                      // Safety check for NaN values
                      const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
                      const safeY = typeof y === 'number' && !isNaN(y) ? y : 0;
                      const safeWidth = typeof width === 'number' && !isNaN(width) ? width : 0;
                      const safeHeight = typeof height === 'number' && !isNaN(height) ? height : 0;
                      const centerX = safeX + safeWidth / 2;
                      const centerY = safeY + safeHeight / 2;
                      return (
                        <g>
                          <text x={centerX} y={centerY - 4} fill="#fff" textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-black">
                            {entry.percentage}
                          </text>
                          <text x={centerX} y={centerY + 8} fill="#cbd5e1" textAnchor="middle" dominantBaseline="middle" className="text-[6px] font-bold uppercase tracking-widest opacity-80">
                            {entry.name}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
