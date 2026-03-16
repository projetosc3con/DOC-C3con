import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Calendar, MoreVertical, AlertCircle, CheckCircle2, Info, ChevronRight, Loader2, Plus, Search, Filter, X, RotateCcw, User, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { getPhaseStyles } from '../utils/projectColors';

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
  cronogramaUrl: string | null;
  cronogramaExcelUrl: string | null;
  proximoMarco?: {
    nome: string;
    data: string;
  };
}

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter options state
  const [phasesList, setPhasesList] = useState<string[]>([]);
  const [classificacoes, setClassificacoes] = useState<string[]>([]);
  const [contratacoes, setContratacoes] = useState<string[]>([]);
  const [tiposProjeto, setTiposProjeto] = useState<{ id: string, nome: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ uuid: string, fullName: string }[]>([]);

  // Selected filters state
  const [filters, setFilters] = useState({
    fase: '',
    contratacao: '',
    classificacao: '',
    prioridade: '',
    tipo: '',
    responsavel: ''
  });


  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch metadata in parallel
      const [
        { data: listPhases },
        { data: listClass },
        { data: listContr },
        { data: tiposData },
        { data: usersData }
      ] = await Promise.all([
        supabase.from('Listas').select('itens').eq('nomeLista', 'Fases de projeto').single(),
        supabase.from('Listas').select('itens').eq('nomeLista', 'Classificações').maybeSingle(),
        supabase.from('Listas').select('itens').eq('nomeLista', 'Contratações').maybeSingle(),
        supabase.from('TiposProjeto').select('id, nome'),
        supabase.from('Usuarios').select('uuid, fullName')
      ]);

      if (listPhases) setPhasesList(listPhases.itens || []);
      if (listClass) setClassificacoes(listClass.itens || []);
      if (listContr) setContratacoes(listContr.itens || []);
      if (tiposData) setTiposProjeto(tiposData);
      if (usersData) setUsuarios(usersData);

      // 2. Fetch Projects with server-side pagination and filters
      let query = supabase
        .from('Projetos')
        .select('*', { count: 'exact' });

      // Apply Filter conditions (Server Side)
      if (filters.fase) query = query.eq('fase', filters.fase);
      if (filters.contratacao) query = query.eq('tipoContratacao', filters.contratacao);
      if (filters.classificacao) query = query.eq('classificacao', filters.classificacao);
      if (filters.prioridade) query = query.eq('prioridade', filters.prioridade);
      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.responsavel) query = query.eq('responsavel1', filters.responsavel);

      if (searchTerm) {
        // Note: ILIKE is expensive on large tables, but here we cover ID and Description
        if (!isNaN(Number(searchTerm))) {
          query = query.or(`id.eq.${searchTerm},descricao.ilike.%${searchTerm}%`);
        } else {
          query = query.ilike('descricao', `%${searchTerm}%`);
        }
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: projectsData, error: projError, count } = await query
        .order('id', { ascending: true })
        .range(from, to);

      if (projError) throw projError;

      setTotalCount(count || 0);

      // 3. For each project, fetch the nearest upcoming milestone
      // We do this in one batch for better performance (one query for all visible projects)
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const today = new Date().toISOString().split('T')[0];

        const { data: milestonesData } = await supabase
          .from('MarcosProjeto')
          .select('idProjeto, nome, dataPrevista')
          .in('idProjeto', projectIds)
          .not('status', 'in', '("Concluido","Não aplicável")')
          .gte('dataPrevista', today)
          .order('dataPrevista', { ascending: true });

        const projectsWithMilestones = projectsData.map(project => {
          const nextMilestone = milestonesData?.find(m => m.idProjeto === project.id);
          return {
            ...project,
            proximoMarco: nextMilestone ? {
              nome: nextMilestone.nome,
              data: nextMilestone.dataPrevista
            } : undefined
          };
        });

        setProjects(projectsWithMilestones);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, filters, searchTerm]);


  // Client side search is now handled in fetchData for performance
  const filteredProjects = projects;

  const clearFilters = () => {
    setFilters({
      fase: '',
      contratacao: '',
      classificacao: '',
      prioridade: '',
      tipo: '',
      responsavel: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Projetos" subtitle="Gerencie e monitore o desempenho de seus projetos PMBOK." />

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all focus-within:shadow-md">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-all relative",
                activeFiltersCount > 0
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                  : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
              )}
            >
              <Filter size={18} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm animate-in zoom-in duration-300">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/projects/new')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={18} />
              Novo Projeto
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Descrição do projeto</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Classificação</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Próximo Marco</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Fase Atual</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                      <p className="text-sm text-slate-500 mt-4">Carregando carteira de projetos...</p>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Search size={40} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">Nenhum projeto encontrado com os filtros aplicados.</p>
                        <button
                          onClick={clearFilters}
                          className="mt-2 text-indigo-600 text-[10px] font-black uppercase hover:underline"
                        >
                          Limpar todos os filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredProjects.map((project) => {
                  const styles = getPhaseStyles(project.fase, phasesList);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {project.id}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-100 group-hover:text-indigo-600 transition-colors tracking-tight">{project.descricao}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{project.tipo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{project.classificacao}</td>
                      <td className="px-6 py-4">
                        {project.proximoMarco ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                              <Calendar size={12} className="text-slate-400" />
                              <span>{project.proximoMarco.nome}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">
                              {format(new Date(project.proximoMarco.data), "dd/MM/yyyy")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-medium">Sem marcos pendentes</span>
                        )}
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
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-zinc-800 rounded-lg group-hover:bg-white dark:group-hover:bg-zinc-700">
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

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 tracking-widest">
                  Exibindo {projects.length} de {totalCount} projetos
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md text-[10px] font-slate-500 tracking-widest p-1 focus:ring-1 focus:ring-indigo-600 outline-none"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                        currentPage === i + 1
                          ? "bg-indigo-600 text-white"
                          : "bg-white dark:bg-zinc-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                      )}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, currentPage - 2), Math.min(Math.ceil(totalCount / pageSize), currentPage + 1))}
                </div>
                <button
                  disabled={currentPage === Math.ceil(totalCount / pageSize)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-zinc-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="text-indigo-600" size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Filtros Avançados</h2>
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Tipo de Projeto */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Projeto</label>
                    <select
                      value={filters.tipo}
                      onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os tipos</option>
                      {tiposProjeto.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                    </select>
                  </div>

                  {/* Fase */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fase do Projeto</label>
                    <select
                      value={filters.fase}
                      onChange={(e) => setFilters({ ...filters, fase: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as fases</option>
                      {phasesList.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  {/* Classificação */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Classificação</label>
                    <select
                      value={filters.classificacao}
                      onChange={(e) => setFilters({ ...filters, classificacao: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as classificações</option>
                      {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Contratação */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Contratação</label>
                    <select
                      value={filters.contratacao}
                      onChange={(e) => setFilters({ ...filters, contratacao: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os tipos de contratação</option>
                      {contratacoes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prioridade</label>
                    <select
                      value={filters.prioridade}
                      onChange={(e) => setFilters({ ...filters, prioridade: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todas as prioridades</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>

                  {/* Responsável */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Responsável</label>
                    <select
                      value={filters.responsavel}
                      onChange={(e) => setFilters({ ...filters, responsavel: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none p-2.5"
                    >
                      <option value="">Todos os responsáveis</option>
                      {usuarios.map(u => <option key={u.uuid} value={u.uuid}>{u.fullName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-3">
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
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

