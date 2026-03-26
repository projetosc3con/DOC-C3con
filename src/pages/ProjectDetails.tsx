import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { ProjectInfo } from '../components/projects/ProjectInfo';
import { ProjectMilestones } from '../components/projects/ProjectMilestones';
import { ProjectFlows } from '../components/projects/ProjectFlows';
import { ProjectComments } from '../components/projects/ProjectComments';
import { ProjectTeam } from '../components/projects/ProjectTeam';
import { ProjectPlanning } from '../components/projects/ProjectPlanning';
import { ArrowLeft, AlertCircle, FileText, Loader2, Users, Calendar, FileSpreadsheet, Info, History, Workflow, Target, FileSignature, Calculator, PanelRightClose, PanelLeft, CloudDownload, CloudUpload } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Projeto } from '../types';
import { getPhaseStyles } from '../utils/projectColors';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, PieChart, Pie } from 'recharts';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Projeto | null>(null);
  const [phasesList, setPhasesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingSchedule, setIsUploadingSchedule] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [indicadores, setIndicadores] = useState<{ iefAcum: number; iefin: number; rociAcum: number } | null>(null);
  const scheduleInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const initialTab = searchParams.get('tab') as 'info' | 'milestones' | 'team' | 'comments' | 'flows' | 'planning' || 'info';
  const [activeTab, setActiveTab] = useState<'info' | 'milestones' | 'team' | 'comments' | 'flows' | 'planning'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: listData } = await supabase
        .from('Listas')
        .select('itens')
        .eq('nomeLista', 'Fases de projeto')
        .maybeSingle();

      if (listData) setPhasesList(listData.itens || []);

      const { data, error } = await supabase
        .from('Projetos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);

      const { data: indicadoresData } = await supabase
        .from('IndicadoresProjeto')
        .select('iefAcum, iefin, rociAcum')
        .eq('idProjeto', id)
        .maybeSingle();

      setIndicadores(indicadoresData);
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

  const phaseStyles = getPhaseStyles(project.fase, phasesList);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={project.descricao || `Projeto ${project.id}`}
        subtitle={`Contratação: ${project.tipoContratacao || 'Não informada'}`}
      />

      <div className="p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between p-3">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all hover:translate-x-[-4px]"
          >
            <ArrowLeft size={14} />
            Voltar para Lista
          </button>

          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              isSidebarVisible
                ? "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
            )}
            title={isSidebarVisible ? "Ocultar detalhes" : "Mostrar detalhes"}
          >
            {isSidebarVisible ? <PanelRightClose size={14} /> : <PanelLeft size={14} />}
            {isSidebarVisible ? "Ocultar Detalhes" : "Mostrar Detalhes"}
          </button>
        </div>

        <div className={cn(
          "flex flex-col-reverse gap-8 transition-all duration-500",
          isSidebarVisible ? "lg:grid lg:grid-cols-3" : "flex"
        )}>
          {/* Left Column: Main Info */}
          <div className={cn(
            "space-y-6 transition-all duration-500",
            isSidebarVisible ? "lg:col-span-2" : "w-full"
          )}>
            {/* Tabs - Reverted to Horizontal Visual */}
            <style>{`
              .scrollbar-custom::-webkit-scrollbar {
                height: 4px;
                width: 4px;
              }
              .scrollbar-custom::-webkit-scrollbar-track {
                background: transparent;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.1);
                border-radius: 10px;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.3);
              }
            `}</style>

            <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto scrollbar-custom p-1 gap-1">
              {[
                { id: 'info', label: 'Geral', icon: Info },
                { id: 'comments', label: 'Histórico', icon: History },
                { id: 'flows', label: 'Fluxos', icon: Workflow },
                { id: 'milestones', label: 'Marcos', icon: Target },
                { id: 'planning', label: 'Planejamento', icon: FileText },
                { id: 'hiring', label: 'Contratação', icon: FileSignature, disabled: true },
                { id: 'estimate', label: 'Estimativa', icon: Calculator, disabled: true },
                { id: 'team', label: 'Equipe', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && handleTabChange(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-black transition-all rounded-xl relative whitespace-nowrap group",
                    activeTab === tab.id
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/50 fill-slate-400",
                    tab.disabled && "opacity-30 cursor-not-allowed grayscale"
                  )}
                >
                  <tab.icon size={16} className={cn(
                    "transition-transform group-hover:scale-110",
                    activeTab === tab.id ? "text-indigo-600" : "text-slate-400"
                  )} />
                  <span className="tracking-widest uppercase text-[10px] font-black">
                    {tab.label}
                  </span>
                  {tab.disabled && (
                    <span className="text-[7px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-400 px-1 py-0.5 rounded uppercase">Breve</span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                  <ProjectInfo
                    projectId={project.id}
                    description={project.descricao || ''}
                    objective={project.objetivo || ''}
                    scope={project.escopo || ''}
                    justification={project.justificativaInclusao || ''}
                    classification={project.classificacao}
                    priority={project.prioridade}
                    hiringType={project.tipoContratacao}
                    projectType={project.tipo}
                    responsavelId={project.responsavel1}
                    onUpdate={fetchData}
                  />
                )}

                {activeTab === 'milestones' && (
                  <ProjectMilestones
                    projectId={project.id}
                    responsavelId={project.responsavel1}
                  />
                )}

                {activeTab === 'flows' && (
                  <ProjectFlows
                    projectId={project.id}
                    responsavelId={project.responsavel1}
                  />
                )}

                {activeTab === 'team' && (
                  <ProjectTeam projectId={project.id} responsavelId={project.responsavel1} />
                )}

                {activeTab === 'comments' && (
                  <ProjectComments idProjeto={project.id} />
                )}

                {activeTab === 'planning' && (
                  <ProjectPlanning projectId={project.id} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Sidebar Stats */}
          {isSidebarVisible && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full shadow-sm",
                      project.status ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                    project.status ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"
                  )}>
                    {project.status ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="pt-6 space-y-8">
                  {/* Gauge Component Helper */}
                  {(() => {
                    const renderGauge = (title: string, actual: number, planned: number = 100) => {
                      const percentage = planned > 0 ? (actual / planned) * 100 : 0;
                      const clampedPercent = Math.min(Math.max(percentage, 0), 200);
                      const rotationDeg = -90 + (clampedPercent / 200) * 180;
                      const isHealthy = percentage >= 85 && percentage <= 100;
                      const textColor = isHealthy ? "text-emerald-500" : (percentage < 85 ? "text-amber-500" : "text-red-500");

                      return (
                        <div className="flex flex-col items-center">
                          <h4 className="text-[9px] text-slate-400 font-black tracking-widest mb-4 text-center uppercase">{title}</h4>
                          <div className="h-[80px] w-full relative flex justify-center">
                            <div className="absolute inset-0 overflow-hidden" style={{ height: '80px' }}>
                              <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                  <Pie
                                    data={[
                                      { value: 85, fill: '#818cf8' },
                                      { value: 15, fill: '#4f46e5' },
                                      { value: 100, fill: '#c7d2fe' }
                                    ]}
                                    cx="50%"
                                    cy={80}
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={50}
                                    outerRadius={70}
                                    dataKey="value"
                                    stroke="none"
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Needle */}
                            <div
                              className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
                              style={{ height: '65px', transform: `translateX(-50%) rotate(${rotationDeg}deg)` }}
                            >
                              <div className="w-[3px] h-full rounded-t-full bg-slate-800 dark:bg-zinc-300 shadow-sm mx-auto" />
                              <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-[3px] border-white dark:border-zinc-800 absolute -bottom-2 -left-[6.5px] shadow-sm" />
                            </div>

                            {/* Value display */}
                            <div className="absolute -bottom-6 left-0 right-0 text-center">
                              <span className={cn("text-lg font-black tracking-tighter", textColor)}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-12">
                        {/* Top Gauge: ROCI Acumulado */}
                        <div className="flex justify-center">
                          <div className="w-1/2">
                            {renderGauge('ROCI Acumulado', (indicadores?.rociAcum || 0) * 100)}
                          </div>
                        </div>

                        {/* Bottom Row: IEF Acum e IEFin */}
                        <div className="grid grid-cols-2 gap-4">
                          {renderGauge('IEF Acumulado', (indicadores?.iefAcum || 0) * 100)}
                          {renderGauge('IEFin', (indicadores?.iefin || 0) * 100)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-6">
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-black tracking-widest mb-2 uppercase block">Fase do Projeto</span>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl justify-center font-black text-xs uppercase tracking-widest",
                      phaseStyles.wrapper
                    )}>
                      <span className={cn("w-2 h-2 rounded-full", phaseStyles.dot)}></span>
                      {project.fase}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <p className="text-[10px] text-slate-400 font-black tracking-widest mb-2 uppercase">Gestor do projeto</p>
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

              {/* Cronogramas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {(() => {
                  const isAdmin = user?.user_metadata?.roleName === 'Administrador';
                  const isResponsavel = user?.id === project?.responsavel1;
                  const canEdit = isAdmin || isResponsavel;
                  const cronogramaUrl = project.cronogramaUrl;

                  const handleScheduleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file || !project) return;
                    setIsUploadingSchedule(true);
                    try {
                      const ext = file.name.split('.').pop();
                      const filePath = `project-${project.id}/cronograma.${ext}`;
                      const { error: uploadError } = await supabase.storage
                        .from('cronogramas')
                        .upload(filePath, file, { upsert: true, cacheControl: '0' });
                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('cronogramas')
                        .getPublicUrl(filePath);

                      const { error: dbError } = await supabase
                        .from('Projetos')
                        .update({ cronogramaUrl: publicUrl })
                        .eq('id', project.id);
                      if (dbError) throw dbError;

                      setProject(prev => prev ? { ...prev, cronogramaUrl: publicUrl } : prev);
                    } catch (err) {
                      console.error('Erro ao enviar cronograma:', err);
                    } finally {
                      setIsUploadingSchedule(false);
                      if (scheduleInputRef.current) scheduleInputRef.current.value = '';
                    }
                  };

                  return (
                    <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Calendar size={80} />
                      </div>
                      <h3 className="font-bold text-lg mb-1 relative z-10">Cronograma Físico</h3>
                      <p className="text-xs text-indigo-100 mb-5 leading-relaxed relative z-10 font-medium">
                        {cronogramaUrl
                          ? 'Arquivo .mpp anexado a este projeto.'
                          : 'Nenhum cronograma anexado ainda.'}
                      </p>

                      <div className="flex flex-row items-center justify-between gap-2 relative z-10 mt-auto">
                        {cronogramaUrl ? (
                          <>
                            <a
                              href={cronogramaUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-12 h-12 flex items-center justify-center bg-white text-indigo-600 rounded-full shadow-lg hover:scale-110 transition-all active:scale-95"
                              title="Visualizar cronograma"
                            >
                              <CloudDownload size={20} />
                            </a>

                            {canEdit && (
                              <div className="flex items-center">
                                <input
                                  ref={scheduleInputRef}
                                  type="file"
                                  accept=".mpp,application/vnd.ms-project"
                                  className="hidden"
                                  title="Substituir arquivo"
                                  onChange={handleScheduleUpload}
                                />
                                <button
                                  onClick={() => scheduleInputRef.current?.click()}
                                  disabled={isUploadingSchedule}
                                  className="p-2 bg-transparent text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5"
                                  title="Substituir arquivo"
                                >
                                  {isUploadingSchedule ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {canEdit ? (
                              <>
                                <input
                                  ref={scheduleInputRef}
                                  type="file"
                                  accept=".mpp,application/vnd.ms-project"
                                  className="hidden"
                                  onChange={handleScheduleUpload}
                                />
                                <button
                                  onClick={() => scheduleInputRef.current?.click()}
                                  disabled={isUploadingSchedule}
                                  className="w-12 h-12 flex items-center justify-center bg-white text-indigo-600 rounded-full shadow-lg hover:scale-110 transition-all active:scale-95 disabled:opacity-60"
                                  title="Anexar cronograma"
                                >
                                  {isUploadingSchedule ? <Loader2 size={20} className="animate-spin" /> : <CloudUpload size={20} />}
                                </button>
                              </>
                            ) : (
                              <div className="text-[10px] italic opacity-60">Sem arquivo</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const isAdmin = user?.user_metadata?.roleName === 'Administrador';
                  const isResponsavel = user?.id === project?.responsavel1;
                  const canEdit = isAdmin || isResponsavel;
                  const cronogramaExcelUrl = project.cronogramaExcelUrl;

                  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file || !project) return;
                    setIsUploadingExcel(true);
                    try {
                      const ext = file.name.split('.').pop();
                      const filePath = `project-${project.id}/cronograma-excel.${ext}`;
                      const { error: uploadError } = await supabase.storage
                        .from('cronogramas')
                        .upload(filePath, file, { upsert: true, cacheControl: '0' });
                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('cronogramas')
                        .getPublicUrl(filePath);

                      const { error: dbError } = await supabase
                        .from('Projetos')
                        .update({ cronogramaExcelUrl: publicUrl })
                        .eq('id', project.id);
                      if (dbError) throw dbError;

                      setProject(prev => prev ? { ...prev, cronogramaExcelUrl: publicUrl } : prev);
                    } catch (err) {
                      console.error('Erro ao enviar cronograma excel:', err);
                    } finally {
                      setIsUploadingExcel(false);
                      if (excelInputRef.current) excelInputRef.current.value = '';
                    }
                  };

                  return (
                    <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-xl shadow-emerald-600/30 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet size={80} />
                      </div>
                      <h3 className="font-bold text-lg mb-1 relative z-10">Cronograma Financeiro</h3>
                      <p className="text-xs text-emerald-100 mb-5 leading-relaxed relative z-10 font-medium">
                        {cronogramaExcelUrl
                          ? 'Arquivo .xlsx anexado a este projeto.'
                          : 'Nenhum cronograma excel anexado ainda.'}
                      </p>

                      <div className="flex flex-row items-center justify-between gap-2 relative z-10 mt-auto">
                        {cronogramaExcelUrl ? (
                          <>
                            <a
                              href={cronogramaExcelUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-12 h-12 flex items-center justify-center bg-white text-emerald-600 rounded-full shadow-lg hover:scale-110 transition-all active:scale-95"
                              title="Visualizar planilha"
                            >
                              <CloudDownload size={20} />
                            </a>

                            {canEdit && (
                              <div className="flex items-center">
                                <input
                                  ref={excelInputRef}
                                  type="file"
                                  accept=".xlsm"
                                  className="hidden"
                                  title="Substituir arquivo"
                                  onChange={handleExcelUpload}
                                />
                                <button
                                  onClick={() => excelInputRef.current?.click()}
                                  disabled={isUploadingExcel}
                                  className="p-2 bg-transparent text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5"
                                  title="Substituir arquivo"
                                >
                                  {isUploadingExcel ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {canEdit ? (
                              <>
                                <input
                                  ref={excelInputRef}
                                  type="file"
                                  accept=".xlsm"
                                  className="hidden"
                                  onChange={handleExcelUpload}
                                />
                                <button
                                  onClick={() => excelInputRef.current?.click()}
                                  disabled={isUploadingExcel}
                                  className="w-12 h-12 flex items-center justify-center bg-white text-emerald-600 rounded-full shadow-lg hover:scale-110 transition-all active:scale-95 disabled:opacity-60"
                                  title="Anexar cronograma"
                                >
                                  {isUploadingExcel ? <Loader2 size={20} className="animate-spin" /> : <CloudUpload size={20} />}
                                </button>
                              </>
                            ) : (
                              <div className="text-[10px] italic opacity-60">Sem arquivo</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
