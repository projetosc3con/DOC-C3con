import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Shield, UserCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MembroEquipe {
  id: string;
  idProjeto: number;
  atribuicao: string;
  uid: string;
  nome: string;
  recurso: string;
  profileUrl: string;
}

interface ProjectTeamProps {
  projectId: number;
}

export const ProjectTeam = ({ projectId }: ProjectTeamProps) => {
  const [team, setTeam] = useState<MembroEquipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('EquipeProjeto')
        .select('*')
        .eq('idProjeto', projectId);

      if (error) throw error;
      setTeam(data || []);
    } catch (err) {
      console.error('Erro ao buscar equipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [projectId]);

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
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <span className="text-[10px] font-black uppercase text-slate-400">Total de Membros</span>
          <span className="text-sm font-bold text-indigo-600">{team.length}</span>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {team.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
              <UserCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm text-slate-500 font-medium">Nenhum membro da equipe cadastrado para este projeto.</p>
            </div>
          ) : (
            team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={member.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=6366f1&color=fff`}
                      alt={member.nome}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:border-indigo-100 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                      <Shield size={12} className="text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
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
    </div>
  );
};
