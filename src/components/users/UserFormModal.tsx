import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, UserCircle, Mail, Camera, Save, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Usuario, Recurso } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: Usuario | null;
  dbResources: Recurso[];
  onSuccess: () => void;
}

export const UserFormModal = ({ isOpen, onClose, editingUser, dbResources, onSuccess }: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    idRecurso: '',
    profileUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setFormData({
          fullName: editingUser.fullName || '',
          email: editingUser.email || '',
          idRecurso: editingUser.idRecurso || '',
          profileUrl: editingUser.profileUrl || ''
        });
      } else {
        setFormData({
          fullName: '',
          email: '',
          idRecurso: '',
          profileUrl: ''
        });
      }
      setStatusMessage(null);
    }
  }, [isOpen, editingUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setStatusMessage(null);

      if (editingUser) {
        // Atualizar usuário existente
        const { error: dbError } = await supabase
          .from('Usuarios')
          .update({
            fullName: formData.fullName,
            idRecurso: formData.idRecurso || null
          })
          .eq('uuid', editingUser.uuid);

        if (dbError) throw dbError;
        
        setStatusMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1500);
      } else {
        // Criar novo usuário via magic link (signInWithOtp simulando convite)
        const selectedResource = dbResources.find(r => r.id === formData.idRecurso);
        const roleName = selectedResource ? selectedResource.nomeExibicao : 'Visualizador';

        const { error: signUpError } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            emailRedirectTo: 'https://doc-c3con.vercel.app',
            data: {
              fullName: formData.fullName,
              idRecurso: formData.idRecurso || null,
              roleName: roleName,
              needsPasswordSetup: true
            }
          }
        });

        if (signUpError) throw signUpError;

        setStatusMessage({ 
          type: 'success', 
          text: `Convite enviado! Um e-mail de acesso foi enviado para ${formData.email}.` 
        });
        
        // Mantemos o modal aberto para o usuário ler a mensagem de sucesso
        onSuccess();
      }
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'Erro inesperado ao salvar.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                  <p className="text-xs text-slate-500">Vincule o usuário a um recurso e gerencie suas informações.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl flex items-start gap-3 border shadow-sm",
                    statusMessage.type === 'success' 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-900/20 dark:text-emerald-400" 
                      : "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400"
                  )}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-500" />
                  ) : (
                    <AlertCircle size={20} className="shrink-0 text-red-600 dark:text-red-500" />
                  )}
                  <p className="text-sm font-medium leading-relaxed font-semibold">{statusMessage.text}</p>
                  {statusMessage.type === 'error' && (
                    <button 
                      type="button"
                      onClick={() => setStatusMessage(null)}
                      className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              )}

              {statusMessage?.type === 'success' && !editingUser ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">E-mail de Convite Enviado</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        O usuário agora consta na base e deve verificar a caixa de entrada para ativar sua conta.
                      </p>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-8">
                  {/* Avatar Preview */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative flex flex-col items-center gap-2">
                      <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-zinc-800 border-4 border-indigo-600/10 flex items-center justify-center overflow-hidden relative group">
                        {formData.profileUrl ? (
                          <img src={formData.profileUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle size={64} className="text-slate-300" />
                        )}
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all cursor-not-allowed opacity-50 translate-y-1/2 translate-x-1/2"
                          title="Foto extraída do perfil individual"
                        >
                          <Camera size={18} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold text-center mt-2">Foto Sync (Automatizada)</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                        placeholder="Ex: João Silva"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">E-mail de Acesso</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          required={!editingUser}
                          disabled={!!editingUser}
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none",
                            editingUser && "opacity-60 cursor-not-allowed"
                          )}
                          placeholder="exemplo@email.com"
                        />
                      </div>
                      {!editingUser && <p className="text-[10px] text-amber-600 font-bold mt-1">Um e-mail de acesso será enviado para este endereço.</p>}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Recurso Vinculado</label>
                      <select
                        required
                        value={formData.idRecurso}
                        onChange={(e) => setFormData({ ...formData, idRecurso: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                      >
                        <option value="">Selecione um recurso...</option>
                        {dbResources.map(r => (
                          <option key={r.id} value={r.id}>{r.nomeExibicao}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                      onClose();
                      if (statusMessage?.type === 'success') onSuccess();
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {statusMessage?.type === 'success' ? 'Fechar' : 'Cancelar'}
                </button>
                {statusMessage?.type !== 'success' && (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingUser ? 'Salvar Alterações' : 'Confirmar Vínculo'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
