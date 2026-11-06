import React, { useState } from 'react';
import { Transaction, CategoryBudget } from '../types/finance';
import { formatCurrency, formatDateBR, pdfReportGenerator } from '../services/pdfReportGenerator';
import { Search, Filter, Download, Printer, Plus, CheckCircle2, Clock, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  externalCategoryFilter?: string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  budgets,
  selectedMonth,
  onSelectMonth,
  onOpenNewTransaction,
  onDeleteTransaction,
  onToggleStatus,
  externalCategoryFilter,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(externalCategoryFilter || 'all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Sync external category filter if passed
  React.useEffect(() => {
    if (externalCategoryFilter) {
      setCategoryFilter(externalCategoryFilter);
    }
  }, [externalCategoryFilter]);

  // Extract all categories in transactions
  const allCategories = Array.from(new Set(transactions.map(t => t.category)));

  // Filter pipeline
  const filtered = transactions.filter(t => {
    if (selectedMonth && !t.date.startsWith(selectedMonth)) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate totals for filtered
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netFiltered = totalIncome - totalExpense;

  // Print monthly PDF
  const handlePrintPDF = () => {
    const monthTxs = transactions.filter(t => t.date.startsWith(selectedMonth));
    const mIncome = monthTxs.filter(t => t.type === 'income' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const mExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const categoryTotals: { [key: string]: number } = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    pdfReportGenerator.openMonthlyReportPrint({
      monthYear: selectedMonth,
      totalIncome: mIncome,
      totalExpense: mExpense,
      netSavings: mIncome - mExpense,
      savingsRate: mIncome > 0 ? Math.max(0, ((mIncome - mExpense) / mIncome) * 100) : 0,
      transactions: monthTxs,
      budgets,
      categoryTotals,
    });
  };

  const handleExportCSV = () => {
    pdfReportGenerator.exportTransactionsCSV(filtered);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table Header and Action Strip */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Lançamentos & Movimentações Financeiras
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filtre por categorias, métodos de pagamento e exporte relatórios em PDF formatados
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              Exportar Relatório PDF
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Lançamento
            </button>
          </div>
        </div>

        {/* Filters Controls Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Month */}
          <div>
            <select
              value={selectedMonth}
              onChange={e => onSelectMonth(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="2026-11">Novembro / 2026 (Atual)</option>
              <option value="2026-10">Outubro / 2026</option>
              <option value="2026-09">Setembro / 2026</option>
              <option value="">Todos os Meses</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas as Categorias</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="income">Apenas Receitas (+)</option>
              <option value="expense">Apenas Despesas (-)</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas as Formas Pgto</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="boleto">Boleto Bancário</option>
              <option value="transferencia">Transferência TED</option>
            </select>
          </div>
        </div>

        {/* Filtered Quick Totals Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-800/80">
          <div>
            Exibindo <strong>{filtered.length}</strong> de {transactions.length} movimentações
            {categoryFilter !== 'all' && <span className="ml-2 text-emerald-600 font-medium">· Filtro: {categoryFilter}</span>}
          </div>

          <div className="flex items-center gap-4 font-mono font-medium">
            <span className="text-emerald-600">+ {formatCurrency(totalIncome)}</span>
            <span className="text-rose-600">- {formatCurrency(totalExpense)}</span>
            <span className="text-slate-900 dark:text-white font-bold">Líquido: {formatCurrency(netFiltered)}</span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Descrição</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Forma de Pgto</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateBR(t.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {t.description}
                    </div>
                    {t.notes && (
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                        {t.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {t.category}
                  </td>
                  <td className="py-3 px-4 font-mono uppercase text-slate-500 whitespace-nowrap">
                    {t.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(t.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        t.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100'
                      }`}
                    >
                      {t.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Concluído
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendente
                        </>
                      )}
                    </button>
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
