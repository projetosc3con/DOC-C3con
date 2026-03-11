import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Calendar, MoreVertical, AlertCircle, CheckCircle2, Info, ChevronRight, Loader2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Projeto {
  id: number;
  tipoContratacao: string | null;
  descricao: string;
  tipo: string;
  fase: string;
  classificacao: string;
  prioridade: string;
  responsavel1: string;
  fotoRes1: string;
  status: boolean;
  justificativaInclusao: string;
  createdAt: string;
}

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [phasesList, setPhasesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const colors = [
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
  ];

  const dotColors = [
    "bg-indigo-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-slate-500"
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Lista for phases index
      const { data: listData } = await supabase
        .from('Listas')
        .select('itens')
        .eq('nomeLista', 'Fases de projeto')
        .single();

      if (listData) setPhasesList(listData.itens || []);

      // Fetch Projects
      const { data: projectsData, error } = await supabase
        .from('Projetos')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPhaseStyles = (fase: string) => {
    const index = phasesList.indexOf(fase);
    const safeIndex = index === -1 ? 6 : index % colors.length;
    return {
      wrapper: colors[safeIndex],
      dot: dotColors[safeIndex]
    };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Projetos" subtitle="Gerencie e monitore o desempenho de seus projetos PMBOK." />

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block px-1">Fase</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-indigo-600 text-slate-900 dark:text-slate-100">
              <option>Todas as Fases</option>
              {phasesList.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block px-1">Contratação</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-indigo-600 text-slate-900 dark:text-slate-100">
              <option>Todos os tipos</option>
              <option>CLT</option>
              <option>PJ</option>
              <option>Terceirizado</option>
            </select>
          </div>
          <div className="flex items-end w-full sm:w-auto gap-2">
            <button className="h-[38px] px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm transition-all whitespace-nowrap hover:bg-slate-200">
              Limpar
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Projeto</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Classificação</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Criado em</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Fase Atual</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                      <p className="text-sm text-slate-500 mt-4">Carregando carteira de projetos...</p>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      Nenhum projeto cadastrado.
                    </td>
                  </tr>
                ) : projects.map((project) => {
                  const styles = getPhaseStyles(project.fase);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {project.id}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-100 group-hover:text-indigo-600 transition-colors tracking-tight">{project.descricao}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{project.tipo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{project.classificacao}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar size={16} className="text-slate-400" />
                          {format(new Date(project.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-full min-w-[120px] justify-center",
                            styles.wrapper
                          )}>
                            <span className={cn("w-2 h-2 rounded-full", styles.dot)}></span>
                            <span className="text-[10px] font-black uppercase tracking-wider">{project.fase}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

