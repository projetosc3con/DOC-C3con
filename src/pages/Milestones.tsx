import React from 'react';
import { Header } from '../components/layout/Header';
import { milestones } from '../constants';
import { MoreHorizontal, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const MilestonesPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Linha do Tempo e Marcos" 
        subtitle="Projeto: Implementação ERP Corporativo - Fase 2" 
      />
      
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Project Progress Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">Progresso Geral</h3>
              <span className="text-xl sm:text-2xl font-black text-indigo-600">68%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 sm:h-3 mb-4">
              <div className="bg-indigo-600 h-2.5 sm:h-3 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">8 de 12 marcos críticos concluídos de acordo com o plano PMBOK.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">Marcos Pendentes</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50">04</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-amber-500 font-medium">
              <AlertCircle size={14} />
              2 próximos do vencimento
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">Status do Prazo</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-500">No Prazo</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
              Última atualização: Hoje, 09:45
            </div>
          </div>
        </div>

        {/* Milestones Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-sm sm:text-base">Lista de Marcos Principais</h3>
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <button className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 transition-colors whitespace-nowrap">Todos</button>
              <button className="text-[10px] sm:text-xs font-medium px-3 py-1 text-slate-500 hover:bg-slate-100 transition-colors whitespace-nowrap">Pendentes</button>
              <button className="text-[10px] sm:text-xs font-medium px-3 py-1 text-slate-500 hover:bg-slate-100 transition-colors whitespace-nowrap">Concluídos</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Marco / Entrega</th>
                  <th className="px-6 py-4 font-semibold">Data Prevista</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Responsável</th>
                  <th className="px-6 py-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {milestones.map((milestone) => (
                  <tr key={milestone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          milestone.status === 'CONCLUÍDO' ? "bg-emerald-500" : 
                          milestone.status === 'EM ANDAMENTO' ? "bg-indigo-500 animate-pulse" :
                          milestone.status === 'ATRASO CRÍTICO' ? "bg-amber-500" : "bg-slate-300"
                        )}></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{milestone.name}</p>
                          <p className="text-xs text-slate-400">{milestone.phase}</p>
                        </div>
                      </div>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm",
                      milestone.status === 'ATRASO CRÍTICO' ? "text-red-500 font-bold" : "text-slate-600 dark:text-slate-400"
                    )}>
                      {milestone.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold uppercase rounded",
                        milestone.status === 'CONCLUÍDO' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        milestone.status === 'EM ANDAMENTO' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" :
                        milestone.status === 'ATRASO CRÍTICO' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {milestone.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={milestone.responsible.avatar} alt="Owner" className="w-6 h-6 rounded-full" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{milestone.responsible.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
