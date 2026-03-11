import React from 'react';
import logoImg from '../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Flag,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Plus,
  X,
  AlertCircle,
  LogOut,
  Layers,
  List
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.user_metadata?.roleName === 'Administrador';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Projetos', path: '/projects' },
    { icon: Flag, label: 'Marcos', path: '/milestones' },
    { icon: Users, label: 'Recursos', path: '/resources' },
    { icon: UserCog, label: 'Usuários', path: '/users' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: AlertCircle, label: 'Erro 404', path: '/404' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        {/* Logo clicável → vai para o dashboard */}
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-80"
        >
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-500 leading-tight">Doc</h1>
            <p className="text-[10px] font-medium text-indigo-600 tracking-tighter">Project Management</p>
          </div>
        </NavLink>

        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              isActive
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Configurações
            </p>
            <NavLink
              to="/config"
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Settings size={18} />
              <span>Geral</span>
            </NavLink>
            <NavLink
              to="/project-types"
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Layers size={18} />
              <span>Tipos de projeto</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <List size={18} />
              <span>Listas</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink
          to="/projects/new"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm mb-4"
        >
          <Plus size={16} />
          Novo Projeto
        </NavLink>

        {/* Perfil do usuário + botão de sair */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex-1 flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group min-w-0"
          >
            <img
              src={user?.user_metadata?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.fullName || user?.email?.split('@')[0] || 'U')}&background=6366f1&color=fff`}
              alt="Avatar"
              className="w-9 h-9 rounded-full border-2 border-indigo-600/20 group-hover:border-indigo-600 transition-colors shrink-0 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 transition-colors">
                {user?.user_metadata?.fullName ?? user?.email?.split('@')[0] ?? 'Usuário'}
              </p>
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                {user?.user_metadata?.roleName ?? 'Membro da Equipe'}
              </p>
            </div>
          </NavLink>

          {/* Botão de sair */}
          <button
            onClick={handleSignOut}
            title="Sair"
            className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
