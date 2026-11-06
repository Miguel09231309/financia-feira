import React, { useState } from 'react';
import { CategoryBudget, Transaction } from '../types/finance';
import { formatCurrency } from '../services/pdfReportGenerator';
import { AlertTriangle, Plus, CheckCircle2, ShieldAlert, Sparkles, Pencil, Trash2 } from 'lucide-react';

interface BudgetManagerProps {
  budgets: CategoryBudget[];
  transactions: Transaction[];
  selectedMonth: string;
  onUpdateBudgets: (newBudgets: CategoryBudget[]) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  selectedMonth,
  onUpdateBudgets,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formLimit, setFormLimit] = useState('');
  const [formColor, setFormColor] = useState('#10B981');

  // Filter current month transactions
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Compute spend per category
  const categorySpend: { [key: string]: number } = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    });

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (categorySpend[b.category] || 0), 0);
  const overallPct = totalBudgeted > 0 ? (totalSpentInBudgets / totalBudgeted) * 100 : 0;

  // Day of the month calculation for remaining daily budget advice
  const todayDay = 3; // Context date is 2026-11-03
  const daysInMonth = 30;
  const remainingDays = Math.max(1, daysInMonth - todayDay);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setFormCategory('');
    setFormLimit('');
    setFormColor('#10B981');
    setIsEditing(true);
  };

  const handleOpenEdit = (b: CategoryBudget) => {
    setEditingCategory(b.category);
    setFormCategory(b.category);
    setFormLimit(b.monthlyLimit.toString());
    setFormColor(b.color);
    setIsEditing(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(formLimit);
    if (!formCategory.trim() || isNaN(limit) || limit <= 0) return;

    if (editingCategory) {
      // Update existing
      const updated = budgets.map(b => 
        b.category === editingCategory 
          ? { ...b, category: formCategory.trim(), monthlyLimit: limit, color: formColor }
          : b
      );
      onUpdateBudgets(updated);
    } else {
      // Add new
      const exists = budgets.find(b => b.category.toLowerCase() === formCategory.trim().toLowerCase());
      if (exists) {
        alert('Já existe um orçamento para esta categoria.');
        return;
      }
      const newBudget: CategoryBudget = {
        category: formCategory.trim(),
        monthlyLimit: limit,
        color: formColor,
        iconName: 'Package',
      };
      onUpdateBudgets([...budgets, newBudget]);
    }

    setIsEditing(false);
  };

  const handleDeleteBudget = (cat: string) => {
    if (confirm(`Deseja remover o teto de gastos para a categoria "${cat}"?`)) {
      onUpdateBudgets(budgets.filter(b => b.category !== cat));
    }
  };

  // Color picker presets
  const colorPresets = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1'];

  return (
    <div className="space-y-6">
      {/* Header & Overall Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Orçamentos & Metas de Gastos Mensais
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Defina tetos de despesas personalizados para manter o controle total do seu patrimônio
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Teto por Categoria
            </button>
          </div>
        </div>

        {/* Global Budget Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-2 font-medium">
            <span className="text-slate-700 dark:text-slate-300">
              Consumo Global do Orçamento ({selectedMonth})
            </span>
            <span className="font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalSpentInBudgets)} / {formatCurrency(totalBudgeted)} ({overallPct.toFixed(1)}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, overallPct)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                overallPct > 100 ? 'bg-rose-600' : overallPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            ></div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Saldo total disponível para gastar: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(Math.max(0, totalBudgeted - totalSpentInBudgets))}</strong></span>
            <span>{remainingDays} dias restantes no mês</span>
          </div>
        </div>
      </div>

      {/* Grid of Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(b => {
          const spent = categorySpend[b.category] || 0;
          const limit = b.monthlyLimit;
          const remaining = limit - spent;
          const pct = limit > 0 ? (spent / limit) * 100 : 0;
          const isOver = pct > 100;
          const isWarning = pct >= 80 && pct <= 100;

          // Safe daily spend remaining
          const dailySafe = remaining > 0 ? remaining / remainingDays : 0;

          return (
            <div
              key={b.category}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.color }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {b.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                      title="Editar teto"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b.category)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remover orçamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Values */}
                <div className="space-y-1 my-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Gasto:</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-500">
                    <span>Teto Mensal:</span>
                    <span className="font-mono">{formatCurrency(limit)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Saldo Restante:</span>
                    <span className={`font-mono font-semibold ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {remaining < 0 ? `- ${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-2">
                  <div
                    style={{ width: `${Math.min(100, pct)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{pct.toFixed(1)}% utilizado</span>
                  <span>{limit > 0 ? (100 - pct > 0 ? (100 - pct).toFixed(0) : '0') : '0'}% livre</span>
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {isOver ? (
                  <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Estourou {formatCurrency(Math.abs(remaining))}!</span>
                  </div>
                ) : isWarning ? (
                  <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Atenção: limite próximo</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dentro da meta</span>
                  </div>
                )}

                {remaining > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    max {formatCurrency(dailySafe)}/dia
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {editingCategory ? 'Editar Teto de Gastos' : 'Novo Teto de Gastos por Categoria'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina o valor máximo que você planeja gastar por mês nesta categoria.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alimentação, Transporte, Feira..."
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Teto Mensal Limite (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0,00"
                  value={formLimit}
                  onChange={e => setFormLimit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2">
                  {colorPresets.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        formColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
