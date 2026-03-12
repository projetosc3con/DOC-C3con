import React, { useState, useEffect } from 'react';
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
  Clock,
  Filter,
  X,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

const physicalData = [
  { name: 'Jan', planned: 20, actual: 18 },
  { name: 'Fev', planned: 35, actual: 30 },
  { name: 'Mar', planned: 50, actual: 45 },
  { name: 'Abr', planned: 65, actual: 60 },
  { name: 'Mai', planned: 80, actual: 82 },
  { name: 'Jun', planned: 100, actual: 95 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const topProjects = [
  { name: 'Expansão UPGN', manager: 'João Silva', variance: '+15.2%', value: 'R$ 1.2M' },
  { name: 'Tie-in Submarino', manager: 'Carlos Eduardo', variance: '+12.4%', value: 'R$ 850K' },
  { name: 'Revamp Refino', manager: 'Ana Paula', variance: '+8.7%', value: 'R$ 640K' },
  { name: 'Parada Programada', manager: 'Marcos Costa', variance: '+5.1%', value: 'R$ 420K' },
  { name: 'Nova Linha de Gás', manager: 'Julia Santos', variance: '+2.3%', value: 'R$ 150K' },
];

const bottomProjects = [
  { name: 'Manutenção P-75', manager: 'Roberto Almeida', variance: '-18.5%', value: '-R$ 2.1M' },
  { name: 'Adequação NR-12', manager: 'Fernanda Lima', variance: '-14.2%', value: '-R$ 980K' },
  { name: 'Automação Predial', manager: 'Pedro Henrique', variance: '-9.8%', value: '-R$ 450K' },
  { name: 'Retrofit Elétrico', manager: 'Lucia Gomes', variance: '-6.5%', value: '-R$ 310K' },
  { name: 'Sitema de Refrigeração', manager: 'André Freitas', variance: '-4.1%', value: '-R$ 180K' },
];

const progressData = projects.map(p => ({
  name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
  progress: p.progress
}));

export const DashboardPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    fase: '',
    contratacao: '',
    classificacao: '',
    prioridade: '',
    tipo: '',
    responsavel: ''
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      fase: '',
      contratacao: '',
      classificacao: '',
      prioridade: '',
      tipo: '',
      responsavel: ''
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Dashboard Executivo"
        subtitle="Visão geral do portfólio de projetos e indicadores de desempenho."
      />

      <div className="p-4 sm:p-8 space-y-8">
        {/* Actions Bar */}
        <div className="flex justify-end items-center">
          <button
            onClick={() => setIsFilterOpen(true)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-all relative bg-white dark:bg-slate-900",
              activeFiltersCount > 0
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Filter size={18} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in duration-300">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* KPI Speedometer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { title: 'IEF Acumulado', actual: 95, planned: 100 },
            { title: 'IEF Outlook', actual: 75, planned: 100 },
            { title: 'ROC-I', actual: 110, planned: 100 },
            { title: 'IEFin', actual: 88, planned: 100 },
          ].map((kpi, idx) => {
            // Cálculos do velocímetro:
            // 0 - 200%.  100% fica no centro.
            const percentage = kpi.planned > 0 ? (kpi.actual / kpi.planned) * 100 : 0;
            const isHealthy = percentage >= 85 && percentage <= 100;
            const clampedPercent = Math.min(Math.max(percentage, 0), 200);

            // O ângulo vai de -90deg (esqueda, 0%) a +90deg (direita, 200%)
            const rotationDeg = -90 + (clampedPercent / 200) * 180;

            const textColor = isHealthy
              ? "text-emerald-500"
              : (percentage < 85 ? "text-amber-500" : "text-red-500");

            return (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 pb-28 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center hover:shadow-lg transition-all group">
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 flex flex-col items-center gap-1 text-center">
                  <span className="text-slate-800 dark:text-slate-100 text-sm">{kpi.title}</span>
                </h3>

                <div className="h-[120px] w-full relative flex justify-center mt-2">
                  <div className="absolute inset-0 overflow-hidden" style={{ height: '120px' }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={[
                            { value: 85, fill: '#818cf8' }, // indigo-400
                            { value: 15, fill: '#4f46e5' }, // indigo-600
                            { value: 100, fill: '#c7d2fe' } // indigo-200
                          ]}
                          cx="50%"
                          cy={120}
                          startAngle={180}
                          endAngle={0}
                          innerRadius={75}
                          outerRadius={105}
                          dataKey="value"
                          stroke="none"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Base labels */}
                  <div className="absolute bottom-2 left-0 text-[10px] font-black text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-lg z-10">0%</div>
                  <div className="absolute -top-4 text-[10px] font-black text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full z-10 shadow-sm border border-slate-100 dark:border-slate-800">100%</div>
                  <div className="absolute bottom-2 right-0 text-[10px] font-black text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-lg z-10">200%</div>

                  {/* Needle */}
                  <div
                    className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out z-20"
                    style={{ height: '95px', transform: `translateX(-50%) rotate(${rotationDeg}deg)` }}
                  >
                    {/* Ponteiro */}
                    <div className="w-[4px] h-full rounded-t-full bg-slate-800 dark:bg-slate-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] mx-auto" />
                    {/* Pivô */}
                    <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white border-[5px] border-white dark:border-slate-800 absolute -bottom-3 -left-[10px] shadow-lg" />
                  </div>

                  {/* Text value underneath */}
                  <div className="absolute -bottom-24 left-0 right-0 text-center flex flex-col items-center">
                    <span className={cn("text-3xl font-black tracking-tighter pt-2", textColor)}>
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      {isHealthy ? '✅ Dentro da Meta' : '⚠️ Fora do Indicador'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Chart: Performance Financeira */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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

          {/* Secondary Chart: Avanço Físico */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-lg">Avanço Físico Geral</h3>
                <p className="text-xs text-slate-500">Comparativo entre Avanço Planejado vs Realizado (%)</p>
              </div>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold p-2 outline-none">
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={physicalData}>
                  <defs>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="planned" stroke="#94a3b8" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPlanned)" strokeWidth={2} />
                  <Area type="monotone" dataKey="actual" stroke="#ec4899" fillOpacity={0} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Panel: Financeiro (Melhores / Piores) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-lg">Ranking Financeiro de Projetos</h3>
              <p className="text-xs text-slate-500">Top 5 Superávit vs Top 5 Déficit</p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Metade de Cima: 5 Melhores */}
              <div className="bg-emerald-50/40 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 overflow-hidden flex flex-col">
                <div className="bg-emerald-100/50 dark:bg-emerald-800/20 py-2 px-6 shadow-sm border-b border-emerald-100 dark:border-emerald-800/30">
                  <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} />
                    Top 5 Melhores Lotações / Projetos
                  </h4>
                </div>
                <div className="divide-y divide-emerald-100 dark:divide-emerald-800/20">
                  {topProjects.map((p, i) => (
                    <div key={i} className="py-2.5 px-6 flex justify-between items-center hover:bg-emerald-100/30 dark:hover:bg-emerald-900/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-emerald-600/50 dark:text-emerald-400/50 w-4">{i + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{p.manager}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{p.value}</p>
                        <p className="text-[10px] text-emerald-500/80 font-bold">{p.variance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metade de Baixo: 5 Piores */}
              <div className="bg-red-50/40 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30 overflow-hidden flex flex-col">
                <div className="bg-red-100/50 dark:bg-red-800/20 py-2 px-6 shadow-sm border-b border-red-100 dark:border-red-800/30">
                  <h4 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="rotate-180" />
                    Top 5 Piores Lotações / Projetos
                  </h4>
                </div>
                <div className="divide-y divide-red-100 dark:divide-red-800/20">
                  {bottomProjects.map((p, i) => (
                    <div key={i} className="py-2.5 px-6 flex justify-between items-center hover:bg-red-100/30 dark:hover:bg-red-900/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-red-600/50 dark:text-red-400/50 w-4">{i + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{p.manager}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-600 dark:text-red-400">{p.value}</p>
                        <p className="text-[10px] text-red-500/80 font-bold">{p.variance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offcanvas Filters */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="text-indigo-600" size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Filtros Avançados</h2>
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Tipo de Projeto (Mocked for now) */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Projeto</label>
                    <select
                      value={filters.tipo}
                      onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os tipos</option>
                      <option value="Construção">Construção</option>
                      <option value="TI">TI</option>
                    </select>
                  </div>

                  {/* Fase */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fase do Projeto</label>
                    <select
                      value={filters.fase}
                      onChange={(e) => setFilters({ ...filters, fase: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as fases</option>
                      <option value="Iniciação">Iniciação</option>
                      <option value="Planejamento">Planejamento</option>
                      <option value="Execução">Execução</option>
                      <option value="Monitoramento">Monitoramento</option>
                      <option value="Encerramento">Encerramento</option>
                    </select>
                  </div>

                  {/* Classificação */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Classificação</label>
                    <select
                      value={filters.classificacao}
                      onChange={(e) => setFilters({ ...filters, classificacao: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as classificações</option>
                      <option value="Estratégico">Estratégico</option>
                      <option value="Operacional">Operacional</option>
                    </select>
                  </div>

                  {/* Contratação */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contratação</label>
                    <select
                      value={filters.contratacao}
                      onChange={(e) => setFilters({ ...filters, contratacao: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as contratações</option>
                      <option value="Interna">Interna</option>
                      <option value="Externa">Externa</option>
                    </select>
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prioridade</label>
                    <select
                      value={filters.prioridade}
                      onChange={(e) => setFilters({ ...filters, prioridade: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as prioridades</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>

                  {/* Responsável */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Responsável</label>
                    <select
                      value={filters.responsavel}
                      onChange={(e) => setFilters({ ...filters, responsavel: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os responsáveis</option>
                      {/* Will populate from API or dynamic data later */}
                    </select>
                  </div>

                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Limpar
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-center"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
