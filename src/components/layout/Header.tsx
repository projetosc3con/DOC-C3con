import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const notifications = [
  {
    id: '1',
    title: 'Novo Comentário',
    description: 'Ana Silva comentou no projeto "Sistema Mobile 2.0"',
    time: 'Há 5 min',
    type: 'info',
    icon: Clock,
    unread: true
  },
  {
    id: '2',
    title: 'Prazo Próximo',
    description: 'O projeto "Rebranding Marca" vence em 3 dias.',
    time: 'Há 2 horas',
    type: 'warning',
    icon: AlertCircle,
    unread: true
  },
  {
    id: '3',
    title: 'Projeto Concluído',
    description: 'O projeto "Migração de Banco de Dados" foi finalizado.',
    time: 'Ontem',
    type: 'success',
    icon: CheckCircle2,
    unread: false
  }
];

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
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
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 w-48 lg:w-64 text-slate-900 dark:text-slate-100"
          />
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative",
              showNotifications && "bg-slate-100 dark:bg-slate-800 text-indigo-600"
            )}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-sm">Notificações</h3>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">Marcar todas como lidas</button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3",
                        notif.unread && "bg-indigo-50/30 dark:bg-indigo-900/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        notif.type === 'info' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" :
                        notif.type === 'warning' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                      )}>
                        <notif.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.description}</p>
                      </div>
                      {notif.unread && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                  <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Ver todas as notificações</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
