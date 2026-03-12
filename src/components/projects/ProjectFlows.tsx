import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import {
    GitBranch, Plus, Loader2, Clock, CheckCircle2, XCircle, 
    ArrowRight, MessageSquare, Paperclip, User, Flag, Save, X, Trash2, 
    Calendar, AlertCircle, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { FluxoProjeto, MarcoProjeto, Usuario } from '../../types';

interface ProjectFlowsProps {
    projectId: number;
    responsavelId: string | null;
}

export const ProjectFlows = ({ projectId, responsavelId }: ProjectFlowsProps) => {
    const { user } = useAuth();
    const [flows, setFlows] = useState<FluxoProjeto[]>([]);
    const [milestones, setMilestones] = useState<MarcoProjeto[]>([]);
    const [users, setUsers] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUrlFlowId, setEditingUrlFlowId] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        idMarco: '',
        aprovador: '',
        atribuidoA: '',
        faseAoFim: '',
        exigeAnexo: false
    });

    const isAdmin = user?.user_metadata?.roleName === 'Administrador';
    const isManager = user?.id === responsavelId;
    const canCreate = isAdmin || isManager;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [flowsRes, milestonesRes, usersRes] = await Promise.all([
                supabase.from('FluxosProjeto').select('*').eq('idProjeto', projectId).order('createdAt', { ascending: false }),
                supabase.from('MarcosProjeto').select('*').eq('idProjeto', projectId).order('ordem', { ascending: true }),
                supabase.from('Usuarios').select('*').eq('ativo', true).order('fullName', { ascending: true })
            ]);

            if (flowsRes.error) throw flowsRes.error;
            if (milestonesRes.error) throw milestonesRes.error;
            if (usersRes.error) throw usersRes.error;

            setFlows(flowsRes.data || []);
            setMilestones(milestonesRes.data || []);
            setUsers(usersRes.data || []);
        } catch (err) {
            console.error('Erro ao buscar dados do fluxo:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const showNotification = (message: string, type: 'error' | 'success' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateFlow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canCreate || isSaving) return;

        setIsSaving(true);
        try {
            // Find milestone for dataLimite
            let dataLimite = null;
            if (formData.idMarco) {
                const milestone = milestones.find(m => m.id === formData.idMarco);
                if (milestone) {
                    dataLimite = milestone.dataReal || milestone.dataPrevista;
                }
            }

            const { data, error } = await supabase
                .from('FluxosProjeto')
                .insert([{
                    nome: formData.nome,
                    descricao: formData.descricao,
                    idProjeto: projectId,
                    idMarco: formData.idMarco || null,
                    aprovador: formData.aprovador || null,
                    atribuidoA: formData.atribuidoA || null,
                    faseAoFim: formData.faseAoFim || null,
                    exigeAnexo: formData.exigeAnexo,
                    dataLimite: dataLimite,
                    status: 'Criação',
                    createdBy: user?.id
                }])
                .select();

            if (error) throw error;

            setFlows([data[0], ...flows]);
            setIsModalOpen(false);
            setFormData({ nome: '', descricao: '', idMarco: '', aprovador: '', atribuidoA: '', faseAoFim: '', exigeAnexo: false });
        } catch (err) {
            console.error('Erro ao criar fluxo:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteFlow = async (id: string) => {
        if (!canCreate) return;
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const { error } = await supabase.from('FluxosProjeto').delete().eq('id', deletingId);
            if (error) throw error;
            setFlows(flows.filter(f => f.id !== deletingId));
            showNotification('Fluxo excluído com sucesso');
        } catch (err) {
            console.error('Erro ao excluir fluxo:', err);
            showNotification('Erro ao excluir fluxo', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, flowId: string) => {
        const file = e.target.files?.[0];
        if (!file || isUploading) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `flows/${projectId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('FluxosProjeto')
                .update({ urlAnexo: publicUrl, updatedAt: new Date().toISOString() })
                .eq('id', flowId);

            if (updateError) throw updateError;

            setFlows(flows.map(f => f.id === flowId ? { ...f, urlAnexo: publicUrl } : f));
            showNotification('Documento carregado com sucesso');
        } catch (err: any) {
            console.error('Erro no upload:', err);
            showNotification(`Erro ao carregar documento: ${err.message || 'Erro desconhecido'}`, 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const updateStatus = async (id: string, newStatus: FluxoProjeto['status']) => {
        const flow = flows.find(f => f.id === id);
        if (newStatus === 'Aprovação Solicitada' && flow?.exigeAnexo === true && !flow?.urlAnexo) {
            showNotification('Um anexo obrigatório deve ser carregado antes de solicitar a aprovação.', 'error');
            return;
        }

        try {
            const { error } = await supabase
                .from('FluxosProjeto')
                .update({ status: newStatus, updatedAt: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setFlows(flows.map(f => f.id === id ? { ...f, status: newStatus } : f));
            showNotification(`Status atualizado para: ${newStatus === 'Aprovação Solicitada' ? 'Em Análise' : newStatus}`);
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            showNotification('Erro ao atualizar status do fluxo', 'error');
        }
    };

    const getStatusInfo = (status: FluxoProjeto['status']) => {
        switch (status) {
            case 'Criação': return { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Plus, label: 'Criação' };
            case 'Aprovação Solicitada': return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Em Análise' };
            case 'Aprovado': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Aprovado' };
            case 'Reprovado': return { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Reprovado' };
        }
    };

    if (isLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500 font-medium tracking-tight">Carregando fluxos de aprovação...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <GitBranch size={20} className="text-indigo-600" />
                        Fluxos de Aprovação
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-md">Os fluxos permitem designar responsabilidades e validações específicas por marco.</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={16} />
                        Novo Fluxo
                    </button>
                )}
            </div>

            {flows.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-300">
                        <GitBranch size={32} />
                    </div>
                    <h4 className="text-slate-900 dark:text-slate-100 font-bold mb-1">Nenhum fluxo encontrado</h4>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Inicie a gestão de aprovações atribuindo tarefas para a equipe.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {flows.map((flow) => {
                        const status = getStatusInfo(flow.status);
                        const progress = flow.status === 'Criação' ? 25 : flow.status === 'Aprovação Solicitada' ? 60 : 100;
                        const isAssignee = user?.id === flow.atribuidoA;
                        const isApprover = user?.id === flow.aprovador;
                        
                        return (
                            <motion.div
                                key={flow.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0", 
                                                flow.status === 'Aprovado' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                                                flow.status === 'Reprovado' ? 'bg-red-500 shadow-red-500/20' : 
                                                flow.status === 'Aprovação Solicitada' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 shadow-indigo-600/20'
                                            )}>
                                                <status.icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-slate-50">{flow.nome}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{flow.descricao}</p>
                                                    {flow.dataLimite && (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                            <Calendar size={12} />
                                                            {new Date(flow.dataLimite).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", status.bg, status.color)}>
                                                {status.label}
                                            </span>
                                            {canCreate && (
                                                <button onClick={() => handleDeleteFlow(flow.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Visual UX */}
                                    <div className="relative mb-8 pt-4">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={cn("h-full transition-all duration-500", 
                                                flow.status === 'Aprovado' ? 'bg-emerald-500' : flow.status === 'Reprovado' ? 'bg-red-500' : 'bg-indigo-600')} />
                                        </div>
                                        <div className="relative flex justify-between items-center px-4">
                                            {[
                                                { id: 'Criação', icon: Plus, label: 'Criação' },
                                                { id: 'Aprovação Solicitada', icon: Clock, label: 'Aprovação' },
                                                { id: 'Final', icon: CheckCircle2, label: 'Finalizado' }
                                            ].map((step, idx) => {
                                                const isCompleted = idx === 0 || (idx === 1 && flow.status !== 'Criação') || (idx === 2 && (flow.status === 'Aprovado' || flow.status === 'Reprovado'));
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300", 
                                                            isCompleted ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400")}>
                                                            <step.icon size={14} />
                                                        </div>
                                                        <span className={cn("text-[9px] font-black uppercase tracking-tight", isCompleted ? "text-indigo-600" : "text-slate-400")}>{step.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Assignee / Info Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><User size={16} /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsável</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{users.find(u => u.uuid === flow.atribuidoA)?.fullName || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><ShieldCheck size={16} /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aprovador</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{users.find(u => u.uuid === flow.aprovador)?.fullName || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Flag size={16} /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marco Relacionado</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{milestones.find(m => m.id === flow.idMarco)?.nome || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            {flow.exigeAnexo && (
                                                <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-tight", flow.urlAnexo ? "text-emerald-500" : "text-amber-500")}>
                                                    <Paperclip size={14} />
                                                    {flow.urlAnexo ? 'Anexo Vinculado' : 'Anexo Obrigatório'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Link & Phase Control */}
                                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                        <div className="flex-1 w-full flex items-center gap-4">
                                            {flow.urlAnexo ? (
                                                <a href={flow.urlAnexo} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-white dark:hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-all shadow-sm">
                                                    <Paperclip size={14} /> Visualizar Documento
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic flex items-center gap-2">
                                                    {flow.exigeAnexo ? (
                                                        <><AlertCircle size={14} className="text-amber-500" /> Anexo obrigatório pendente</>
                                                    ) : (
                                                        <><Paperclip size={14} /> Nenhum anexo (opcional)</>
                                                    )}
                                                </span>
                                            )}
                                            
                                            {flow.status === 'Criação' && isAssignee && (
                                                <div className="flex items-center">
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef} 
                                                        className="hidden" 
                                                        onChange={(e) => handleFileSelect(e, flow.id)}
                                                    />
                                                    <button 
                                                        disabled={isUploading}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className={cn(
                                                            "text-[10px] font-black uppercase flex items-center gap-2 transition-all",
                                                            isUploading ? "text-slate-400 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-700 hover:underline"
                                                        )}
                                                    >
                                                        {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                                        {flow.urlAnexo ? 'Substituir' : 'Fazer Upload'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {flow.status === 'Criação' && isAssignee && (
                                                <button 
                                                    onClick={() => updateStatus(flow.id, 'Aprovação Solicitada')}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                                                >
                                                    Solicitar Aprovação <ArrowRight size={14} />
                                                </button>
                                            )}
                                            {flow.status === 'Aprovação Solicitada' && isApprover && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateStatus(flow.id, 'Reprovado')} className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-200 transition-all">Reprovar</button>
                                                    <button onClick={() => updateStatus(flow.id, 'Aprovado')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all">Aprovar</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal Novo Fluxo */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 font-black">
                                <h3 className="text-sm uppercase tracking-widest flex items-center gap-3">
                                    <GitBranch className="text-indigo-600" size={18} /> Novo Fluxo de Trabalho
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateFlow} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título do Fluxo</label>
                                        <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</label>
                                        <textarea rows={2} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600 resize-none" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marco PAI (Data Limite)</label>
                                        <select required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={formData.idMarco} onChange={e => setFormData({ ...formData, idMarco: e.target.value })}>
                                            <option value="">Selecione um marco...</option>
                                            {milestones.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fase após Aprovação</label>
                                        <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={formData.faseAoFim} onChange={e => setFormData({ ...formData, faseAoFim: e.target.value })}>
                                            <option value="">Nenhuma alteração</option>
                                            <option value="Iniciação">Iniciação</option>
                                            <option value="Planejamento">Planejamento</option>
                                            <option value="Execução">Execução</option>
                                            <option value="Entrega">Entrega Final</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável (Atribuído a)</label>
                                        <select required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={formData.atribuidoA} onChange={e => setFormData({ ...formData, atribuidoA: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            {users.map(u => <option key={u.uuid} value={u.uuid}>{u.fullName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aprovador Final</label>
                                        <select required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={formData.aprovador} onChange={e => setFormData({ ...formData, aprovador: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            {users.map(u => <option key={u.uuid} value={u.uuid}>{u.fullName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                                    <input type="checkbox" id="exigeAnexo" className="w-4 h-4 accent-indigo-600" checked={formData.exigeAnexo} onChange={e => setFormData({ ...formData, exigeAnexo: e.target.checked })} />
                                    <label htmlFor="exigeAnexo" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Exigir anexo obrigatório para solicitação de aprovação</label>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                                    <button disabled={isSaving} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20">{isSaving ? 'Processando...' : 'Iniciar Fluxo'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toasts / Notifications */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={cn(
                            "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
                            notification.type === 'error' ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        )}
                    >
                        {notification.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
                        <span className="text-sm font-black uppercase tracking-tight">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {deletingId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeletingId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-1 uppercase text-sm tracking-widest">Excluir Fluxo?</h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Esta ação não pode ser desfeita. Deseja realmente remover este fluxo de aprovação?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeletingId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest">Manter</button>
                                <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20">Remover</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
