import React from 'react';
import { motion } from 'motion/react';
import { FileText, Target, Zap, AlertCircle } from 'lucide-react';

interface ProjectInfoProps {
    description: string;
    objective: string;
    scope: string;
    justification: string;
}

export const ProjectInfo = ({ description, objective, scope, justification }: ProjectInfoProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 md:col-span-2">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <FileText size={16} className="text-indigo-600" />
                        Descrição do Projeto
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                        {description || "Nenhuma descrição detalhada fornecida."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <Target size={18} className="text-indigo-600" />
                        Objetivo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {objective || "Objetivo não definido."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <Zap size={18} className="text-indigo-600" />
                        Escopo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {scope || "Escopo não detalhado."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
                        <AlertCircle size={18} className="text-indigo-600" />
                        Justificativa
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {justification || "Justificativa não informada."}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
