import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import loginCoverImg from '../assets/login_cover.png';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se já está autenticado, redireciona direto para o dashboard
  // exceto se estivermos na landing page (raiz), onde queremos que o usuário escolha entrar
  if (!loading && session && window.location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      setIsSubmitting(false);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-6 py-4 bg-white dark:bg-zinc-900">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase leading-tight">Doc</h2>
            <p className="text-[10px] font-medium text-indigo-600 tracking-tighter">Project Management</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Gerenciamento Profissional de Projetos</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-16">
            <div className="mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bem-vindo de volta</h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Acesse sua conta para gerenciar seus projetos e equipes.</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <div className="flex justify-between items-center h-5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100 text-sm sm:text-base"
                    placeholder="nome@empresa.com.br"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center h-5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Senha</label>
                  <a href="#" className="text-xs font-semibold text-indigo-600 hover:underline">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-indigo-600 bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 rounded focus:ring-indigo-600 focus:ring-offset-white dark:focus:ring-offset-zinc-900 transition-colors cursor-pointer" 
                  id="remember" 
                />
                <label htmlFor="remember" className="ml-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors">
                  Lembrar-me neste dispositivo
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar</span>
                    <LogIn size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="hidden lg:block relative bg-slate-50 dark:bg-zinc-800">
            <div className="absolute inset-0 bg-indigo-600/5 opacity-50"></div>
            <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 overflow-hidden shadow-2xl relative">
                <img
                  src={loginCoverImg}
                  alt="Gerenciamento de Projetos"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
              <div className="mt-12 space-y-4 max-w-md">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gerenciamento Baseado no PMBOK</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Controle escopo, cronograma, custos e riscos em uma única plataforma integrada para alta performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-600 uppercase tracking-widest">
        © 2026 Doc Project Management - Todos os direitos reservados.
      </footer>
    </div>
  );
};
