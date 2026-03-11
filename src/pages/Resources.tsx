import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UserPlus, Search, Edit2, Info, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Recurso } from '../types';

export const ResourcesPage = () => {
  const [resources, setResources] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setIsSaving(true);
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
      } else {
        const { error } = await supabase
          .from('Recursos')
          .insert([{
            nomeExibicao: formData.nomeExibicao,
            escopo: formData.escopo
          }]);

        if (error) throw error;
      }

      setFormData({ nomeExibicao: '', escopo: '' });
      setEditingId(null);
      await fetchResources();
    } catch (error: any) {
      alert('Erro ao salvar recurso: ' + error.message);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este recurso? Isso pode afetar usuários vinculados.')) {
      try {
        const { error } = await supabase
          .from('Recursos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchResources();
      } catch (error: any) {
        alert('Erro ao excluir: ' + error.message);
      }
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
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <h3 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-50">
              <UserPlus className="text-indigo-600" size={20} />
              {editingId ? 'Editar Recurso' : 'Novo Recurso'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wider mb-1.5 dark:text-slate-300">Nome do Recurso</label>
                <input
                  required
                  type="text"
                  value={formData.nomeExibicao}
                  onChange={(e) => setFormData({ ...formData, nomeExibicao: e.target.value })}
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-600 outline-none p-2.5 text-slate-900 dark:text-slate-100"
                  placeholder="Ex: Administrador, Gestor de Obras..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wider mb-1.5 dark:text-slate-300">Escopo</label>
                <textarea
                  required
                  rows={4}
                  value={formData.escopo}
                  onChange={(e) => setFormData({ ...formData, escopo: e.target.value })}
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-600 outline-none p-2.5 text-slate-900 dark:text-slate-100 resize-none"
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
                    }}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  disabled={isSaving}
                  className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingId ? 'Salvar Alterações' : 'Criar Recurso'}
                </button>
              </div>
            </form>
          </div>

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
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">Recursos Cadastrados</h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100 transition-all"
                  placeholder="Filtrar por nome ou escopo..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Nome do Recurso</th>
                    <th className="px-6 py-4">Escopo / Descrição</th>
                    <th className="px-6 py-4 text-center">Usuários</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                    <tr key={resource.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(resource)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

const Save = ({ size, className }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
