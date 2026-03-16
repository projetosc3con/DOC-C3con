import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockCapexMonthlyData = [
  { name: 'Jan', previsto: 150000, realizado: 145000, projetado: 145000 },
  { name: 'Fev', previsto: 180000, realizado: 190000, projetado: 190000 },
  { name: 'Mar', previsto: 200000, realizado: 195000, projetado: 195000 },
  { name: 'Abr', previsto: 170000, realizado: 175000, projetado: 175000 },
  { name: 'Mai', previsto: 220000, realizado: 240000, projetado: 240000 },
  { name: 'Jun', previsto: 250000, realizado: 230000, projetado: 230000 },
  { name: 'Jul', previsto: 210000, realizado: 0, projetado: 215000 },
  { name: 'Ago', previsto: 190000, realizado: 0, projetado: 185000 },
  { name: 'Set', previsto: 230000, realizado: 0, projetado: 230000 },
  { name: 'Out', previsto: 240000, realizado: 0, projetado: 245000 },
  { name: 'Nov', previsto: 260000, realizado: 0, projetado: 260000 },
  { name: 'Dez', previsto: 300000, realizado: 0, projetado: 310000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const ProjectFinancial = ({ projectId }: { projectId: number }) => {
  const currentMonthIndex = 5; // Junho

  const rows = ['Previsto', 'Realizado', 'Projetado'];
  const months = mockCapexMonthlyData.map(d => d.name);

  const calculateTotal = (rowKey: 'previsto' | 'realizado' | 'projetado') => {
    return mockCapexMonthlyData.reduce((acc, curr) => acc + curr[rowKey], 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Orçamento Total</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(calculateTotal('previsto'))}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Realizado Acumulado</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(calculateTotal('realizado'))}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Projeção Final</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(calculateTotal('projetado'))}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Capex Chart */}
      <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Desenvolvimento CAPEX</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Comparativo mensal Previsto vs Realizado</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockCapexMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                tickFormatter={(value) => `R$${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Area 
                type="monotone" 
                dataKey="previsto" 
                name="Previsto"
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorPrevisto)" 
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="realizado" 
                name="Realizado"
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRealizado)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Detalhamento Financeiro</h3>
        </div>
        <div className="overflow-x-auto scrollbar-custom">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 sticky left-0 bg-slate-50 dark:bg-zinc-800 z-10 w-40">Categoria</th>
                {months.map(month => (
                  <th key={month} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 text-center min-w-[100px]">{month}</th>
                ))}
                <th className="px-6 py-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 text-right sticky right-0 bg-slate-50 dark:bg-zinc-800 z-10">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {rows.map((rowLabel) => {
                const key = rowLabel.toLowerCase() as 'previsto' | 'realizado' | 'projetado';
                return (
                  <tr key={rowLabel} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-slate-50 dark:border-zinc-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      {rowLabel}
                    </td>
                    {mockCapexMonthlyData.map((data, idx) => (
                      <td key={idx} className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                        {data[key] === 0 && key === 'realizado' && idx >= currentMonthIndex ? '--' : formatCurrency(data[key])}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-xs font-black text-slate-800 dark:text-slate-100 text-right sticky right-0 bg-white dark:bg-zinc-900 z-10 border-l border-slate-50 dark:border-zinc-800 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                      {formatCurrency(calculateTotal(key))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
