import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 bg-blue-600/10 rounded-lg text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">ERP PMBOK</h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-sm font-semibold">
              Erro 404
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Ops! Página não encontrada
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
                Parece que a página que você está procurando não existe ou foi movida. Verifique o URL ou retorne ao painel principal do projeto.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                <Home size={20} className="mr-2" />
                Voltar ao Início
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative z-10 w-full max-w-[450px] aspect-square bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
              <div className="relative mb-8">
                <Search size={160} className="text-blue-600/20 absolute -top-12 -left-12 rotate-12" />
                <div className="relative bg-blue-600/5 p-12 rounded-full border-4 border-dashed border-blue-600/20 flex items-center justify-center">
                  <div className="bg-blue-600 text-white size-24 rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
                    <AlertTriangle size={48} />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-6xl font-black text-blue-600 opacity-20 italic">404</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-500 text-sm">
        <p>© 2024 ERP PMBOK Edition. Gestão profissional de projetos.</p>
      </footer>
    </div>
  );
};
