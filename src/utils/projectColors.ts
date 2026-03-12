
export const PHASE_COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
];

export const PHASE_DOT_COLORS = [
  "bg-indigo-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-slate-500"
];

/**
 * Retorna as classes de estilo para uma fase de projeto com base em sua posição na lista de fases.
 * @param fase Nome da fase
 * @param phasesList Lista completa de fases para determinar o índice
 * @returns Objeto com as classes para o wrapper e para o ponto (dot)
 */
export const getPhaseStyles = (fase: string, phasesList: string[]) => {
  const index = phasesList.indexOf(fase);
  const safeIndex = index === -1 ? PHASE_COLORS.length - 1 : index % PHASE_COLORS.length;
  return {
    wrapper: PHASE_COLORS[safeIndex],
    dot: PHASE_DOT_COLORS[safeIndex]
  };
};
