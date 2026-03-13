import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { 
  ArrowLeft, 
  Save, 
  Layers, 
  FileText, 
  Plus, 
  Trash2, 
  GripVertical,
  Clock,
  Layout,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface MilestoneRow {
  id: string;
  nome: string;
  duracaoPadrao: number;
  fase: string;
  ordem: number;
}

export const NewProjectTypePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id && id !== 'new');

  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { id: crypto.randomUUID(), nome: '', duracaoPadrao: 5, fase: 'Planejamento', ordem: 1 }
  ]);
  const [phases, setPhases] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch phases
        const { data: phasesData } = await supabase
          .from('Listas')
          .select('itens')
          .eq('nomeLista', 'Fases de projeto')
          .single();
          
        if (phasesData && phasesData.itens) {
          setPhases(phasesData.itens);
        } else {
          setPhases(['Iniciação', 'Planejamento', 'Execução', 'Monitoramento', 'Encerramento']);
        }
        
        // 2. Fetch project type data if editing
        if (isEditing) {
          const { data: typeData, error: typeError } = await supabase
            .from('TiposProjeto')
            .select('*')
            .eq('id', id)
            .single();
          
          if (typeError) throw typeError;
          if (typeData) {
            setTypeName(typeData.nome);
            setDescription(typeData.descricao || '');
          }

          // Fetch milestones
          const { data: milestonesData, error: milestonesError } = await supabase
            .from('MarcosPadrao')
            .select('*')
            .eq('idTipo', id)
            .order('ordem');
            
          if (milestonesData && milestonesData.length > 0) {
            setMilestones(
              milestonesData.map((m: any) => ({
                id: m.id,
                nome: m.nome,
                duracaoPadrao: m.duracaoPadrao,
                fase: m.fase || 'Planejamento',
                ordem: m.ordem
              }))
            );
          } else {
            setMilestones([]);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditing]);

  const addMilestone = () => {
    const nextOrder = milestones.length > 0 ? Math.max(...milestones.map(m => m.ordem)) + 1 : 1;
    setMilestones([...milestones, { 
      id: crypto.randomUUID(), 
      nome: '', 
      duracaoPadrao: 5, 
      fase: phases[0] || 'Planejamento', 
      ordem: nextOrder 
    }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof MilestoneRow, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName) return;

    setLoading(true);
    try {
      let currentTypeId = null;

      if (isEditing) {
        // Update TiposProjeto
        const { error: typeError } = await supabase
          .from('TiposProjeto')
          .update({ nome: typeName, descricao: description })
          .eq('id', id);
        
        if (typeError) throw typeError;
        currentTypeId = id;
        
        // Delete old MarcosPadrao to replace them
        await supabase.from('MarcosPadrao').delete().eq('idTipo', id);
      } else {
        // Insert TiposProjeto
        const { data: typeData, error: typeError } = await supabase
          .from('TiposProjeto')
          .insert([{ nome: typeName, descricao: description }])
          .select()
          .single();
          
        if (typeError) throw typeError;
        currentTypeId = typeData.id;
      }

      // 2. Create Milestones
      if (milestones.length > 0 && currentTypeId) {
        const milestonesToInsert = milestones.map(m => ({
          idTipo: currentTypeId,
          nome: m.nome,
          duracaoPadrao: m.duracaoPadrao,
          fase: m.fase,
          ordem: m.ordem
        }));

        const { error: mError } = await supabase
          .from('MarcosPadrao')
          .insert(milestonesToInsert);

        if (mError) throw mError;
      }

      navigate('/project-types');
    } catch (err) {
      console.error('Erro ao salvar tipo de projeto:', err);
      alert('Erro ao salvar os dados. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          title="Carregando..." 
          subtitle="Buscando informações do modelo..." 
        />
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title={isEditing ? "Editar Modelo de Projeto" : "Cadastro de Tipo de Projeto"} 
        subtitle={isEditing ? "Atualize as informações e os marcos padrão deste modelo." : "Defina modelos de projetos com marcos padrão para automatizar seu processo de gestão."} 
      />
      
      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Informações do Tipo</h3>
                <p className="text-xs text-slate-500">Defina o nome e uma breve descrição para este modelo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome do Tipo</label>
                <input 
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  type="text" 
                  placeholder="Ex: Desenvolvimento Web, Infraestrutura, Marketing..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição (Opcional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o propósito deste tipo de projeto..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100 transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Section 2: Standard Milestones */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Marcos Padrão</h3>
                  <p className="text-xs text-slate-500">Estes marcos serão criados automaticamente ao iniciar um projeto deste tipo.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={addMilestone}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                <Plus size={18} />
                Adicionar Marco
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-zinc-800">
                    <th className="px-3 py-3 w-10"></th>
                    <th className="px-3 py-3">Nome do Marco</th>
                    <th className="px-3 py-3 w-40">Fase</th>
                    <th className="px-3 py-3 w-32">Duração (Dias)</th>
                    <th className="px-3 py-3 w-20 text-center">Ordem</th>
                  </tr>
                </thead>
                <Reorder.Group 
                  as="tbody" 
                  values={milestones} 
                  onReorder={(newOrder) => {
                    const reordered = newOrder.map((m, index) => ({ ...m, ordem: index + 1 }));
                    setMilestones(reordered);
                  }}
                  className="divide-y divide-slate-100 dark:divide-zinc-800"
                >
                  <AnimatePresence initial={false}>
                    {milestones.map((milestone) => (
                      <Reorder.Item 
                        key={milestone.id}
                        value={milestone}
                        as="tr"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group bg-white dark:bg-zinc-900"
                      >
                        <td className="px-3 py-4">
                          <GripVertical className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing" size={18} />
                        </td>
                        <td className="px-3 py-4">
                          <input 
                            required
                            value={milestone.nome}
                            onChange={(e) => updateMilestone(milestone.id, 'nome', e.target.value)}
                            type="text" 
                            placeholder="Ex: Entregar Cronograma"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400/60"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <select 
                            value={milestone.fase}
                            onChange={(e) => updateMilestone(milestone.id, 'fase', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
                          >
                            {phases.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4">
                          <div className="relative">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                              required
                              value={milestone.duracaoPadrao}
                              onChange={(e) => updateMilestone(milestone.id, 'duracaoPadrao', parseInt(e.target.value) || 0)}
                              type="number" 
                              min="0"
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-black text-slate-500">
                            {milestone.ordem}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <button 
                            type="button"
                            onClick={() => removeMilestone(milestone.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              </table>
              
              {milestones.length === 0 && (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                    <Layout size={32} />
                  </div>
                  <p className="text-sm">Nenhum marco padrão adicionado.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-8 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "w-full sm:w-auto px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2",
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"
              )}
            >
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Tipo de Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
