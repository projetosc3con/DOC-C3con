import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, CheckCircle2, AlertCircle, Clock, X, MessageSquare, GitBranch, Flag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Log } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificationsModal } from '../notifications/NotificationsModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
}


export const Header = ({ title, subtitle }: HeaderProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullNotifications, setShowFullNotifications] = useState(false);
  const [dbNotifications, setDbNotifications] = useState<Log[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = dbNotifications.filter(n => !n.lido).length;

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('Logs')
        .select('*')
        .eq('notificar', user.id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDbNotifications(data || []);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    if (user?.id) {
      const channel = supabase
        .channel('logs-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'Logs',
          filter: `notificar=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('Logs')
        .update({ lido: true })
        .eq('id', id);

      if (error) throw error;
      setDbNotifications(prev => prev.map(n => n.id === id ? { ...n, lido: true } : n));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('Logs')
        .update({ lido: true })
        .eq('notificar', user.id)
        .eq('lido', false);

      if (error) throw error;
      setDbNotifications(prev => prev.map(n => ({ ...n, lido: true })));
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  const getIcon = (table: string, title: string) => {
    if (table === 'Comentarios') return <MessageSquare size={18} />;
    if (table === 'FluxosProjeto') return <GitBranch size={18} />;
    if (table === 'MarcosProjeto') return <Flag size={18} />;
    if (title.includes('Concluído') || title.includes('Aprovado')) return <CheckCircle2 size={18} />;
    return <Clock size={18} />;
  };

  const handleNotificationClick = async (notif: Log) => {
    // 1. Mark as read if needed
    if (!notif.lido) {
      await markAsRead(notif.id);
    }

    // 2. Redirect if projetoId exists
    if (notif.projetoId) {
      let tab = 'info';
      if (notif.tabelaOrigem === 'Comentarios') tab = 'comments';
      if (notif.tabelaOrigem === 'FluxosProjeto') tab = 'flows';
      if (notif.tabelaOrigem === 'MarcosProjeto') tab = 'milestones';

      navigate(`/projects/${notif.projetoId}?tab=${tab}`);
      setShowNotifications(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-zinc-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 w-48 lg:w-64 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors relative",
                showNotifications && "bg-slate-100 dark:bg-zinc-800 text-indigo-600"
              )}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 px-1 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 font-black animate-in zoom-in duration-300">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden z-100"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                      <Bell size={14} className="text-indigo-600" /> Notificações
                    </h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] font-black text-indigo-600 hover:underline tracking-widest">Marcar tudo como lido</button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {dbNotifications.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                          <Bell size={24} />
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nenhuma notificação</p>
                      </div>
                    ) : (
                      dbNotifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn(
                            "p-4 border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex gap-3",
                            !notif.lido && "bg-indigo-50/30 dark:bg-indigo-900/10"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                            !notif.lido
                              ? "bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800"
                              : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700"
                          )}>
                            {getIcon(notif.tabelaOrigem, notif.titulo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={cn("text-xs tracking-wider", !notif.lido ? "font-black text-slate-900 dark:text-slate-50" : "font-bold text-slate-500")}>{notif.titulo}</h4>
                              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <p className={cn("text-[11px] leading-relaxed", !notif.lido ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400")}>{notif.descricao}</p>
                          </div>
                          {!notif.lido && (
                            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => { setShowNotifications(false); setShowFullNotifications(true); }}
                    className="w-full p-3 text-center border-t border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-800/20 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all group"
                  >
                    <p className="text-[9px] font-black text-slate-400 group-hover:text-indigo-600 tracking-[0.2em] uppercase transition-colors">Central de notificações</p>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <NotificationsModal
        isOpen={showFullNotifications}
        onClose={() => setShowFullNotifications(false)}
        onUpdate={fetchNotifications}
      />
    </>
  );
};
