import React, { useEffect, useState } from 'react';
import { Users, Shield, UserCircle, Loader2, Plus, CheckCircle2, Save, X, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface MembroEquipe {
  id: string;
  idProjeto: number;
  atribuicao: string;
  uid: string;
  nome: string;
  recurso: string;
  profileUrl: string;
}

interface UsuarioDisponivel {
  uuid: string;
  fullName: string;
  profileUrl: string | null;
  recurso_nome: string;
}

interface TeamMemberForm {
  uid: string;
  atribuicao: string;
}

interface ProjectTeamProps {
  projectId: number;
  responsavelId: string; // UUID do gestor/responsável do projeto
}

export const ProjectTeam = ({ projectId, responsavelId }: ProjectTeamProps) => {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.roleName === 'Administrador';
  const isGestor = user?.id === responsavelId;
  const canEdit = isAdmin || isGestor;

  const [team, setTeam] = useState<MembroEquipe[]>([]);
  const [allUsers, setAllUsers] = useState<UsuarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  // Form state mirrors NewProject pattern
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: teamData, error: teamError }, { data: usersRaw, error: usersError }] = await Promise.all([
        supabase.from('EquipeProjeto').select('*').eq('idProjeto', projectId),
        supabase
          .from('Usuarios')
          .select('uuid, fullName, profileUrl, idRecurso, Recursos!fk_usuarios_recurso(nomeExibicao)')
          .eq('ativo', true)
      ]);

      if (teamError) throw teamError;
      if (usersError) throw usersError;

      setTeam(teamData || []);
      setTeamMembers((teamData || []).map(m => ({ uid: m.uid, atribuicao: m.atribuicao })));

      const mapped: UsuarioDisponivel[] = (usersRaw || []).map((u: any) => ({
        uuid: u.uuid,
        fullName: u.fullName,
        profileUrl: u.profileUrl,
        recurso_nome: u.Recursos?.nomeExibicao || 'Recurso'
      }));
      setAllUsers(mapped);
    } catch (err) {
      console.error('Erro ao buscar equipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const toggleMember = (u: UsuarioDisponivel) => {
    const alreadyIn = teamMembers.some(m => m.uid === u.uuid);
    if (alreadyIn) {
      setTeamMembers(prev => prev.filter(m => m.uid !== u.uuid));
    } else {
      setTeamMembers(prev => [...prev, { uid: u.uuid, atribuicao: '' }]);
    }
  };

  const updateAttribution = (uid: string, atribuicao: string) => {
    setTeamMembers(prev => prev.map(m => m.uid === uid ? { ...m, atribuicao } : m));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Delete existing team for this project and re-insert
      await supabase.from('EquipeProjeto').delete().eq('idProjeto', projectId);

      if (teamMembers.length > 0) {
        const inserts = teamMembers.map(m => {
          const user = allUsers.find(u => u.uuid === m.uid);
          return {
            idProjeto: projectId,
            uid: m.uid,
            atribuicao: m.atribuicao || 'Colaborador',
            nome: user?.fullName || '',
            recurso: user?.recurso_nome || '',
            profileUrl: user?.profileUrl || null
          };
        });
        const { error } = await supabase.from('EquipeProjeto').insert(inserts);
        if (error) throw error;
      }

      await fetchData();
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar equipe:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restore form from current saved team
    setTeamMembers(team.map(m => ({ uid: m.uid, atribuicao: m.atribuicao })));
    setIsEditing(false);
  };

  const handleQuickRemove = async (memberId: string) => {
    try {
      await supabase.from('EquipeProjeto').delete().eq('id', memberId);
      setConfirmRemove(null);
      await fetchData();
    } catch (err) {
      console.error('Erro ao remover membro:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm text-slate-500 font-medium tracking-tight">Carregando estrutura da equipe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Equipe do Projeto</h3>
            <p className="text-xs text-slate-500 font-medium">Colaboradores e partes interessadas envolvidas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-[10px] font-black uppercase text-slate-400">Total de Membros</span>
            <span className="text-sm font-bold text-indigo-600">{team.length}</span>
          </div>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Edit2 size={14} />
              Gerenciar
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode: User Picker */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                Selecionar Membros
              </h4>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allUsers.map((u) => {
                const isMember = teamMembers.some(m => m.uid === u.uuid);
                return (
                  <div
                    key={u.uuid}
                    className={cn(
                      "flex flex-col p-4 rounded-2xl border-2 transition-all",
                      isMember
                        ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10"
                        : "border-slate-100 dark:border-slate-800 hover:border-indigo-300"
                    )}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={u.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=6366f1&color=fff`}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{u.fullName}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{u.recurso_nome}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMember(u)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isMember
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600"
                        )}
                      >
                        {isMember ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                      </button>
                    </div>

                    {isMember && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1"
                      >
                        <label className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">Atribuição / Papel</label>
                        <input
                          type="text"
                          placeholder="Ex: Arquiteto de Software"
                          value={teamMembers.find(m => m.uid === u.uuid)?.atribuicao || ''}
                          onChange={(e) => updateAttribution(u.uuid, e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-[11px] font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Salvar Equipe
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Grid (Read Mode) */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {team.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <UserCircle size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm text-slate-500 font-medium">Nenhum membro da equipe cadastrado para este projeto.</p>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Plus size={14} />
                    Adicionar Membros
                  </button>
                )}
              </div>
            ) : (
              team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group relative"
                >
                  {/* Quick remove button (admin/gestor only) */}
                  {canEdit && (
                    <div className="absolute top-3 right-3">
                      <AnimatePresence mode="wait">
                        {confirmRemove === member.id ? (
                          <motion.div
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-1.5"
                          >
                            <span className="text-[9px] font-black text-red-500 uppercase">Remover?</span>
                            <button
                              onClick={() => handleQuickRemove(member.id)}
                              className="px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-black uppercase hover:bg-red-700 transition-colors"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmRemove(null)}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded text-[9px] font-black uppercase hover:bg-slate-200 transition-colors"
                            >
                              Não
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="remove-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmRemove(member.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={member.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=6366f1&color=fff`}
                        alt={member.nome}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:border-indigo-100 transition-colors"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                        <Shield size={12} className="text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                        {member.nome}
                      </h4>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 truncate">
                        {member.recurso || 'Recurso não definido'}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">ATRIBUIÇÃO</span>
                        <span className="text-[10px] font-black text-indigo-600 tracking-tighter truncate max-w-[120px]">
                          {member.atribuicao || 'Colaborador'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
