import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrencyMil = (value: number) => {
  return 'R$mil ' + new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const ProjectPlanning = ({ projectId }: { projectId: number }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [dadosCrono, setDadosCrono] = useState<any[]>([]);
  const [cronoProj, setCronoProj] = useState<any>(null);
  const [totalPrevistoPN, setTotalPrevistoPN] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentMonthIndex = new Date().getMonth();
  const rows = ['Previsto', 'Realizado', 'Projetado'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const year = new Date().getFullYear();
        const futureYears = Array.from({ length: 2050 - 2026 }, (_, i) => 2027 + i);

        const [previstoRes, realizadoRes, projetadoRes, pnRes, replanRes, cronoProjRes, dadosCronoRes] = await Promise.all([
          supabase.from('FinanceiroPrevisto').select('*').eq('idProjeto', projectId).eq('anoCarga', year),
          supabase.from('FinanceiroRealizado').select('*').eq('idProjeto', projectId).eq('anoCarga', year),
          supabase.from('FinanceiroProjetado').select('*').eq('idProjeto', projectId).eq('anoCarga', year),
          supabase.from('PrevistoPN').select('ano, valor').eq('idProjeto', projectId),
          supabase.from('ReplanPN').select('ano, valor').eq('idProjeto', projectId),
          supabase.from('CronogramaProjeto').select('*').eq('idProjeto', projectId).maybeSingle(),
          supabase.from('DadosCronograma').select('*').eq('idProjeto', projectId)
        ]);

        const previstoData = previstoRes.data || [];
        const realizadoData = realizadoRes.data || [];
        const projetadoData = projetadoRes.data || [];
        const pnData = pnRes.data || [];
        const replanData = replanRes.data || [];

        const monthKeys = ['valorJAN', 'valorFEV', 'valorMAR', 'valorABR', 'valorMAI', 'valorJUN', 'valorJUL', 'valorAGO', 'valorSET', 'valorOUT', 'valorNOV', 'valorDEZ'];

        const sumData = (data: any[], col: string) => data.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
        const totalPN = pnData.reduce((acc, row) => acc + (Number(row.valor) || 0), 0);

        // 1. Map months for the current year
        const data: any[] = monthNames.map((name, index) => {
          const key = monthKeys[index];
          const previsto = sumData(previstoData, key);
          const realizado = sumData(realizadoData, key);
          const projetado = sumData(projetadoData, key);

          return {
            name,
            previsto,
            realizado,
            projetado
          };
        });

        // 2. Map years for the future
        const yearsData: any[] = futureYears.map(yearNum => {
          const previsto = pnData
            .filter(r => Number(r.ano) === yearNum)
            .reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
          const projetado = replanData
            .filter(r => Number(r.ano) === yearNum)
            .reduce((acc, r) => acc + (Number(r.valor) || 0), 0);

          return {
            name: String(yearNum),
            previsto,
            realizado: 0,
            projetado
          };
        });

        const fullData = [...data, ...yearsData];

        // Chart accumulators (only for months)
        let currentPrevistoAcc = 0;
        let currentRealizadoAcc = 0;
        let currentProjetadoAcc = 0;

        for (let i = 0; i < 12; i++) {
          currentPrevistoAcc += data[i].previsto;
          data[i].chartPrevisto = currentPrevistoAcc;

          if (i < currentMonthIndex) {
            currentRealizadoAcc += data[i].realizado;
            data[i].chartRealizado = currentRealizadoAcc;
            currentProjetadoAcc = currentRealizadoAcc;
          } else {
            currentProjetadoAcc += data[i].projetado;
            data[i].chartProjetado = currentProjetadoAcc;
          }
        }

        if (currentMonthIndex > 0 && currentMonthIndex < 12) {
          data[currentMonthIndex - 1].chartProjetado = data[currentMonthIndex - 1].chartRealizado;
        }

        setChartData(data); // Chart uses only the 12 months (or however many entries have chartPrevisto)
        setTableData(fullData);
        setTotalPrevistoPN(totalPN);
        setCronoProj(cronoProjRes.data);
        setDadosCrono(dadosCronoRes.data || []);
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const calculateTotal = (rowKey: 'previsto' | 'realizado' | 'projetado') => {
    return tableData.reduce((acc, curr) => acc + (curr[rowKey] || 0), 0);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800"
      >
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Carregando dados financeiros...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total previsto</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrencyMil(calculateTotal('previsto'))}</h4>
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
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrencyMil(calculateTotal('realizado'))}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Projetado</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrencyMil(calculateTotal('projetado'))}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Data Column */}
        <div className="space-y-8">
          {/* Capex Chart */}
          <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Desenvolvimento CAPEX</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Comparativo acumulado Previsto vs Real/Projetado</p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="chartPrevisto"
                    name="Previsto"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorPrevisto)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="chartRealizado"
                    name="Realizado"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRealizado)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="chartProjetado"
                    name="Projetado"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorProjetado)"
                    strokeWidth={3}
                    strokeDasharray="5 5"
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
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 sticky left-0 bg-slate-50 dark:bg-zinc-800 z-10 w-40">Mês</th>
                    {rows.map(col => (
                      <th key={col} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 text-center min-w-[100px]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {tableData.slice(0, 12).map((data, idx) => (
                    <tr key={data.name} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-slate-50 dark:border-zinc-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        {data.name}
                      </td>
                      {rows.map((rowLabel) => {
                        const key = rowLabel.toLowerCase() as 'previsto' | 'realizado' | 'projetado';
                        return (
                          <td key={key} className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                            {data[key] === 0 && key === 'realizado' && idx >= currentMonthIndex ? '--' : formatCurrency(data[key])}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Range Rows */}
                  {(() => {
                    const futureData = tableData.slice(12);
                    const range27_30 = futureData.filter(d => Number(d.name) >= 2027 && Number(d.name) <= 2030);
                    const range31_50 = futureData.filter(d => Number(d.name) >= 2031 && Number(d.name) <= 2050);

                    const ranges = [
                      {
                        name: '2027-30',
                        previsto: range27_30.reduce((acc, curr) => acc + (curr.previsto || 0), 0),
                        projetado: range27_30.reduce((acc, curr) => acc + (curr.projetado || 0), 0),
                      },
                      {
                        name: '2031-50',
                        previsto: range31_50.reduce((acc, curr) => acc + (curr.previsto || 0), 0),
                        projetado: range31_50.reduce((acc, curr) => acc + (curr.projetado || 0), 0),
                      }
                    ];

                    return ranges.map(range => (
                      <tr key={range.name} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-slate-50 dark:border-zinc-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          {range.name}
                        </td>
                        {rows.map((rowLabel) => {
                          const key = rowLabel.toLowerCase() as 'previsto' | 'realizado' | 'projetado';
                          if (key === 'realizado') {
                            return <td key={key} className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">--</td>;
                          }
                          return (
                            <td key={key} className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                              {formatCurrency(range[key as 'previsto' | 'projetado'])}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                  <tr className="bg-slate-50 dark:bg-zinc-800/50">
                    <td className="px-6 py-4 text-xs font-black text-slate-800 dark:text-slate-100 sticky left-0 bg-slate-50 dark:bg-zinc-800 z-10 border-r border-slate-100 dark:border-zinc-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      Total
                    </td>
                    {rows.map((rowLabel) => {
                      const key = rowLabel.toLowerCase() as 'previsto' | 'realizado' | 'projetado';
                      return (
                        <td key={key} className="px-6 py-4 text-xs font-black text-indigo-600 text-center border-t-2 border-slate-200 dark:border-zinc-700">
                          {formatCurrencyMil(calculateTotal(key))}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mocked Data Column */}
        <div className="space-y-8">
          {/* Physical Progress (Avanço Físico) Chart */}
          <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Avanço Físico</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Curva de desenvolvimento do projeto
                  {cronoProj?.dataStatus && ` • Status: ${cronoProj.dataStatus.split('-').reverse().join('/')}`}
                </p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {(() => {
                const grouped = dadosCrono.reduce((acc, curr) => {
                  const mY = curr.mesAno;
                  if (!mY) return acc;
                  if (!acc[mY]) {
                    acc[mY] = { mesAno: mY, trabAcumLb: 0, trabAcum: 0, trabAcumReal: 0 };
                  }
                  acc[mY].trabAcumLb += Number(curr.trabAcumLb) || 0;
                  acc[mY].trabAcum += Number(curr.trabAcum) || 0;
                  acc[mY].trabAcumReal += Number(curr.trabAcumReal) || 0;
                  return acc;
                }, {} as Record<string, any>);

                const trabTotalLb = Number(cronoProj?.trabTotalLb) || 1;
                const trabTotal = Number(cronoProj?.trabTotal) || 1;

                let statusYear = 9999;
                let statusMonth = 99;
                if (cronoProj?.dataStatus) {
                  const [y, m] = cronoProj.dataStatus.split('-');
                  statusYear = Number(y);
                  statusMonth = Number(m);
                }

                const physicalProgressData = Object.values(grouped)
                  .map((item: any) => {
                    const [mStr, yStr] = item.mesAno.split('-');
                    const itemMonth = Number(mStr);
                    const itemYear = Number(yStr);
                    const isAfterStatus = itemYear > statusYear || (itemYear === statusYear && itemMonth > statusMonth);

                    return {
                      name: item.mesAno,
                      percentPrevisto: (item.trabAcumLb / trabTotalLb) * 100,
                      percentRealizado: isAfterStatus ? undefined : (item.trabAcumReal / trabTotal) * 100,
                      percentProjetado: (item.trabAcum / trabTotal) * 100
                    };
                  })
                  .sort((a: any, b: any) => {
                    const [m1, y1] = a.name.split('-');
                    const [m2, y2] = b.name.split('-');
                    if (y1 !== y2) return Number(y1) - Number(y2);
                    return Number(m1) - Number(m2);
                  });

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={physicalProgressData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProjetadoProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentPrevisto"
                        name="Previsto"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorProgress)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentRealizado"
                        name="Realizado"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="rgba(16, 185, 129, 0.1)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentProjetado"
                        name="Projetado"
                        stroke="#f59e0b"
                        fillOpacity={1}
                        fill="url(#colorProjetadoProgress)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          {/* Physical Progress Table */}
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Detalhamento Físico</h3>
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 sticky left-0 bg-slate-50 dark:bg-zinc-800 z-30">Mês/Ano</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 text-center">Trab Acum (Lb)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 text-center">Trab Acum (Proj)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800 text-center">Trab Acum (Real)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {(() => {
                    const grouped = dadosCrono.reduce((acc, curr) => {
                      const mY = curr.mesAno;
                      if (!mY) return acc;
                      if (!acc[mY]) {
                        acc[mY] = { mesAno: mY, trabAcumLb: 0, trabAcum: 0, trabAcumReal: 0 };
                      }
                      acc[mY].trabAcumLb += Number(curr.trabAcumLb) || 0;
                      acc[mY].trabAcum += Number(curr.trabAcum) || 0;
                      acc[mY].trabAcumReal += Number(curr.trabAcumReal) || 0;
                      return acc;
                    }, {} as Record<string, any>);

                    const sortedGroupedData = Object.values(grouped).sort((a: any, b: any) => {
                      const [m1, y1] = a.mesAno.split('-');
                      const [m2, y2] = b.mesAno.split('-');
                      if (y1 !== y2) return Number(y1) - Number(y2);
                      return Number(m1) - Number(m2);
                    });

                    const monthsUntil26 = sortedGroupedData.filter((data: any) => {
                      const [_, y] = data.mesAno.split('-');
                      return Number(y) <= 2026;
                    });

                    const findLastUntil = (year: number) => {
                      const filtered = (sortedGroupedData as any[]).filter((d: any) => {
                        const [_, y] = d.mesAno.split('-');
                        return Number(y) <= year;
                      });
                      return (filtered[filtered.length - 1] as any) || { trabAcumLb: 0, trabAcum: 0, trabAcumReal: 0 };
                    };

                    const statusAt2030 = findLastUntil(2030);
                    const statusAt2050 = findLastUntil(2050);

                    const ranges = [
                      {
                        mesAno: '2027-30',
                        trabAcumLb: statusAt2030.trabAcumLb,
                        trabAcum: statusAt2030.trabAcum,
                        trabAcumReal: statusAt2030.trabAcumReal,
                      },
                      {
                        mesAno: '2031-50',
                        trabAcumLb: statusAt2050.trabAcumLb,
                        trabAcum: statusAt2050.trabAcum,
                        trabAcumReal: statusAt2050.trabAcumReal,
                      }
                    ];

                    const displayData = [...monthsUntil26, ...ranges];

                    return displayData.map((data: any) => (
                      <tr key={data.mesAno} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-slate-50 dark:border-zinc-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          {data.mesAno}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                          {data.trabAcumLb.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                          {data.trabAcum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                          {data.trabAcumReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
