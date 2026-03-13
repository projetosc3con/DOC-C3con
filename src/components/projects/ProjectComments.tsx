import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { Comentario } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCommentsProps {
    idProjeto: number;
}

export const ProjectComments = ({ idProjeto }: ProjectCommentsProps) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comentario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('Comentarios')
                .select('*')
                .eq('idProjeto', idProjeto)
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.error('Erro ao carregar comentários:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (idProjeto) {
            fetchComments();
        }
    }, [idProjeto]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedComment = newComment.trim();
        if (!trimmedComment || !user || isSending) return;

        try {
            setIsSending(true);
            const { error } = await supabase.from('Comentarios').insert([{
                comentario: trimmedComment,
                idProjeto,
                nomeUser: user.user_metadata?.fullName || user.email?.split('@')[0] || 'Usuário',
                emailUser: user.email,
                fotoUser: user.user_metadata?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'U')}&background=6366f1&color=fff`
            }]);

            if (error) throw error;
            setNewComment('');
            await fetchComments();
        } catch (err) {
            console.error('Erro ao enviar comentário:', err);
            alert('Erro ao enviar comentário.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div
            key="comments"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden"
        >
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-600" />
                    <h3 className="font-bold text-sm">Histórico do Projeto</h3>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all">
                <form onSubmit={handleSendMessage} className="space-y-3">
                    <div className="relative group">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Adicione um comentário importante sobre este projeto..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none min-h-[80px] max-h-[150px] text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Use quebras de linha (Enter) para organizar seu texto.
                        </p>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSending}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2 group"
                        >
                            {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                            Enviar
                        </button>
                    </div>
                </form>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-zinc-900/10">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="text-sm text-slate-500 font-bold animate-pulse uppercase tracking-widest">Carregando Chat...</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => {
                        const isMe = comment.emailUser === user?.email;
                        return (
                            <div
                                key={comment.id}
                                className={cn(
                                    "flex gap-3",
                                    isMe ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <img
                                    src={comment.fotoUser || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.nomeUser)}&background=6366f1&color=fff`}
                                    alt={comment.nomeUser}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm object-cover"
                                />
                                <div className={cn(
                                    "flex flex-col max-w-[85%]",
                                    isMe ? "items-end text-right" : "items-start text-left"
                                )}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        {!isMe && (
                                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                                                {comment.nomeUser}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-slate-400 font-semibold tracking-tighter">
                                            {format(new Date(comment.createdAt), "dd MMM HH:mm", { locale: ptBR })}
                                        </span>
                                        {isMe && (
                                            <span className="text-[11px] font-bold text-indigo-600">
                                                Você
                                            </span>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words",
                                        isMe
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-slate-700 dark:text-slate-300 rounded-tl-none"
                                    )}>
                                        {comment.comentario}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 animate-bounce">
                            <MessageSquare size={32} />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Inicie a conversa</h4>
                        <p className="text-sm text-slate-500 max-w-[200px]">Nenhuma conversa cadastrada ainda para este projeto.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
