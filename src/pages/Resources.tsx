import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UserPlus, Search, Edit2, Info, Loader2, Trash2, CheckCircle2, AlertCircle, X, Save, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Recurso } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const ResourcesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.roleName === 'Administrador';

  const [resources, setResources] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nomeExibicao: '',
    escopo: ''
  });

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Recursos')
        .select('*')
        .order('nomeExibicao', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('Recursos')
          .update({
            nomeExibicao: formData.nomeExibicao,
            escopo: formData.escopo
          })
          .eq('id', editingId);

        if (error) throw error;
        setStatusMessage({ type: 'success', text: 'Recurso atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('Recursos')
          .insert([{
            nomeExibicao: formData.nomeExibicao,
            escopo: formData.escopo
          }]);

        if (error) throw error;
        setStatusMessage({ type: 'success', text: 'Novo recurso criado com sucesso!' });
      }

      setFormData({ nomeExibicao: '', escopo: '' });
      setEditingId(null);
      await fetchResources();

      // Auto close success message
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar recurso:', error);
      setStatusMessage({
        type: 'error',
        text: error.message.includes('row-level security')
          ? 'Você não tem permissão para realizar esta operação.'
          : 'Erro ao salvar recurso: ' + error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (resource: Recurso) => {
    setEditingId(resource.id);
    setFormData({
      nomeExibicao: resource.nomeExibicao,
      escopo: resource.escopo
    });
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('Recursos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConfirmDelete(null);
      setStatusMessage({ type: 'success', text: 'Recurso removido com sucesso!' });
      await fetchResources();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      setStatusMessage({
        type: 'error',
        text: 'Erro ao excluir: ' + error.message
      });
    }
  };

  const filteredResources = resources.filter(r =>
    r.nomeExibicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.escopo?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Recursos" subtitle="Gerencie perfis de acesso e recursos conforme a estrutura da organização." />

      <div className="p-4 sm:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <section className="xl:col-span-1">
          {isAdmin ? (
            <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm sticky top-24">
              <h3 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-50">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <UserPlus size={18} />
                </div>
                {editingId ? 'Editar Recurso' : 'Novo Recurso'}
              </h3>

              <AnimatePresence mode="wait">
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "p-3 rounded-lg flex items-start gap-3 border mb-6 text-xs font-bold tracking-widest",
                      statusMessage.type === 'success'
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-900/20 dark:text-emerald-400"
                        : "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400"
                    )}
                  >
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle size={16} className="shrink-0 text-red-600" />
                    )}
                    <p className="flex-1">{statusMessage.text}</p>
                    <button onClick={() => setStatusMessage(null)}>
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Nome do Recurso</label>
                  <input
                    required
                    type="text"
                    value={formData.nomeExibicao}
                    onChange={(e) => setFormData({ ...formData, nomeExibicao: e.target.value })}
                    className="w-full rounded-lg border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-600 outline-none p-2.5 text-slate-900 dark:text-slate-100 transition-all font-medium"
                    placeholder="Ex: Administrador, Gestor de Obras..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Escopo</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.escopo}
                    onChange={(e) => setFormData({ ...formData, escopo: e.target.value })}
                    className="w-full rounded-lg border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-600 outline-none p-2.5 text-slate-900 dark:text-slate-100 resize-none transition-all font-medium"
                    placeholder="Descreva as responsabilidades ou o escopo deste recurso..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ nomeExibicao: '', escopo: '' });
                        setStatusMessage(null);
                      }}
                      className="flex-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    disabled={isSaving}
                    className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingId ? 'Salvar Alterações' : 'Criar Recurso'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm sticky top-24 flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <Lock size={24} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Acesso Restrito</p>
                <p className="text-xs text-slate-400 leading-relaxed">Apenas administradores podem criar ou editar recursos.</p>
              </div>
            </div>
          )}

          <div className="mt-6 bg-indigo-600/5 border border-indigo-600/20 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-indigo-600 mb-2 flex items-center gap-2">
              <Info size={18} />
              Dica PMBOK
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              O gerenciamento de recursos inclui os processos para identificar, adquirir e gerenciar os recursos necessários para o sucesso do projeto.
            </p>
          </div>
        </section>

        <section className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">Recursos Cadastrados</h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100 transition-all"
                  placeholder="Filtrar por nome ou escopo..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Nome do Recurso</th>
                    <th className="px-6 py-4">Escopo / Descrição</th>
                    <th className="px-6 py-4 text-center">Usuários</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 tracking-tight">Carregando inventário...</p>
                      </td>
                    </tr>
                  ) : filteredResources.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        Nenhum recurso encontrado.
                      </td>
                    </tr>
                  ) : filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{resource.nomeExibicao}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-md">{resource.escopo}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-black">
                          {resource.contagemUsers}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        {isAdmin && (
                          <AnimatePresence mode="wait">
                            {confirmDelete === resource.id ? (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-end gap-2"
                              >
                                <span className="text-[10px] font-black uppercase text-red-600 mr-2">Tem certeza?</span>
                                <button
                                  onClick={() => handleDelete(resource.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                  Não
                                </button>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <button
                                  onClick={() => handleEdit(resource)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(resource.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
