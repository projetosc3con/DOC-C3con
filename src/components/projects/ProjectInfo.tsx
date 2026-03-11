import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    FileText, Target, Zap, AlertCircle, Edit, X, Save,
    Loader2, CheckCircle2, Layers, BarChart3, Briefcase, LayoutGrid, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface ProjectInfoProps {
    projectId: number;
    description: string;
    objective: string;
    scope: string;
    justification: string;
    classification: string | null;
    priority: string | null;
    hiringType: string | null;
    projectType: string | null;
    responsavelId: string | null;
    onUpdate: () => void;
}

export const ProjectInfo = ({
    projectId,
    description,
    objective,
    scope,
    justification,
    classification,
    priority,
    hiringType,
    projectType,
    responsavelId,
    onUpdate
}: ProjectInfoProps) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Options for selects
    const [classificacoes, setClassificacoes] = useState<string[]>([]);
    const [contratacoes, setContratacoes] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        description: description || '',
        objective: objective || '',
        scope: scope || '',
        justification: justification || '',
        classification: classification || '',
        priority: priority || '',
        hiringType: hiringType || '',
        projectType: projectType || ''
    });

    const isAdmin = user?.user_metadata?.roleName === 'Administrador';
    const isManager = user?.id === responsavelId;
    const canEdit = isAdmin || isManager;

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const { data, error } = await supabase
                    .from('Listas')
                    .select('nomeLista, itens');
                
                if (error) throw error;

                const classifList = data.find(l => l.nomeLista === 'Classificações')?.itens || [];
                const contrList = data.find(l => l.nomeLista === 'Contratações')?.itens || [];

                setClassificacoes(classifList);
                setContratacoes(contrList);
            } catch (err) {
                console.error('Erro ao buscar listas para edição:', err);
            }
        };

        if (canEdit) {
            fetchLists();
        }
    }, [canEdit]);

    const handleOpenModal = () => {
        setFormData({
            description: description || '',
            objective: objective || '',
            scope: scope || '',
            justification: justification || '',
            classification: classification || '',
            priority: priority || '',
            hiringType: hiringType || '',
            projectType: projectType || ''
        });
        setSaveStatus('idle');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('Projetos')
                .update({
                    descricao: formData.description,
                    objetivo: formData.objective,
                    escopo: formData.scope,
                    justificativaInclusao: formData.justification,
                    classificacao: formData.classification,
                    prioridade: formData.priority,
                    tipoContratacao: formData.hiringType
                    // projectType (tipo) não é mais atualizado aqui conforme regra de negócio
                })
                .eq('id', projectId);

            if (error) throw error;

            setSaveStatus('success');
            onUpdate();
            setTimeout(() => {
                setIsModalOpen(false);
                setSaveStatus('idle');
            }, 1500);
        } catch (err) {
            console.error('Erro ao atualizar projeto:', err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tipo de Projeto', value: projectType, icon: LayoutGrid },
                    { label: 'Classificação', value: classification, icon: Layers },
                    { label: 'Contratação', value: hiringType, icon: Briefcase },
                    { label: 'Prioridade', value: priority, icon: BarChart3 }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <item.icon size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-sm text-slate-900 dark:text-slate-100 truncate">
                            {item.value || ""}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 md:col-span-2">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <FileText size={16} className="text-indigo-600" />
                        Descrição do Projeto
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                        {description || "Nenhuma descrição detalhada fornecida."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <Target size={18} className="text-indigo-600" />
                        Objetivo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {objective || "Objetivo não definido."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <Zap size={18} className="text-indigo-600" />
                        Escopo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {scope || "Escopo não detalhado."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <AlertCircle size={18} className="text-indigo-600" />
                        Justificativa
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {justification || "Justificativa não informada."}
                    </p>
                </div>

                <div className="flex justify-start col-span-1 md:col-span-2">
                    {canEdit && (
                        <button
                            onClick={handleOpenModal}
                            className="flex items-center gap-2 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Edit size={20} />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSaving && setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <Edit size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Editar Informações</h3>
                                        <p className="text-xs text-slate-500">Atualize os dados estruturais do projeto.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSaving}
                                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <FileText size={14} className="text-indigo-600" />
                                            Descrição do Projeto
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[100px] text-slate-900 dark:text-slate-100"
                                            placeholder="Descreva o propósito e contexto do projeto..."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <Target size={14} className="text-indigo-600" />
                                            Objetivo
                                        </label>
                                        <textarea
                                            value={formData.objective}
                                            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[100px] text-slate-900 dark:text-slate-100"
                                            placeholder="Quais são os principais objetivos?"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <Zap size={14} className="text-indigo-600" />
                                            Escopo
                                        </label>
                                        <textarea
                                            value={formData.scope}
                                            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[100px] text-slate-900 dark:text-slate-100"
                                            placeholder="O que está incluído e o que não está?"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <AlertCircle size={14} className="text-indigo-600" />
                                            Justificativa
                                        </label>
                                        <textarea
                                            value={formData.justification}
                                            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[100px] text-slate-900 dark:text-slate-100"
                                            placeholder="Por que este projeto é necessário?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Layers size={14} className="text-indigo-600" />
                                                Classificação
                                            </label>
                                            <select
                                                value={formData.classification}
                                                onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            >
                                                <option value="">Selecione...</option>
                                                {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <BarChart3 size={14} className="text-indigo-600" />
                                                Prioridade
                                            </label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="Baixa">Baixa</option>
                                                <option value="Média">Média</option>
                                                <option value="Alta">Alta</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Briefcase size={14} className="text-indigo-600" />
                                                Contratação
                                            </label>
                                            <select
                                                value={formData.hiringType}
                                                onChange={(e) => setFormData({ ...formData, hiringType: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            >
                                                <option value="">Selecione...</option>
                                                {contratacoes.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 opacity-60">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <LayoutGrid size={14} className="text-indigo-600" />
                                                Tipo (Imutável)
                                            </label>
                                            <div className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 flex items-center gap-2">
                                                <Lock size={12} />
                                                {formData.projectType}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {saveStatus === 'error' && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold">
                                        <AlertCircle size={14} />
                                        Erro ao salvar alterações. Tente novamente.
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className={cn(
                                            "px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-50",
                                            saveStatus === 'success'
                                                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                                : "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
                                        )}
                                    >
                                        {isSaving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : saveStatus === 'success' ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        {saveStatus === 'success' ? 'Salvo!' : 'Salvar Dados'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
