
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
  const styles: any = {
    purple: 'bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-purple-500/20',
    amber: 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-amber-500/20',
    pink: 'bg-pink-500/10 border-pink-500/40 text-pink-300 shadow-pink-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-emerald-500/20',
  };
  const currentStyle = styles[color] || 'bg-slate-800 border-slate-700 text-slate-300';

  return (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700 transition-all group relative overflow-hidden ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className={`rounded-xl border shadow-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${currentStyle} ${compact ? 'w-9 h-9' : 'w-10 h-10'}`}>
          <Icon className={compact ? 'w-[18px] h-[18px]' : 'w-5 h-5'} strokeWidth={2.5} />
        </div>
      </div>
      <p className={`font-black text-white tracking-tighter ${compact ? 'text-2xl' : 'text-3xl'}`}>{value}</p>
      <h3 className={`text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 ${compact ? 'text-[8px]' : 'text-[9px]'}`}>{title}</h3>
      <p className={`text-slate-500 font-bold uppercase tracking-wider mt-3 pt-2 border-t border-slate-800/50 ${compact ? 'text-[7px]' : 'text-[8px]'}`}>{footer}</p>
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

  const COLORS = ['#8a3ab9', '#fcc669', '#e94c74', '#10b981', '#8b5cf6', '#3b82f6', '#f59e0b'];

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pr-2 min-h-0 min-w-0">
      <header>
        <h1 className="text-lg font-bold text-white tracking-tight uppercase">Dashboard <span className="primary-gradient-text">Analítico</span></h1>
        <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-widest">Inteligencia de Negocio y KPIs</p>
      </header>

      <RecommendedActions state={state} onActionClick={onActionClick} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <KPICard title="Nuevos Leads (Hoy)" value={kpis.nuevosLeadsHoy} icon={Users} colorClass="bg-purple-500" footer="Captura diaria" compact />
        <KPICard title="Contactos Pendientes" value={kpis.contactosPendientes} icon={Phone} colorClass="bg-amber-500" footer="Etapa: Nuevo" compact />
        <KPICard title="Ventas del Mes" value={kpis.unidadesVendidasMes} icon={Target} colorClass="bg-pink-500" footer="Cierres Exitosos" compact />
        <KPICard title="Tasa de Conversión" value={kpis.tasaConversionMes} icon={TrendingUp} colorClass="bg-emerald-500" footer="Este Mes" compact />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl h-[240px] flex flex-col min-h-0 relative">
          <h3 className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
            <BarChart2 size={12} className="text-indigo-400" />
            Carga por Asesor
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advisorPerformanceData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={8} axisLine={false} tickLine={false} tick={{ textTransform: 'uppercase' }} />
                <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(138, 58, 185, 0.1)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }} />
                <Bar dataKey="leads" name="Leads" radius={[4, 4, 0, 0]} barSize={12} fill="#8a3ab9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl h-[240px] flex flex-col min-h-0 relative">
          <h3 className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
            <Award size={12} className="text-indigo-400" />
            Eficiencia por Asesor
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advisorPerformanceData} layout="vertical" margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={8} width={50} axisLine={false} tickLine={false} tick={{ textTransform: 'uppercase' }} />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.3)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }} />
                <Bar dataKey="sales" name="Ventas" fill="#10b981" radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="leads" name="Leads" fill="#8a3ab9" radius={[0, 4, 4, 0]} barSize={8} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', bottom: -10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl h-[240px] flex flex-col min-h-0 relative">
          <h3 className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
            <Share2 size={12} className="text-indigo-400" />
            Origen de Leads
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadSourceData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={30} outerRadius={50} paddingAngle={5} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} className="text-[8px] uppercase font-bold">
                  {leadSourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', bottom: 0, }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl h-[240px] flex flex-col min-h-0 relative">
          <h3 className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
            <GitCommit size={12} className="text-indigo-400" />
            Embudo de Conversión
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
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
