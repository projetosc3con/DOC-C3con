import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  FileText,
  Target,
  AlertCircle,
  Layout,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { TipoProjeto, Usuario } from '../types';

export const NewProjectPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [users, setUsers] = useState<Usuario[]>([]);
  const [projectTypes, setProjectTypes] = useState<TipoProjeto[]>([]);
  const [classifications, setClassifications] = useState<string[]>([]);
  const [hirings, setHirings] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    descricao: '',
    escopo: '',
    objetivo: '',
    justificativaInclusao: '',
    classificacao: '',
    prioridade: 'Média',
    tipo: '',
    idTipo: '',
    tipoContratacao: '',
    dataInicio: '',
    responsavel1: '',
    fotoRes1: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, typesRes, listsRes] = await Promise.all([
          supabase.from('Usuarios').select('*'),
          supabase.from('TiposProjeto').select('*'),
          supabase.from('Listas').select('nomeLista, itens')
        ]);

        if (usersRes.data) setUsers(usersRes.data);
        if (typesRes.data) setProjectTypes(typesRes.data);
        
        if (listsRes.data) {
          const classList = listsRes.data.find(l => l.nomeLista === 'Classificações');
          const hiringList = listsRes.data.find(l => l.nomeLista === 'Contratações');
          if (classList) setClassifications(classList.itens);
          if (hiringList) setHirings(hiringList.itens);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'idTipo') {
      const selectedType = projectTypes.find(t => t.id === value);
      setFormData(prev => ({ 
        ...prev, 
        idTipo: value,
        tipo: selectedType ? selectedType.nome : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUserChange = (uuid: string) => {
    const selectedUser = users.find(u => u.uuid === uuid);
    setFormData(prev => ({ 
      ...prev, 
      responsavel1: uuid, 
      fotoRes1: selectedUser?.profileUrl || ''
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) {
      handleNext();
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from('Projetos').insert([{
        descricao: formData.descricao,
        escopo: formData.escopo,
        objetivo: formData.objetivo,
        justificativaInclusao: formData.justificativaInclusao,
        classificacao: formData.classificacao,
        prioridade: formData.prioridade,
        tipo: formData.tipo,
        idTipo: formData.idTipo,
        tipoContratacao: formData.tipoContratacao,
        dataInicio: formData.dataInicio || null,
        responsavel1: formData.responsavel1 || null,
        fotoRes1: formData.fotoRes1 || null,
        status: true
      }]);

      if (error) throw error;
      
      // O cronograma é gerado automaticamente pelo trigger tr_generate_project_milestones_pascal
      navigate('/projects');
    } catch (err) {
      console.error('Erro ao salvar projeto:', err);
      alert('Erro ao salvar o projeto. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Detalhes', icon: <FileText size={16} /> },
    { title: 'Enquadramento', icon: <Layout size={16} /> },
    { title: 'Responsabilidade', icon: <Users size={16} /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header 
        title="Novo Projeto" 
        subtitle="Inicie um novo projeto preenchendo as informações multietapa." 
      />
      
      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    currentStep === index + 1 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : currentStep > index + 1
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                  )}
                >
                  {currentStep > index + 1 ? <CheckCircle2 size={18} /> : step.icon}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  currentStep === index + 1 ? "text-indigo-600" : "text-slate-400"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Detalhes do Projeto</h3>
                    <p className="text-xs text-slate-500">Definição básica, escopo e justificativa.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Descrição</label>
                    <input
                      required
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      type="text"
                      placeholder="Ex: Novo Portal do Cliente"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Escopo</label>
                      <textarea
                        name="escopo"
                        value={formData.escopo}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Objetivo</label>
                      <textarea
                        name="objetivo"
                        value={formData.objetivo}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Justificativa de Inclusão</label>
                    <textarea
                      name="justificativaInclusao"
                      value={formData.justificativaInclusao}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600">
                    <Layout size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Enquadramento do Projeto</h3>
                    <p className="text-xs text-slate-500">Cronograma e classificação PMBOK.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Data de Início</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        name="dataInicio"
                        value={formData.dataInicio}
                        onChange={handleChange}
                        type="date"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Tipo de Projeto (Template)</label>
                    <select
                      required
                      name="idTipo"
                      value={formData.idTipo}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione um template...</option>
                      {projectTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Tipo de Contratação</label>
                    <select
                      name="tipoContratacao"
                      value={formData.tipoContratacao}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione...</option>
                      {hirings.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Classificação</label>
                    <select
                      name="classificacao"
                      value={formData.classificacao}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione...</option>
                      {classifications.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Prioridade</label>
                    <div className="flex gap-4">
                      {['Baixa', 'Média', 'Alta'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, prioridade: p }))}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2",
                            formData.prioridade === p 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-600/50"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Responsabilidade</h3>
                    <p className="text-xs text-slate-500">Definição do gestor titular.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Responsável Titular</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {users.map((u) => (
                        <button
                          key={u.uuid}
                          type="button"
                          onClick={() => handleUserChange(u.uuid)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                            formData.responsavel1 === u.uuid
                              ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10"
                              : "border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900"
                          )}
                        >
                          <img 
                            src={u.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=6366f1&color=fff`} 
                            alt={u.fullName || ''}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">
                              {u.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
                              {u.email}
                            </p>
                          </div>
                          {formData.responsavel1 === u.uuid && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                              <CheckCircle2 size={14} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.fotoRes1 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Avatar do Responsável</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">URL vinculada automaticamente</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              {currentStep === 1 ? <ArrowLeft size={18} /> : <ChevronLeft size={18} />}
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentStep === 3 ? (
                <>
                  <Save size={18} />
                  Cadastrar Projeto
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
