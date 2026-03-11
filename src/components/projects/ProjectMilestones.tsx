import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import {
    BarChart3, Calendar, CheckCircle2, Clock, AlertCircle,
    ChevronRight, Loader2, Save, X, Edit2, PlayCircle, MinusCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Milestone {
    id: string;
    idProjeto: number;
    nome: string;
    fase: string | null;
    dataPrevista: string;
    dataReal: string | null;
    status: string;
    ordem: number;
}

interface ProjectMilestonesProps {
    projectId: number;
    responsavelId: string | null;
}

export const ProjectMilestones = ({ projectId, responsavelId }: ProjectMilestonesProps) => {
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ dataReal: string; status: string }>({ dataReal: '', status: '' });
    const [isSaving, setIsSaving] = useState(false);

    const isAdmin = user?.user_metadata?.roleName === 'Administrador';
    const isManager = user?.id === responsavelId;
    const canEdit = isAdmin || isManager;

    const fetchMilestones = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('MarcosProjeto')
                .select('*')
                .eq('idProjeto', projectId)
                .order('ordem', { ascending: true });

            if (error) throw error;
            setMilestones(data || []);
        } catch (err) {
            console.error('Erro ao buscar marcos:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMilestones();
    }, [projectId]);

    const handleStartEdit = (m: Milestone) => {
        if (!canEdit) return;
        setEditingId(m.id);
        setEditForm({
            dataReal: m.dataReal || m.dataPrevista,
            status: m.status
        });
    };

    const handleSaveEdit = async (id: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('MarcosProjeto')
                .update({
                    dataReal: editForm.dataReal,
                    status: editForm.status
                })
                .eq('id', id);

            if (error) throw error;

            setMilestones(prev => prev.map(m =>
                m.id === id ? { ...m, dataReal: editForm.dataReal, status: editForm.status } : m
            ));
            setEditingId(null);
        } catch (err) {
            console.error('Erro ao salvar marco:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Concluído':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    dot: 'bg-emerald-500',
                    icon: CheckCircle2
                };
            case 'Atrasado':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    text: 'text-red-600 dark:text-red-400',
                    dot: 'bg-red-500',
                    icon: AlertCircle
                };
            case 'Programado':
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    text: 'text-blue-600 dark:text-blue-400',
                    dot: 'bg-blue-500',
                    icon: PlayCircle
                };
            case 'Não aplicável':
                return {
                    bg: 'bg-slate-50 dark:bg-slate-900/40',
                    text: 'text-slate-400 dark:text-slate-500',
                    dot: 'bg-slate-400',
                    icon: MinusCircle
                };
            default: // Pendente
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    text: 'text-amber-600 dark:text-amber-400',
                    dot: 'bg-amber-500',
                    icon: Clock
                };
        }
    };

    // Helper to parse date string (YYYY-MM-DD) as a local Date object
    const parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // Gantt Logic
    const timelineDates = milestones.flatMap(m => [
        parseLocalDate(m.dataPrevista).getTime(),
        m.dataReal ? parseLocalDate(m.dataReal).getTime() : parseLocalDate(m.dataPrevista).getTime()
    ]);

    const minTime = timelineDates.length > 0 ? Math.min(...timelineDates) : Date.now();
    const maxTime = timelineDates.length > 0 ? Math.max(...timelineDates) : Date.now();

    // Add 10% padding to range
    const range = maxTime - minTime || 86400000; // default to 1 day if range is 0
    const startOffset = minTime - range * 0.05;
    const endOffset = maxTime + range * 0.15;
    const totalDuration = endOffset - startOffset;

    // Helper to format date for display, avoiding UTC shift for "YYYY-MM-DD" strings
    const formatDate = (date: string | Date | null) => {
        if (!date) return '---';
        if (date instanceof Date) return date.toLocaleDateString('pt-BR');

        // Split and parse manually to treat as local date
        const [year, month, day] = date.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    };

    const getXPosition = (dateStr: string) => {
        const time = parseLocalDate(dateStr).getTime();
        return ((time - startOffset) / totalDuration) * 100;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando cronograma...</p>
            </div>
        );
    }

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
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do Marco</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Data Prevista</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Data Real / Proj.</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {milestones.map((m) => {
                                const st = getStatusStyles(m.status);
                                const isEditing = editingId === m.id;

                                return (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{m.nome}</span>
                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{m.fase || 'Sem fase'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-500">{formatDate(m.dataPrevista)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editForm.dataReal}
                                                    onChange={(e) => setEditForm({ ...editForm, dataReal: e.target.value })}
                                                    className="text-sm font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-600"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className={cn(
                                                        "text-sm font-bold",
                                                        m.status === 'Concluído' ? "text-emerald-600" : "text-slate-700 dark:text-slate-200"
                                                    )}>
                                                        {formatDate(m.dataReal || m.dataPrevista)}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                    className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-600"
                                                >
                                                    {["Pendente", "Atrasado", "Programado", "Concluído", "Não aplicável"].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest",
                                                    st.bg, st.text
                                                )}>
                                                    <st.icon size={10} />
                                                    {m.status}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {canEdit && (
                                                <div className="flex items-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveEdit(m.id)}
                                                                disabled={isSaving}
                                                                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                                            >
                                                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                disabled={isSaving}
                                                                className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStartEdit(m)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gantt Chart Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <BarChart3 size={16} className="text-indigo-600" />
                        Acompanhamento Temporal
                    </h3>
                </div>

                <div className="relative pt-12 pl-36 pr-4 min-h-[300px]">
                    {/* Vertical Grid Lines and Dates */}
                    <div className="absolute inset-0 ml-36 pointer-events-none z-20">
                        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                            <div
                                key={p}
                                className="absolute h-full border-l border-slate-100 dark:border-slate-800/50"
                                style={{ left: `${p * 100}%` }}
                            >
                                <span className="absolute -top-10 -translate-x-1/2 text-[9px] font-black text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-1 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-800">
                                    {formatDate(new Date(startOffset + totalDuration * p))}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-10 relative z-10">
                        {milestones.map((m) => {
                            const prevX = Math.max(0, getXPosition(m.dataPrevista));
                            const realX = m.dataReal ? Math.max(0, getXPosition(m.dataReal)) : prevX;
                            const hasReal = !!m.dataReal;
                            const st = getStatusStyles(m.status);

                            return (
                                <div key={m.id} className="flex items-center group relative min-h-[2rem]">
                                    {/* Task Name Label - Multi-line support */}
                                    <div className="absolute left-0 w-32 -translate-x-32 pr-4 text-right flex items-center justify-end h-full">
                                        <p className="text-[13px] font-semibold text-slate-400 tracking-tighter group-hover:text-indigo-600 transition-colors leading-[1.1] max-w-full">
                                            {m.nome}
                                        </p>
                                    </div>

                                    <div className="flex-1 h-2 relative flex items-center">
                                        {/* Background Track */}
                                        <div className="absolute left-0 right-0 h-1 bg-slate-50 dark:bg-slate-800/40 rounded-full pointer-events-none" />

                                        {/* Baseline Marker (Planned Point) */}
                                        <div
                                            className="absolute w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full -translate-x-1/2 z-0 border border-white dark:border-slate-900"
                                            style={{ left: `${prevX}%` }}
                                            title={`Previsto: ${formatDate(m.dataPrevista)}`}
                                        />

                                        {/* Delta/Progress Bar - Only if dataReal exists */}
                                        {hasReal && (
                                            <motion.div
                                                initial={{ width: 0, left: `${prevX}%` }}
                                                animate={{
                                                    width: `${Math.abs(realX - prevX)}%`,
                                                    left: `${Math.min(prevX, realX)}%`
                                                }}
                                                transition={{ duration: 1, ease: "circOut" }}
                                                className={cn(
                                                    "absolute h-2.5 rounded-full shadow-sm z-10",
                                                    m.status === 'Concluído' ? "bg-emerald-500" :
                                                        m.status === 'Atrasado' ? "bg-red-500" :
                                                            "bg-indigo-600"
                                                )}
                                            />
                                        )}

                                        {/* Current Status Icon */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className={cn(
                                                "absolute -translate-x-1/2 z-30 flex items-center justify-center",
                                                "w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-lg",
                                                st.bg, st.text
                                            )}
                                            style={{ left: `${realX}%` }}
                                            title={`${m.status}: ${formatDate(m.dataReal || m.dataPrevista)}`}
                                        >
                                            <st.icon size={11} strokeWidth={3} />
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
