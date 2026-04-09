import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, GitBranch, MessageSquare, Flag, CheckCircle2, History } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Log } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
}

export const ProjectTimelineModal = ({ isOpen, onClose, projectId }: ProjectTimelineModalProps) => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('Logs')
                .select('*')
                .eq('projetoId', projectId)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            if (data) {
                // Agrupar logs para remover duplicidade (mesmo log para múltiplos usuários)
                const uniqueLogs = data.reduce((acc: Log[], current) => {
                    const isDuplicate = acc.find(item =>
                        item.titulo === current.titulo &&
                        item.descricao === current.descricao &&
                        item.timestamp === current.timestamp
                    );
                    if (!isDuplicate) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                setLogs(uniqueLogs);
            }
        } catch (err) {
            console.error('Erro ao carregar logs do projeto:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && projectId) {
            fetchLogs();
        }
    }, [isOpen, projectId]);

    const getIcon = (table: string, title: string) => {
        if (table === 'Comentarios') return <MessageSquare size={14} />;
        if (table === 'FluxosProjeto') return <GitBranch size={14} />;
        if (table === 'MarcosProjeto') return <Flag size={14} />;
        if (title.includes('Concluído') || title.includes('Aprovado')) return <CheckCircle2 size={14} />;
        return <Clock size={14} />;
    };

    const getIconColor = (table: string, title: string) => {
        if (table === 'Comentarios') return 'bg-blue-500';
        if (table === 'FluxosProjeto') return 'bg-indigo-500';
        if (table === 'MarcosProjeto') return 'bg-amber-500';
        if (title.includes('Concluído') || title.includes('Aprovado')) return 'bg-emerald-500';
        return 'bg-slate-500';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">Linha do Tempo</h2>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-widest">Histórico de atividades do projeto</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Clock className="animate-spin text-indigo-600" size={32} />
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Carregando timeline...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <History size={48} className="opacity-10 mb-2" />
                                    <p className="text-sm font-bold tracking-tight">Nenhuma atividade registrada ainda.</p>
                                </div>
                            ) : (
                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent dark:before:from-zinc-800 dark:before:via-zinc-800">
                                    {logs.map((log, index) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative flex items-start gap-6 group"
                                        >
                                            {/* dot */}
                                            <div className={cn(
                                                "absolute left-5 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full border-4 border-white dark:border-zinc-900 ring-1 ring-slate-200 dark:ring-zinc-800 group-hover:ring-indigo-500 transition-all",
                                                getIconColor(log.tabelaOrigem, log.titulo)
                                            )} />

                                            {/* content */}
                                            <div className="flex-1 ml-10">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "p-1 rounded text-white",
                                                            getIconColor(log.tabelaOrigem, log.titulo)
                                                        )}>
                                                            {getIcon(log.tabelaOrigem, log.titulo)}
                                                        </span>
                                                        <h4 className="text-xs font-black tracking-wider text-slate-900 dark:text-slate-100">
                                                            {log.titulo}
                                                        </h4>
                                                    </div>
                                                    <time className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                                                        {format(new Date(log.timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                    </time>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 p-3 rounded-2xl group-hover:border-slate-200 dark:group-hover:border-zinc-700 transition-all shadow-sm">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {log.descricao}
                                                    </p>
                                                    {log.tabelaOrigem && (
                                                        <div className="mt-2 flex items-center">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400/80 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-100 dark:border-zinc-700">
                                                                {log.tabelaOrigem}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50/50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Total de {logs.length} registros no histórico
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
