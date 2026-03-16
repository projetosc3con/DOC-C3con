import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { ProjectInfo } from '../components/projects/ProjectInfo';
import { ProjectMilestones } from '../components/projects/ProjectMilestones';
import { ProjectFlows } from '../components/projects/ProjectFlows';
import { ProjectComments } from '../components/projects/ProjectComments';
import { ProjectTeam } from '../components/projects/ProjectTeam';
import { ProjectFinancial } from '../components/projects/ProjectFinancial';
import { ArrowLeft, AlertCircle, FileText, Loader2, Users, Upload, Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Projeto } from '../types';
import { getPhaseStyles } from '../utils/projectColors';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockPhysicalProgressData = [
  { name: 'Jan', planned: 5, actual: 5 },
  { name: 'Fev', planned: 15, actual: 12 },
  { name: 'Mar', planned: 30, actual: 25 },
  { name: 'Abr', planned: 50, actual: 48 },
  { name: 'Mai', planned: 75, actual: 60 },
  { name: 'Jun', planned: 100, actual: 80 },
];

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
  const scheduleInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const initialTab = searchParams.get('tab') as 'info' | 'milestones' | 'team' | 'comments' | 'flows' | 'financial' || 'info';
  const [activeTab, setActiveTab] = useState<'info' | 'milestones' | 'team' | 'comments' | 'flows' | 'financial'>(initialTab);

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


  const phaseStyles = getPhaseStyles(project.fase, phasesList);

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

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <style>{`
              .scrollbar-custom::-webkit-scrollbar {
                height: 4px;
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
            <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto scrollbar-custom pb-1">
              {[
                { id: 'info', label: 'Geral' },
                { id: 'milestones', label: 'Marcos' },
                { id: 'team', label: 'Equipe' },
                { id: 'financial', label: 'Financeiro' },
                { id: 'flows', label: 'Fluxos' },
                { id: 'comments', label: 'Histórico' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
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

              {activeTab === 'financial' && (
                <ProjectFinancial projectId={project.id} />
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
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

              {/* Avanço Físico (Mocked) */}
              <div className="pt-6 ">
                <h4 className="text-[10px] text-slate-400 font-black font-semibold tracking-widest mb-2">Avanço Físico</h4>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockPhysicalProgressData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPlannedProject" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      />
                      <Area type="monotone" dataKey="planned" name="Previsto (%)" stroke="#94a3b8" strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPlannedProject)" strokeWidth={2} />
                      <Area type="monotone" dataKey="actual" name="Realizado (%)" stroke="#ec4899" fillOpacity={0} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Previsto</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Realizado</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-black font-semibold tracking-widest mb-2">Fase do Projeto</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl justify-center font-black text-xs uppercase tracking-widest",
                    phaseStyles.wrapper
                  )}>
                    <span className={cn("w-2 h-2 rounded-full", phaseStyles.dot)}></span>
                    {project.fase}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] text-slate-400 font-black font-semibold tracking-widest mb-2">Gestor do projeto</p>
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
              {/* Cronograma MS Project */}
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

                    <div className="flex flex-row gap-2 relative z-10">
                      {cronogramaUrl && (
                        <a
                          href={cronogramaUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 bg-white text-indigo-600 rounded-lg text-[10px] font-black tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Download size={12} />
                          Baixar
                        </a>
                      )}

                      {canEdit && (
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
                            className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-indigo-600 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60"
                          >
                            {isUploadingSchedule
                              ? <><Loader2 size={12} className="animate-spin" /> ...</>
                              : <><Upload size={12} /> {cronogramaUrl ? 'Substituir' : 'Anexar'}</>
                            }
                          </button>
                        </>
                      )}

                      {!cronogramaUrl && !canEdit && (
                        <span className="text-[10px] text-indigo-200 font-medium text-center italic">
                          Aguardando o responsável anexar o arquivo.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Cronograma Excel */}
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

                    <div className="flex flex-row gap-2 relative z-10">
                      {cronogramaExcelUrl && (
                        <a
                          href={cronogramaExcelUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 bg-white text-emerald-600 rounded-lg text-[10px] font-black tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Download size={12} />
                          Baixar
                        </a>
                      )}

                      {canEdit && (
                        <>
                          <input
                            ref={excelInputRef}
                            type="file"
                            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            className="hidden"
                            onChange={handleExcelUpload}
                          />
                          <button
                            onClick={() => excelInputRef.current?.click()}
                            disabled={isUploadingExcel}
                            className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-emerald-600 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60"
                          >
                            {isUploadingExcel
                              ? <><Loader2 size={12} className="animate-spin" /> ...</>
                              : <><Upload size={12} /> {cronogramaExcelUrl ? 'Substituir' : 'Anexar'}</>
                            }
                          </button>
                        </>
                      )}

                      {!cronogramaExcelUrl && !canEdit && (
                        <span className="text-[10px] text-emerald-200 font-medium text-center italic">
                          Aguardando o responsável anexar o arquivo.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

