import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const ProfilePage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const initialName = user.user_metadata?.fullName || user.email?.split('@')[0] || 'U';
      setName(initialName);
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(initialName)}&background=6366f1&color=fff`);
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-photos/${user.id}/${fileName}`;

      // 1. Fazer upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualizar metadados do usuário no Auth
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatarUrl: publicUrl }
      });

      if (authUpdateError) throw authUpdateError;

      // 4. Atualizar a URL na tabela pública Usuarios
      const { error: dbUpdateError } = await supabase
        .from('Usuarios')
        .update({ profileUrl: publicUrl })
        .eq('uuid', user.id);

      if (dbUpdateError) throw dbUpdateError;

      // 5. Atualizar fotoUser em todos os comentários deste usuário
      const { error: comentariosError } = await supabase
        .from('Comentarios')
        .update({ fotoUser: publicUrl })
        .eq('emailUser', user.email);

      if (comentariosError) throw comentariosError;

      setAvatarUrl(publicUrl);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      setError(null);

      // 1. Atualizar a tabela pública Usuarios
      // O trigger no banco de dados irá sincronizar automaticamente com o auth.users metadata
      const { error: dbError } = await supabase
        .from('Usuarios')
        .update({ fullName: name })
        .eq('uuid', user.id);

      if (dbError) throw dbError;

      // 2. Atualizar o metadado do Auth explicitamente para garantir que o hook useAuth reflita a mudança imediatamente
      const { error: authError } = await supabase.auth.updateUser({
        data: { fullName: name }
      });

      if (authError) throw authError;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem ou estão vazias.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar a senha.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Meu Perfil" subtitle="Gerencie suas informações pessoais e configurações de segurança." />

      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showSuccess ? 1 : 0, y: showSuccess ? 0 : -20 }}
          className="fixed top-24 right-8 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-none"
        >
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Perfil atualizado com sucesso!</span>
        </motion.div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Avatar and Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="relative inline-block mb-4 group">
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className={`w-full h-full rounded-full border-4 border-indigo-600/10 object-cover transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                  title="Trocar Foto"
                >
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 truncate">{name}</h3>
              <p className="text-sm text-indigo-600 font-medium truncate">{user?.user_metadata?.roleName}</p>
              <p className="text-xs text-slate-500 mt-1">ID: {user?.id.substring(0, 8)}...</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Estatísticas</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Projetos Ativos</span>
                  <span className="text-sm font-bold">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Tarefas Concluídas</span>
                  <span className="text-sm font-bold">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Forms */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Informações Pessoais
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome de Exibição</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-slate-500 max-w-xs text-center sm:text-left">
                    Suas informações são armazenadas de forma segura e usadas para identificação nos projetos.
                  </p>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Lock size={20} className="text-indigo-600" />
                Segurança e Senha
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Senha alterada com sucesso!
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                      placeholder="Min. 6 caracteres"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                      placeholder="Repita a nova senha"
                      required
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock size={16} />}
                    {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
