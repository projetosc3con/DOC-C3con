import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import {
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  CreditCard,
  UserCircle,
  X,
  Camera,
  Save,
  Loader2,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Usuario, Recurso } from '../types';
import { UserFormModal } from '../components/users/UserFormModal';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.user_metadata?.roleName === 'Administrador';
  const [users, setUsers] = useState<Usuario[]>([]);
  const [dbResources, setDbResources] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    idRecurso: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('Usuarios')
        .select('*');

      if (usersError) throw usersError;

      // Fetch Recursos
      const { data: resData, error: resError } = await supabase
        .from('Recursos')
        .select('*');

      if (resError) throw resError;

      setUsers(usersData || []);
      setDbResources(resData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchMatch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = !filters.status || (filters.status === 'Ativo' ? user.ativo : !user.ativo);
    const recursoMatch = !filters.idRecurso || user.idRecurso === filters.idRecurso;

    return searchMatch && statusMatch && recursoMatch;
  });

  const clearFilters = () => {
    setFilters({
      status: '',
      idRecurso: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user: Usuario) => {
    const action = user.ativo ? 'inativar' : 'ativar';
    const message = user.ativo
      ? `Tem certeza que deseja inativar ${user.fullName}? O usuário não poderá mais acessar o sistema.`
      : `Deseja reativar o acesso de ${user.fullName}?`;

    if (window.confirm(message)) {
      try {
        const { error } = await supabase
          .from('Usuarios')
          .update({ ativo: !user.ativo })
          .eq('uuid', user.uuid);

        if (error) throw error;
        await fetchData();
      } catch (error: any) {
        alert(`Erro ao ${action}: ` + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Gestão de Usuários"
        subtitle="Controle quem tem acesso ao sistema e seus vínculos com recursos."
      />

      <div className="p-4 sm:p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-all relative",
                activeFiltersCount > 0 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300" 
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Filter size={18} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in duration-300">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {isAdmin && (
              <button
                onClick={() => handleOpenModal()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                <UserPlus size={18} />
                Novo Usuário
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Usuário</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">E-mail</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Recurso Vinculado</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Carregando usuários...</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profileUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=6366f1&color=fff`}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full border-2 border-indigo-600/10 object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{user.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{user.uuid.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {dbResources.find(r => r.id === user.idRecurso)?.nomeExibicao || 'Não vinculado'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {dbResources.find(r => r.id === user.idRecurso)?.escopo || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        user.ativo
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                          : "bg-red-50 text-red-600 dark:bg-red-900/20"
                      )}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                            title="Editar Usuário"
                          >
                            <Edit2 size={16} />
                          </button>
                          {currentUser?.id !== user.uuid && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                user.ativo
                                  ? "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              )}
                              title={user.ativo ? "Inativar Usuário" : "Ativar Usuário"}
                            >
                              {user.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingUser={editingUser} 
        dbResources={dbResources} 
        onSuccess={fetchData} 
      />

      {/* Filter Offcanvas */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="text-indigo-600" size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Filtros de Usuários</h2>
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status do Usuário</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os status</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>

                  {/* Recurso */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Recurso Vinculado</label>
                    <select 
                      value={filters.idRecurso}
                      onChange={(e) => setFilters({ ...filters, idRecurso: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os recursos</option>
                      {dbResources.map(r => (
                        <option key={r.id} value={r.id}>{r.nomeExibicao}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-3">
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <RotateCcw size={14} />
                    Limpar Filtros
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

