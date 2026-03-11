import React from 'react';
import { Header } from '../components/layout/Header';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { projects } from '../constants';
import { cn } from '../lib/utils';

const data = [
  { name: 'Jan', budget: 4000, actual: 2400 },
  { name: 'Fev', budget: 3000, actual: 1398 },
  { name: 'Mar', budget: 2000, actual: 9800 },
  { name: 'Abr', budget: 2780, actual: 3908 },
  { name: 'Mai', budget: 1890, actual: 4800 },
  { name: 'Jun', budget: 2390, actual: 3800 },
];

const healthData = [
  { name: 'Estável', value: projects.filter(p => p.health === 'Estável').length },
  { name: 'Em Atenção', value: projects.filter(p => p.health === 'Em Atenção').length },
  { name: 'Crítico', value: projects.filter(p => p.health === 'Crítico').length },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const progressData = projects.map(p => ({
  name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
  progress: p.progress
}));

export const DashboardPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Dashboard Executivo" 
        subtitle="Visão geral do portfólio de projetos e indicadores de desempenho." 
      />
      
      <div className="p-4 sm:p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                <Briefcase size={24} />
              </div>
              <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <ArrowUpRight size={14} />
                +12%
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Projetos Ativos</h3>
            <p className="text-2xl font-black mt-1">{projects.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                <TrendingUp size={24} />
              </div>
              <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <ArrowUpRight size={14} />
                +5.4%
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">ROI Médio</h3>
            <p className="text-2xl font-black mt-1">24.8%</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                <Users size={24} />
              </div>
              <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                <ArrowDownRight size={14} />
                -2%
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Alocação de Recursos</h3>
            <p className="text-2xl font-black mt-1">88.2%</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <span className="text-slate-400 text-xs font-bold">Meta: 0</span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Riscos Críticos</h3>
            <p className="text-2xl font-black mt-1">3</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Budget vs Actual */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-lg">Performance Financeira</h3>
                <p className="text-xs text-slate-500">Comparativo entre Orçamento Planejado vs Realizado (K R$)</p>
              </div>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold p-2 outline-none">
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="budget" stroke="#4f46e5" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={3} />
                  <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={0} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Saúde do Portfólio</h3>
            <p className="text-xs text-slate-500 mb-8">Distribuição de status dos projetos ativos</p>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{projects.length}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {healthData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Progress Bar Chart */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Progresso por Projeto (%)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="progress" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Activity & Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              Atividades Recentes
            </h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-slate-50">Carlos Silva</span> publicou um comentário em <span className="text-indigo-600 font-bold">Expansão de Data Center</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Há 2 horas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              Próximos Prazos
            </h3>
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      project.health === 'Estável' ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <span className="text-sm font-bold">{project.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-50">{project.deadline}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Entrega Final</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
