import React from 'react';
import { FeiraEdition, FeiraParticipation, FeiraOrgExpense } from '../types/finance';
import { formatCurrency } from '../services/pdfReportGenerator';
import { BarChart3, PieChart } from 'lucide-react';

interface FeiraChartsProps {
  editions: FeiraEdition[];
  participations: FeiraParticipation[];
  orgExpenses: FeiraOrgExpense[];
}

const EXPENSE_LABELS: Record<FeiraOrgExpense['category'], { label: string; color: string }> = {
  coordenacao: { label: 'Coordenação & Equipe', color: '#8B5CF6' },
  seguranca: { label: 'Segurança & Apoio', color: '#EC4899' },
  som: { label: 'Som & Música ao Vivo', color: '#3B82F6' },
  banheiro: { label: 'Banheiro Químico', color: '#F59E0B' },
  energia: { label: 'Energia & Gerador', color: '#10B981' },
  extras: { label: 'Extras / Manutenção', color: '#64748B' },
};

export const FeiraCharts: React.FC<FeiraChartsProps> = ({
  editions,
  participations,
  orgExpenses,
}) => {
  // Ordered chronologically (oldest -> newest) for bar chart
  const chronologicalEditions = [...editions]
    .filter(e => e.status === 'realizada')
    .sort((a, b) => a.date.localeCompare(b.date));

  const editionStats = chronologicalEditions.map(ed => {
    const rec = participations
      .filter(p => p.editionId === ed.id && (p.status === 'pago_pix' || p.status === 'pago_dinheiro'))
      .reduce((s, p) => s + p.amount, 0);
    const exp = orgExpenses
      .filter(e => e.editionId === ed.id)
      .reduce((s, e) => s + e.amount, 0);
    return {
      id: ed.id,
      label: ed.label.slice(0, 5),
      fullLabel: ed.label,
      received: rec,
      expenses: exp,
      net: rec - exp,
    };
  });

  const maxBarValue = Math.max(...editionStats.map(s => Math.max(s.received, s.expenses)), 500);

  // Category totals for expenses
  const categoryTotals: Record<string, number> = {};
  let totalExpensesAll = 0;
  orgExpenses.forEach(e => {
    const ed = editions.find(item => item.id === e.editionId);
    if (!ed || ed.status === 'cancelada') return;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    totalExpensesAll += e.amount;
  });

  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Bar Chart: Receitas vs Despesas por Edição */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Recebimentos vs. Pagamentos por Edição da Feira
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Comparativo de entradas (PIX + Dinheiro) e custos operacionais em cada data realizada
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-neutral-300">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span> Recebido
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span> Pago (Custos)
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2 border-b border-slate-100 dark:border-neutral-800">
          {editionStats.map(item => {
            const recH = (item.received / maxBarValue) * 100;
            const expH = (item.expenses / maxBarValue) * 100;

            return (
              <div key={item.id} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-900 dark:bg-black border border-slate-700 text-white text-[11px] py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap font-mono">
                  <div className="font-bold text-emerald-400">{item.fullLabel}</div>
                  <div>Recebido: {formatCurrency(item.received)}</div>
                  <div>Pago: {formatCurrency(item.expenses)}</div>
                  <div>Saldo: {formatCurrency(item.net)}</div>
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-48">
                  <div
                    style={{ height: `${Math.max(4, recH)}%` }}
                    className="w-1/2 max-w-[24px] bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all"
                  />
                  <div
                    style={{ height: `${Math.max(4, expH)}%` }}
                    className="w-1/2 max-w-[24px] bg-rose-500 hover:bg-rose-400 rounded-t-sm transition-all"
                  />
                </div>

                <span className="mt-2.5 text-[11px] font-mono text-slate-600 dark:text-neutral-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Breakdown by Category */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100 dark:border-neutral-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            Distribuição de Custos & Pagamentos da Feira
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Total acumulado por categoria de despesa operacional ({formatCurrency(totalExpensesAll)})
          </p>
        </div>

        <div className="mt-5 space-y-3.5">
          {categoryEntries.map(([cat, amount]) => {
            const meta = EXPENSE_LABELS[cat as FeiraOrgExpense['category']] || { label: cat, color: '#64748B' };
            const pct = totalExpensesAll > 0 ? (amount / totalExpensesAll) * 100 : 0;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-neutral-200">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span>{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-500 dark:text-neutral-400">{pct.toFixed(1)}%</span>
                    <span className="font-bold text-slate-900 dark:text-white w-28 text-right">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
