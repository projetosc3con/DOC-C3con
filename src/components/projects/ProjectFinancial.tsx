import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface FinancialData {
    month: string;
    planned: number;
    projected: number;
}

interface ProjectFinancialProps {
    financials: FinancialData[];
}

export const ProjectFinancial = ({ financials }: ProjectFinancialProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">Avanço Financeiro</h3>
                        <TrendingUp size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-indigo-600">72%</span>
                        <span className="text-xs text-slate-400 font-bold">do orçamento utilizado</span>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 w-[72%]" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">Desvio de Realização</h3>
                        <TrendingUp size={18} className="text-red-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-red-600">
                            +12.4%
                        </span>
                        <span className="text-xs text-slate-400 font-bold">em relação ao planejado</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-6">Fluxo de Caixa (Previsto vs Realizado)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financials}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="planned" name="Previsto" stroke="#6366f1" strokeWidth={3} fillOpacity={0.1} fill="#6366f1" />
                            <Area type="monotone" dataKey="projected" name="Realizado" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};
