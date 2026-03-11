import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface ProjectType {
  id: string;
  nome: string;
  descricao: string;
  createdAt: string;
  milestonesCount?: number;
}

export const ProjectTypesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTypes = async () => {
    setLoading(true);
    try {
      // Fetch types and also count their milestones
      const { data, error } = await supabase
        .from('TiposProjeto')
        .select(`
          *,
          milestones:MarcosPadrao(count)
        `)
        .order('nome');

      if (error) throw error;

      if (data) {
        setTypes(data.map((t: any) => ({
          ...t,
          milestonesCount: t.milestones?.[0]?.count || 0
        })));
      }
    } catch (err) {
      console.error('Erro ao buscar tipos de projeto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o modelo "${name}"? Isso removerá também seus marcos padrão.`)) return;

    try {
      // 1. Verificar se existem projetos atrelados
      const { count, error: countError } = await supabase
        .from('Projetos')
        .select('*', { count: 'exact', head: true })
        .eq('idTipo', id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        alert('Ação bloqueada: Existem projetos vinculados a este modelo. Exclua os projetos ou altere o tipo deles antes de excluir.');
        return;
      }

      // First delete milestones
      await supabase.from('MarcosPadrao').delete().eq('idTipo', id);
      // Then delete type
      const { error } = await supabase.from('TiposProjeto').delete().eq('id', id);

      if (error) throw error;
      setTypes(types.filter(t => t.id !== id));
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir registro.');
    }
  };

  const filteredTypes = types.filter(t => 
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Tipos de Projeto" 
        subtitle="Gerencie os modelos de projeto e seus marcos padrão configurados." 
      />
      
      <div className="p-4 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar modelos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <NavLink
            to="/project-types/new"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            Novo Modelo
          </NavLink>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Carregando modelos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-600/50 transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                      <Layers size={24} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" onClick={() => handleDelete(type.id, type.nome)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                      {type.nome}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {type.descricao || 'Sem descrição cadastrada para este modelo.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded">
                        {type.milestonesCount} {type.milestonesCount === 1 ? 'Marco' : 'Marcos'}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/project-types/${type.id}`)}
                      className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
                    >
                      Editar Detalhes
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTypes.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <AlertCircle size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-900 dark:text-slate-50 font-bold">Nenhum modelo encontrado</p>
                  <p className="text-sm text-slate-500">Tente ajustar sua busca ou crie um novo tipo de projeto.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
