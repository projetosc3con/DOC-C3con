import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { projects } from '../constants';
import { ProjectInfo } from '../components/projects/ProjectInfo';
import { ProjectMilestones } from '../components/projects/ProjectMilestones';
import { ProjectFinancial } from '../components/projects/ProjectFinancial';
import { ProjectComments } from '../components/projects/ProjectComments';
import { ArrowLeft, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Projeto } from '../types';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projeto | null>(null);
  const [phasesList, setPhasesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'milestones' | 'financial' | 'comments'>('info');

  // Use static data for tabs that are not yet integrated
  const staticProject = projects.find(p => p.id === 'PRJ-001') || projects[0];

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
        .maybeSingle();

      if (listData) setPhasesList(listData.itens || []);

      // Fetch Project by ID
      const { data, error } = await supabase
        .from('Projetos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do projeto:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Carregando detalhes do projeto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Projeto não encontrado</h2>
        <p className="text-slate-500 mb-6 font-medium">O projeto com o ID especificado não existe ou você não tem permissão para acessá-lo.</p>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] transition-all"
        >
          <ArrowLeft size={18} />
          Voltar para Projetos
        </button>
      </div>
    );
  }

  const getPhaseStyles = (fase: string) => {
    const index = phasesList.indexOf(fase);
    const safeIndex = index === -1 ? 6 : index % colors.length;
    return {
      wrapper: colors[safeIndex],
      dot: dotColors[safeIndex]
    };
  };

  const phaseStyles = getPhaseStyles(project.fase);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={project.descricao || `Projeto ${project.id}`}
        subtitle={`Contratação: ${project.tipoContratacao || 'Não informada'}`}
      />

      <div className="p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar para Lista
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'info', label: 'Geral' },
                { id: 'milestones', label: 'Marcos' },
                { id: 'financial', label: 'Financeiro' },
                { id: 'comments', label: 'Chat' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-6 py-3 text-sm font-black transition-all relative whitespace-nowrap font-semibold tracking-widest",
                    activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <ProjectInfo
                  description={project.descricao}
                  objective={project.objetivo}
                  scope={project.escopo}
                  justification={project.justificativaInclusao}
                />
              )}

              {activeTab === 'milestones' && (
                <ProjectMilestones milestones={staticProject.milestones} />
              )}

              {activeTab === 'financial' && (
                <ProjectFinancial financials={staticProject.financials} />
              )}

              {activeTab === 'comments' && (
                <ProjectComments idProjeto={project.id} />
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Status Atual</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Fase do Projeto</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl justify-center font-black text-xs uppercase tracking-widest",
                    phaseStyles.wrapper
                  )}>
                    <span className={cn("w-2 h-2 rounded-full", phaseStyles.dot)}></span>
                    {project.fase}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full shadow-sm",
                      project.status ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Disponibilidade</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                    project.status ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"
                  )}>
                    {project.status ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-black font-semibold tracking-widest mb-4">Gestor do projeto</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={project.fotoRes1 || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.responsavel1 || 'User')}&background=6366f1&color=fff`}
                      alt="Responsável"
                      className="w-12 h-12 rounded-xl border-2 border-indigo-600/10 shadow-sm shadow-indigo-600/5 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-100">Responsável Titular</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <FileText size={80} />
              </div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Relatório PMBOK</h3>
              <p className="text-xs text-indigo-100 mb-6 leading-relaxed relative z-10 font-medium">
                Gere o status report completo deste projeto exportando indicadores e marcos.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 relative z-10">
                Gerar Status Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

