import React from 'react';
import { Header } from '../components/layout/Header';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const ReportsPage = () => {
  const reportTypes = [
    {
      id: 'perf',
      title: 'Desempenho de Projetos',
      description: 'Análise detalhada de KPIs, progresso e saúde de todos os projetos ativos.',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      urlDownload: 'https://xjtvfsbjgdcnhulrebkw.supabase.co/storage/v1/object/public/assets/standards/Desempenho%20de%20projetos.xlsm'
    },
    {
      id: 'fin',
      title: 'Relatório Financeiro',
      description: 'Acompanhamento de orçamentos, custos reais e variações financeiras por departamento.',
      icon: DollarSign,
      color: 'bg-emerald-500',
      urlDownload: ''
    },
    {
      id: 'res',
      title: 'Alocação de Recursos',
      description: 'Visão geral da ocupação da equipe, gargalos e disponibilidade de equipamentos.',
      icon: Users,
      color: 'bg-purple-500',
      urlDownload: ''
    },
    {
      id: 'cron',
      title: 'Status de Cronograma',
      description: 'Monitoramento de marcos, caminhos críticos e atrasos previstos.',
      icon: Calendar,
      color: 'bg-amber-500',
      urlDownload: ''
    },
    {
      id: 'qual',
      title: 'Qualidade e Riscos',
      description: 'Matriz de riscos, planos de mitigação e indicadores de qualidade PMBOK.',
      icon: PieChart,
      color: 'bg-red-500',
      urlDownload: ''
    },
    {
      id: 'exec',
      title: 'Sumário Executivo',
      description: 'Visão consolidada de alto nível para diretoria e stakeholders.',
      icon: FileText,
      color: 'bg-slate-700',
      urlDownload: ''
    }
  ];

  const handleDownload = (url: string) => {
    if (!url) return;
    
    // Para forçar o download em vez de abrir no navegador (especialmente no Edge/Chrome com arquivos Office)
    // O Supabase Storage aceita o parâmetro ?download para definir o header Content-Disposition: attachment
    const downloadUrl = url.includes('?') ? `${url}&download=` : `${url}?download=`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', ''); // Reforça a intenção de download
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Relatórios e BI" subtitle="Gere relatórios detalhados e insights baseados em dados para tomada de decisão." />

      <div className="p-4 sm:p-8 space-y-8">

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={report.urlDownload ? { y: -5 } : {}}
              className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all overflow-hidden ${report.urlDownload
                ? 'hover:shadow-xl hover:shadow-indigo-600/5 group cursor-pointer'
                : 'opacity-75 cursor-default'
                }`}
              onClick={() => report.urlDownload && handleDownload(report.urlDownload)}
            >
              <div className="p-6">
                <div className={`${report.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                  <report.icon size={24} />
                </div>

                <h3 className={`text-lg font-bold transition-colors ${report.urlDownload ? 'text-slate-900 dark:text-slate-50 group-hover:text-indigo-600' : 'text-slate-400 dark:text-slate-600'
                  }`}>
                  {report.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 dark:text-slate-700">
                    {report.urlDownload ? 'Disponível para Download' : 'Aguardando Dados'}
                  </span>
                  <button
                    disabled={!report.urlDownload}
                    className={`flex items-center gap-2 font-bold text-sm transition-all ${report.urlDownload
                      ? 'text-indigo-600 hover:translate-x-1'
                      : 'text-slate-200 dark:text-slate-800 cursor-not-allowed'
                      }`}
                  >
                    Gerar
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Export Section */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl shadow-indigo-600/20">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold mb-2">Exportação em Lote</h2>
            <p className="text-indigo-100 max-w-md">
              Selecione múltiplos relatórios para gerar um pacote consolidado em PDF ou Excel para apresentações mensais.
            </p>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-lg">
            <Download size={20} />
            Exportar Todos
          </button>
        </div>
      </div>
    </div>
  );
};
