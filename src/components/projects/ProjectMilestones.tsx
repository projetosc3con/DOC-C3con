import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { BarChart3, Calendar } from 'lucide-react';

interface Milestone {
    id: string | number;
    name: string;
    progress: number;
    baselineDate: string;
    scheduledDate: string;
    active: boolean;
}

interface ProjectMilestonesProps {
    milestones: Milestone[];
}

export const ProjectMilestones = ({ milestones }: ProjectMilestonesProps) => {
    // Simple helper to position bars for the Gantt chart demo
    const getGanttPosition = (index: number) => {
        const starts = [5, 15, 30, 45, 65];
        const widths = [10, 15, 20, 25, 15];
        return {
            left: `${starts[index % starts.length]}%`,
            width: `${widths[index % widths.length]}%`
        };
    };

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Nome da Tarefa</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Progresso</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Linha de Base</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Programada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {milestones?.map((m) => (
                                <tr key={m.id} className={cn(
                                    "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                                    !m.active && "opacity-40 grayscale"
                                )}>
                                    <td className="px-6 py-4">
                                        <span className={cn("text-sm font-bold", !m.active && "line-through")}>{m.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all",
                                                        m.progress === 100 ? "bg-emerald-500" : "bg-indigo-600"
                                                    )}
                                                    style={{ width: `${m.progress}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold",
                                                m.progress === 100 ? "text-emerald-600" : "text-slate-500"
                                            )}>{m.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{m.baselineDate}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{m.scheduledDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gantt Chart Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <BarChart3 size={16} className="text-indigo-600" />
                        Cronograma (Gantt)
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Execução</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Planejado</span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Timeline Header */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 ml-32">
                        {months.map((month) => (
                            <div key={month} className="flex-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter border-l border-slate-50 dark:border-slate-800/50">
                                {month}
                            </div>
                        ))}
                    </div>

                    {/* Gantt Rows */}
                    <div className="space-y-4">
                        {milestones?.map((m, idx) => {
                            const pos = getGanttPosition(idx);
                            return (
                                <div key={m.id} className="flex items-center group">
                                    <div className="w-32 pr-4 shrink-0">
                                        <p className={cn(
                                            "text-[10px] font-bold truncate transition-colors",
                                            m.active ? "text-slate-700 dark:text-slate-300 group-hover:text-indigo-600" : "text-slate-400 italic"
                                        )}>
                                            {m.name}
                                        </p>
                                    </div>
                                    <div className="flex-1 h-6 relative bg-slate-50/50 dark:bg-slate-800/20 rounded-md overflow-hidden">
                                        {/* Background Grid Lines */}
                                        <div className="absolute inset-0 flex">
                                            {months.map((_, i) => (
                                                <div key={i} className="flex-1 border-l border-slate-100/50 dark:border-slate-800/30 first:border-l-0" />
                                            ))}
                                        </div>
                                        {/* Task Bar */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: pos.width }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                            className={cn(
                                                "absolute top-1.5 h-3 rounded-full shadow-sm relative z-10",
                                                m.progress === 100 ? "bg-emerald-500/80" : "bg-indigo-600/80",
                                                !m.active && "bg-slate-300 dark:bg-slate-700 opacity-50"
                                            )}
                                            style={{ left: pos.left }}
                                        >
                                            {m.progress > 0 && m.progress < 100 && (
                                                <div className="absolute top-0 left-0 h-full bg-white/30 rounded-full" style={{ width: `${m.progress}%` }} />
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
