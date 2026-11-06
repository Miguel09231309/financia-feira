import React from 'react';
import { Moon, Sun, Printer } from 'lucide-react';

export type AppTab = 'geral' | 'reports' | 'feirantes' | 'charts';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onPrintReport: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onPrintReport,
  isDark,
  onToggleDark,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('geral')}
          className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none"
        >
          <span>Feira da Lua</span>
          <span className="text-emerald-500 font-bold">·</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-widest hidden sm:inline">
            Gestão Financeira
          </span>
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-neutral-300">
          <button
            onClick={() => onSelectTab('geral')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentTab === 'geral'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-emerald-500 pb-0.5'
                : ''
            }`}
          >
            Geral
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentTab === 'reports'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-emerald-500 pb-0.5'
                : ''
            }`}
          >
            Cobranças
          </button>

          <button
            onClick={() => onSelectTab('feirantes')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentTab === 'feirantes'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-emerald-500 pb-0.5'
                : ''
            }`}
          >
            Feirantes
          </button>

          <button
            onClick={() => onSelectTab('charts')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentTab === 'charts'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-emerald-500 pb-0.5'
                : ''
            }`}
          >
            Gráficos & Custos
          </button>
        </nav>

        {/* Zone 3: Theme toggle (Fundo Preto) + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleDark}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title={isDark ? 'Mudar para Fundo Claro' : 'Mudar para Fundo Preto'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isDark ? 'Fundo Claro' : 'Fundo Preto'}</span>
          </button>

          <button
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-neutral-800 text-xs font-medium gap-4">
        <button
          onClick={() => onSelectTab('geral')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'geral' ? 'text-emerald-500 font-bold' : 'text-slate-600 dark:text-neutral-400'}`}
        >
          Geral
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'reports' ? 'text-emerald-500 font-bold' : 'text-slate-600 dark:text-neutral-400'}`}
        >
          Cobranças
        </button>
        <button
          onClick={() => onSelectTab('feirantes')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'feirantes' ? 'text-emerald-500 font-bold' : 'text-slate-600 dark:text-neutral-400'}`}
        >
          Feirantes
        </button>
        <button
          onClick={() => onSelectTab('charts')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'charts' ? 'text-emerald-500 font-bold' : 'text-slate-600 dark:text-neutral-400'}`}
        >
          Gráficos & Custos
        </button>
      </div>
    </header>
  );
};
