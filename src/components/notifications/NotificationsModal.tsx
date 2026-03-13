import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Bell,
    CheckSquare,
    Square,
    MailOpen,
    Mail,
    Trash2,
    MessageSquare,
    GitBranch,
    Flag,
    Clock,
    CheckCircle2,
    Filter,
    Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Log } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const NotificationsModal = ({ isOpen, onClose, onUpdate }: NotificationsModalProps) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllNotifications = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            let query = supabase
                .from('Logs')
                .select('*')
                .eq('notificar', user.id)
                .order('timestamp', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error('Erro ao carregar todas as notificações:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllNotifications();
            setSelectedIds(new Set());
        }
    }, [isOpen]);

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredNotifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
        }
    };

    const handleBulkMarkRead = async (markAsRead: boolean) => {
        if (selectedIds.size === 0) return;
        try {
            const { error } = await supabase
                .from('Logs')
                .update({ lido: markAsRead })
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            setNotifications(prev => prev.map(n =>
                selectedIds.has(n.id) ? { ...n, lido: markAsRead } : n
            ));
            setSelectedIds(new Set());
            onUpdate();
        } catch (err) {
            console.error('Erro na operação em lote:', err);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Deseja excluir as ${selectedIds.size} notificações selecionadas?`)) return;

        try {
            const { error } = await supabase
                .from('Logs')
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
            setSelectedIds(new Set());
            onUpdate();
        } catch (err) {
            console.error('Erro ao excluir notificações:', err);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'all' || !n.lido;
        const matchesSearch = n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.descricao.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getIcon = (table: string, title: string) => {
        if (table === 'Comentarios') return <MessageSquare size={18} />;
        if (table === 'FluxosProjeto') return <GitBranch size={18} />;
        if (table === 'MarcosProjeto') return <Flag size={18} />;
        if (title.includes('Concluído') || title.includes('Aprovado')) return <CheckCircle2 size={18} />;
        return <Clock size={18} />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">Central de Alertas</h2>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-widest">Gerencie todo o seu histórico de notificações</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar alertas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                    />
                                </div>
                                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            filter === 'all' ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-slate-500"
                                        )}
                                    >
                                        Todas
                                    </button>
                                    <button
                                        onClick={() => setFilter('unread')}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            filter === 'unread' ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-slate-500"
                                        )}
                                    >
                                        Nao Lidas
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedIds.size > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-zinc-700 mr-2"
                                    >
                                        <button onClick={() => handleBulkMarkRead(true)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Marcar como lidas"><MailOpen size={18} /></button>
                                        <button onClick={() => handleBulkMarkRead(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all" title="Marcar como não lidas"><Mail size={18} /></button>
                                        <button onClick={handleBulkDelete} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir selecionadas"><Trash2 size={18} /></button>
                                        <span className="text-[10px] font-black text-slate-400 uppercase ml-2">{selectedIds.size} selecionadas</span>
                                    </motion.div>
                                ) : null}
                                <button onClick={handleSelectAll} className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                    {selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                                    Selecionar Tudo
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Clock className="animate-spin text-indigo-600" size={32} />
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Carregando histórico...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <Bell size={48} className="opacity-10 mb-2" />
                                    <p className="text-sm font-bold">Nenhum alerta encontrado.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleToggleSelect(notif.id)}
                                            className={cn(
                                                "group relative p-4 rounded-2xl border transition-all cursor-pointer flex gap-4",
                                                selectedIds.has(notif.id)
                                                    ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800 shadow-sm"
                                                    : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600",
                                                !notif.lido && !selectedIds.has(notif.id) && "bg-slate-50/50 dark:bg-zinc-800/30"
                                            )}
                                        >
                                            <div className="flex items-center shrink-0">
                                                {selectedIds.has(notif.id) ? (
                                                    <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center text-white"><CheckSquare size={14} /></div>
                                                ) : (
                                                    <div className="w-5 h-5 border-2 border-slate-200 dark:border-zinc-700 rounded-md group-hover:border-indigo-400 transition-colors" />
                                                )}
                                            </div>

                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                                                !notif.lido
                                                    ? "bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800"
                                                    : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700"
                                            )}>
                                                {getIcon(notif.tabelaOrigem, notif.titulo)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={cn("text-xs font-black uppercase tracking-wider", !notif.lido ? "text-slate-900 dark:text-slate-50" : "text-slate-500")}>{notif.titulo}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-zinc-700">
                                                        {format(new Date(notif.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                    </span>
                                                </div>
                                                <p className={cn("text-sm leading-relaxed", !notif.lido ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400")}>{notif.descricao}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                                                        {notif.tabelaOrigem}
                                                    </span>
                                                    {!notif.lido && (
                                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_5px_rgba(79,70,229,0.5)]"></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 flex justify-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} /> Exibindo {filteredNotifications.length} alertas PMBOK
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
