import React, { useState } from 'react';
import {
  Feirante,
  FeiraEdition,
  FeiraParticipation,
  FeiraOrgExpense,
  FeiraCellStatus,
  FeiraExpenseCategoryItem,
} from '../types/finance';
import { formatCurrency, formatDateBR, pdfReportGenerator } from '../services/pdfReportGenerator';
import {
  Printer,
  Plus,
  AlertCircle,
  Users,
  FileSpreadsheet,
  MessageCircle,
  Check,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';

interface FeiraManagementProps {
  activeSubTab: 'geral' | 'reports' | 'feirantes';
  onChangeSubTab: (tab: 'geral' | 'reports' | 'feirantes') => void;
  feirantes: Feirante[];
  editions: FeiraEdition[];
  participations: FeiraParticipation[];
  orgExpenses: FeiraOrgExpense[];
  expenseCategories: FeiraExpenseCategoryItem[];
  onUpdateFeirantes: (data: Feirante[]) => void;
  onUpdateEditions: (data: FeiraEdition[]) => void;
  onUpdateParticipations: (data: FeiraParticipation[]) => void;
  onUpdateOrgExpenses: (data: FeiraOrgExpense[]) => void;
  onUpdateExpenseCategories: (data: FeiraExpenseCategoryItem[]) => void;
}

const COLOR_PALETTE = ['#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4', '#F97316', '#64748B'];

export const FeiraManagement: React.FC<FeiraManagementProps> = ({
  activeSubTab,
  onChangeSubTab,
  feirantes,
  editions,
  participations,
  orgExpenses,
  expenseCategories,
  onUpdateFeirantes,
  onUpdateEditions,
  onUpdateParticipations,
  onUpdateOrgExpenses,
  onUpdateExpenseCategories,
}) => {
  // Cell editor modal state
  const [editingCell, setEditingCell] = useState<{
    edition: FeiraEdition;
    feirante: Feirante;
    participation?: FeiraParticipation;
  } | null>(null);
  const [cellStatus, setCellStatus] = useState<FeiraCellStatus>('pago_pix');
  const [cellAmount, setCellAmount] = useState('55');
  const [cellNote, setCellNote] = useState('');

  // Expense cell editor modal state
  const [editingExpenseCell, setEditingExpenseCell] = useState<{
    edition: FeiraEdition;
    cat: string;
    label: string;
    existing?: FeiraOrgExpense;
  } | null>(null);
  const [expAmount, setExpAmount] = useState('0');
  const [expMethod, setExpMethod] = useState<'pix' | 'dinheiro'>('pix');

  // Inline editing in Geral table: Feirante name, Edition date, Cost row label
  const [editingFrRowId, setEditingFrRowId] = useState<string | null>(null);
  const [inlineFrName, setInlineFrName] = useState('');

  const [editingEdColId, setEditingEdColId] = useState<string | null>(null);
  const [inlineEdDate, setInlineEdDate] = useState('');

  const [editingCostRowId, setEditingCostRowId] = useState<string | null>(null);
  const [inlineCostLabel, setInlineCostLabel] = useState('');

  // New Cost Row modal
  const [showNewCostModal, setShowNewCostModal] = useState(false);
  const [newCostLabel, setNewCostLabel] = useState('');

  // New Edition modal state
  const [showNewEditionModal, setShowNewEditionModal] = useState(false);
  const [newEditionDate, setNewEditionDate] = useState('2026-10-22');

  // New / Edit Feirante modal state
  const [showFeiranteModal, setShowFeiranteModal] = useState(false);
  const [editingFeirante, setEditingFeirante] = useState<Feirante | null>(null);
  const [frName, setFrName] = useState('');
  const [frStallType, setFrStallType] = useState('');
  const [frPhone, setFrPhone] = useState('');
  const [frFee, setFrFee] = useState('55');

  // Inline phone edit for pending list
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [inlinePhoneVal, setInlinePhoneVal] = useState('');

  // --- Computed Metrics across all editions ---
  const realizedEditions = editions.filter(e => e.status === 'realizada');

  let totalReceivedPix = 0;
  let totalReceivedCash = 0;
  let totalPending = 0;

  participations.forEach(p => {
    const ed = editions.find(e => e.id === p.editionId);
    if (!ed || ed.status === 'cancelada') return;
    if (p.status === 'pago_pix') totalReceivedPix += p.amount;
    else if (p.status === 'pago_dinheiro') totalReceivedCash += p.amount;
    else if (p.status === 'pendente') totalPending += p.amount;
  });

  let totalPaidPix = 0;
  let totalPaidCash = 0;

  orgExpenses.forEach(exp => {
    const ed = editions.find(e => e.id === exp.editionId);
    if (!ed || ed.status === 'cancelada') return;
    if (exp.paymentMethod === 'pix') totalPaidPix += exp.amount;
    else totalPaidCash += exp.amount;
  });

  const netPix = totalReceivedPix - totalPaidPix;
  const netCash = totalReceivedCash - totalPaidCash;
  const netTotal = netPix + netCash;

  // Pending items list pulled directly from Geral (status === 'pendente') + Feirantes
  const pendingItems = participations
    .filter(p => {
      const ed = editions.find(e => e.id === p.editionId);
      return ed && ed.status !== 'cancelada' && p.status === 'pendente' && p.amount > 0;
    })
    .map(p => {
      const ed = editions.find(e => e.id === p.editionId)!;
      const fr = feirantes.find(f => f.id === p.feiranteId);
      return {
        participation: p,
        edition: ed,
        feirante: fr || { id: p.feiranteId, name: 'Feirante', stallType: '', phone: '', defaultFee: p.amount, active: true },
      };
    })
    .sort((a, b) => b.edition.date.localeCompare(a.edition.date));

  // --- Handlers ---
  const openCellEditor = (edition: FeiraEdition, feirante: Feirante) => {
    if (edition.status === 'cancelada') return;
    const existing = participations.find(p => p.editionId === edition.id && p.feiranteId === feirante.id);
    setEditingCell({ edition, feirante, participation: existing });
    setCellStatus(existing?.status || 'pago_pix');
    setCellAmount(existing ? existing.amount.toString() : feirante.defaultFee.toString());
    setCellNote(existing?.note || '');
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;
    const amt = cellStatus === 'atestado' || cellStatus === 'ausente' ? 0 : parseFloat(cellAmount) || 0;

    const existingIdx = participations.findIndex(
      p => p.editionId === editingCell.edition.id && p.feiranteId === editingCell.feirante.id
    );

    if (existingIdx >= 0) {
      const updated = [...participations];
      updated[existingIdx] = {
        ...updated[existingIdx],
        status: cellStatus,
        amount: amt,
        note: cellNote.trim() || undefined,
      };
      onUpdateParticipations(updated);
    } else {
      const newPart: FeiraParticipation = {
        id: `part-${editingCell.edition.id}-${editingCell.feirante.id}`,
        editionId: editingCell.edition.id,
        feiranteId: editingCell.feirante.id,
        status: cellStatus,
        amount: amt,
        note: cellNote.trim() || undefined,
      };
      onUpdateParticipations([...participations, newPart]);
    }
    setEditingCell(null);
  };

  const handleDeleteCell = () => {
    if (!editingCell) return;
    const updated = participations.filter(
      p => !(p.editionId === editingCell.edition.id && p.feiranteId === editingCell.feirante.id)
    );
    onUpdateParticipations(updated);
    setEditingCell(null);
  };

  const openExpenseEditor = (edition: FeiraEdition, cat: string, label: string) => {
    if (edition.status === 'cancelada') return;
    const existing = orgExpenses.find(e => e.editionId === edition.id && e.category === cat);
    setEditingExpenseCell({ edition, cat, label, existing });
    setExpAmount(existing ? existing.amount.toString() : '0');
    setExpMethod(existing?.paymentMethod || 'pix');
  };

  const handleSaveExpenseCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpenseCell) return;
    const amt = parseFloat(expAmount) || 0;

    const existingIdx = orgExpenses.findIndex(
      ex => ex.editionId === editingExpenseCell.edition.id && ex.category === editingExpenseCell.cat
    );

    if (existingIdx >= 0) {
      const updated = [...orgExpenses];
      updated[existingIdx] = {
        ...updated[existingIdx],
        amount: amt,
        paymentMethod: expMethod,
      };
      onUpdateOrgExpenses(updated);
    } else {
      const newExp: FeiraOrgExpense = {
        id: `orgexp-${editingExpenseCell.edition.id}-${editingExpenseCell.cat}-${Date.now()}`,
        editionId: editingExpenseCell.edition.id,
        description: editingExpenseCell.label,
        category: editingExpenseCell.cat,
        amount: amt,
        paymentMethod: expMethod,
      };
      onUpdateOrgExpenses([...orgExpenses, newExp]);
    }
    setEditingExpenseCell(null);
  };

  const handleDeleteExpenseCell = () => {
    if (!editingExpenseCell) return;
    const updated = orgExpenses.filter(
      ex => !(ex.editionId === editingExpenseCell.edition.id && ex.category === editingExpenseCell.cat)
    );
    onUpdateOrgExpenses(updated);
    setEditingExpenseCell(null);
  };

  // Inline save for Feirante name in Geral table
  const handleSaveInlineFrName = (frId: string) => {
    if (inlineFrName.trim()) {
      onUpdateFeirantes(
        feirantes.map(f => (f.id === frId ? { ...f, name: inlineFrName.trim() } : f))
      );
    }
    setEditingFrRowId(null);
  };

  // Inline save for Edition date in Geral table
  const handleSaveInlineEdDate = (edId: string) => {
    if (inlineEdDate) {
      const newLabel = formatDateBR(inlineEdDate);
      onUpdateEditions(
        editions.map(ed => (ed.id === edId ? { ...ed, date: inlineEdDate, label: newLabel } : ed))
      );
    }
    setEditingEdColId(null);
  };

  // Inline save for Cost category label in Geral table
  const handleSaveInlineCostLabel = (catId: string) => {
    if (inlineCostLabel.trim()) {
      const trimmed = inlineCostLabel.trim();
      onUpdateExpenseCategories(
        expenseCategories.map(c => (c.id === catId ? { ...c, label: trimmed } : c))
      );
      onUpdateOrgExpenses(
        orgExpenses.map(ex => (ex.category === catId ? { ...ex, description: trimmed } : ex))
      );
    }
    setEditingCostRowId(null);
  };

  const handleCreateCostCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCostLabel.trim()) return;
    const id = `cost-${Date.now()}`;
    const color = COLOR_PALETTE[expenseCategories.length % COLOR_PALETTE.length];
    onUpdateExpenseCategories([...expenseCategories, { id, label: newCostLabel.trim(), color }]);
    setNewCostLabel('');
    setShowNewCostModal(false);
  };

  const handleDeleteCostCategory = (cat: FeiraExpenseCategoryItem) => {
    if (confirm(`Excluir a linha de custo "${cat.label}" e todos os seus valores na planilha Geral?`)) {
      onUpdateExpenseCategories(expenseCategories.filter(c => c.id !== cat.id));
      onUpdateOrgExpenses(orgExpenses.filter(ex => ex.category !== cat.id));
    }
  };

  const handleToggleEditionCancel = (edition: FeiraEdition) => {
    const nextStatus = edition.status === 'cancelada' ? 'realizada' : 'cancelada';
    const updatedEditions = editions.map(ed =>
      ed.id === edition.id
        ? { ...ed, status: nextStatus as FeiraEdition['status'], sistOk: nextStatus === 'realizada' }
        : ed
    );
    onUpdateEditions(updatedEditions);
  };

  const handleDeleteEdition = (edition: FeiraEdition) => {
    if (confirm(`Deseja excluir permanentemente a data ${edition.label} e todos os seus lançamentos?`)) {
      onUpdateEditions(editions.filter(ed => ed.id !== edition.id));
      onUpdateParticipations(participations.filter(p => p.editionId !== edition.id));
      onUpdateOrgExpenses(orgExpenses.filter(e => e.editionId !== edition.id));
    }
  };

  const handleToggleSistOk = (edition: FeiraEdition) => {
    const updatedEditions = editions.map(ed =>
      ed.id === edition.id ? { ...ed, sistOk: !ed.sistOk } : ed
    );
    onUpdateEditions(updatedEditions);
  };

  const handleCreateEdition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionDate) return;
    const label = formatDateBR(newEditionDate);
    const id = `ed-${newEditionDate}-${Date.now()}`;
    const newEd: FeiraEdition = {
      id,
      date: newEditionDate,
      label,
      status: 'realizada',
      sistOk: true,
    };

    const newParts: FeiraParticipation[] = feirantes
      .filter(f => f.active)
      .map(f => ({
        id: `part-${id}-${f.id}`,
        editionId: id,
        feiranteId: f.id,
        amount: f.defaultFee,
        status: 'pendente',
      }));

    onUpdateEditions([newEd, ...editions]);
    onUpdateParticipations([...participations, ...newParts]);
    setShowNewEditionModal(false);
  };

  const handleQuickSettlePending = (part: FeiraParticipation, method: 'pago_pix' | 'pago_dinheiro') => {
    const updated = participations.map(p =>
      p.id === part.id ? { ...p, status: method } : p
    );
    onUpdateParticipations(updated);
  };

  const handleDeletePending = (part: FeiraParticipation) => {
    if (confirm('Deseja excluir esta cobrança pendente da planilha Geral?')) {
      onUpdateParticipations(participations.filter(p => p.id !== part.id));
    }
  };

  const handleSaveInlinePhone = (feiranteId: string) => {
    const updated = feirantes.map(f =>
      f.id === feiranteId ? { ...f, phone: inlinePhoneVal.trim() } : f
    );
    onUpdateFeirantes(updated);
    setEditingPhoneId(null);
    setInlinePhoneVal('');
  };

  const openNewFeiranteModal = () => {
    setEditingFeirante(null);
    setFrName('');
    setFrStallType('');
    setFrPhone('');
    setFrFee('55');
    setShowFeiranteModal(true);
  };

  const openEditFeiranteModal = (f: Feirante) => {
    setEditingFeirante(f);
    setFrName(f.name);
    setFrStallType(f.stallType);
    setFrPhone(f.phone || '');
    setFrFee(f.defaultFee.toString());
    setShowFeiranteModal(true);
  };

  const handleSaveFeirante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frName.trim()) return;
    const fee = parseFloat(frFee) || 55;

    if (editingFeirante) {
      const updated = feirantes.map(f =>
        f.id === editingFeirante.id
          ? { ...f, name: frName.trim(), stallType: frStallType.trim(), phone: frPhone.trim(), defaultFee: fee }
          : f
      );
      onUpdateFeirantes(updated);
    } else {
      const newFr: Feirante = {
        id: `fr-${Date.now()}`,
        name: frName.trim(),
        stallType: frStallType.trim() || 'Barraca Geral',
        phone: frPhone.trim(),
        defaultFee: fee,
        active: true,
      };
      onUpdateFeirantes([...feirantes, newFr]);
    }
    setShowFeiranteModal(false);
  };

  const handleDeleteFeirante = (f: Feirante) => {
    if (confirm(`Deseja excluir o feirante "${f.name}" e todos os seus lançamentos?`)) {
      onUpdateFeirantes(feirantes.filter(item => item.id !== f.id));
      onUpdateParticipations(participations.filter(p => p.feiranteId !== f.id));
    }
  };

  const handlePrintConsolidatedPDF = () => {
    const editionsSummary = editions.map(ed => {
      if (ed.status === 'cancelada') {
        return {
          label: ed.label,
          status: ed.status,
          receivedPix: 0,
          receivedCash: 0,
          totalReceived: 0,
          totalExpenses: 0,
          net: 0,
        };
      }
      const edParts = participations.filter(p => p.editionId === ed.id);
      const recPix = edParts.filter(p => p.status === 'pago_pix').reduce((s, p) => s + p.amount, 0);
      const recCash = edParts.filter(p => p.status === 'pago_dinheiro').reduce((s, p) => s + p.amount, 0);
      const totRec = recPix + recCash;
      const totExp = orgExpenses.filter(e => e.editionId === ed.id).reduce((s, e) => s + e.amount, 0);
      return {
        label: ed.label,
        status: ed.status,
        receivedPix: recPix,
        receivedCash: recCash,
        totalReceived: totRec,
        totalExpenses: totExp,
        net: totRec - totExp,
      };
    });

    pdfReportGenerator.openFeiraGeralReportPrint({
      totalEditions: realizedEditions.length,
      netCash,
      netPix,
      netTotal,
      totalPending,
      pendingList: pendingItems.map(item => ({
        dateLabel: item.edition.label,
        feiranteName: item.feirante.name,
        phone: item.feirante.phone || '-',
        amount: item.participation.amount,
      })),
      editionsSummary,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & KPIs - somente na aba Geral */}
      {activeSubTab === 'geral' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Feira da Lua — Controle de Recebimentos, Pagamentos e Feirantes
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Planilha Geral editável por barraca e data, cobranças automáticas de pendentes e fechamento líquido (PIX e Dinheiro)
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowNewEditionModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Data de Feira
              </button>

              <button
                onClick={handlePrintConsolidatedPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Relatório Geral (PDF)
              </button>
            </div>
          </div>

          {/* 4 Consolidated KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                Total de Feiras Realizadas
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {realizedEditions.length}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                {editions.filter(e => e.status === 'cancelada').length} canceladas por clima
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                Total Dinheiro (Líq)
              </span>
              <div className={`text-2xl font-bold font-mono mt-1 ${netCash >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatCurrency(netCash)}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                Entradas: {formatCurrency(totalReceivedCash)} · Saídas: {formatCurrency(totalPaidCash)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                Total PIX (Líq)
              </span>
              <div className={`text-2xl font-bold font-mono mt-1 ${netPix >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600'}`}>
                {formatCurrency(netPix)}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                Entradas: {formatCurrency(totalReceivedPix)} · Saídas: {formatCurrency(totalPaidPix)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                Saldo Líquido Geral
              </span>
              <div className={`text-2xl font-bold font-mono mt-1 ${netTotal >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                {formatCurrency(netTotal)}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                A receber (Pendente): {formatCurrency(totalPending)}
              </span>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="mt-5 flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-950 rounded-lg max-w-fit border border-transparent dark:border-neutral-800">
            <button
              onClick={() => onChangeSubTab('geral')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1.5" />
              Geral (Recebimentos & Pagamentos)
            </button>

            <button
              onClick={() => onChangeSubTab('reports')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            >
              <AlertCircle className="w-3.5 h-3.5 inline mr-1.5" />
              Cobranças ({pendingItems.length})
            </button>

            <button
              onClick={() => onChangeSubTab('feirantes')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Users className="w-3.5 h-3.5 inline mr-1.5" />
              Feirantes ({feirantes.length})
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: GERAL (PLANILHA EDITÁVEL COMPLETA) */}
      {activeSubTab === 'geral' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-semibold text-slate-700 dark:text-neutral-200">
              Clique em qualquer célula, nome de feirante, data ou custo para editar ou excluir:
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium dark:text-neutral-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-sky-100 dark:bg-sky-900 border border-sky-400"></span> Pago PIX
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-100 dark:bg-emerald-900 border border-emerald-400"></span> Pago Dinheiro
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-200 dark:bg-amber-800 border border-amber-500"></span> Pendente (Cobrar)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-200 dark:bg-neutral-700 border border-slate-400"></span> Atestado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-600"></span> Feira Cancelada
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 dark:bg-black text-white">
                  <th className="sticky left-0 z-20 bg-slate-900 dark:bg-black py-2.5 px-3 text-left font-bold min-w-[195px] border-r border-slate-700 dark:border-neutral-800">
                    <div className="flex items-center justify-between gap-2">
                      <span>Feirante / Barraca</span>
                      <button
                        onClick={openNewFeiranteModal}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                        title="Adicionar novo feirante"
                      >
                        + Barraca
                      </button>
                    </div>
                  </th>
                  {editions.map(ed => (
                    <th
                      key={ed.id}
                      className={`py-2 px-2 text-center font-mono min-w-[106px] border-r border-slate-700/70 dark:border-neutral-800 ${
                        ed.status === 'cancelada' ? 'bg-rose-700 text-white' : ''
                      }`}
                    >
                      {editingEdColId === ed.id ? (
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="date"
                            value={inlineEdDate}
                            onChange={e => setInlineEdDate(e.target.value)}
                            className="px-1 py-0.5 text-[10px] bg-white text-slate-900 rounded w-24"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveInlineEdDate(ed.id)}
                              className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px]"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setEditingEdColId(null)}
                              className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[9px]"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => {
                              setEditingEdColId(ed.id);
                              setInlineEdDate(ed.date);
                            }}
                            className="cursor-pointer hover:underline"
                            title="Clique para editar a data"
                          >
                            <div className="font-bold">{ed.label.slice(0, 5)}</div>
                            <div className="text-[10px] opacity-75">{ed.label.slice(6)}</div>
                          </div>
                          <div className="mt-1 flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleEditionCancel(ed)}
                              title={ed.status === 'cancelada' ? 'Reativar feira' : 'Marcar feira como cancelada'}
                              className="text-[9px] underline opacity-80 hover:opacity-100"
                            >
                              {ed.status === 'cancelada' ? 'Reativar' : 'Cancelar'}
                            </button>
                            <button
                              onClick={() => handleDeleteEdition(ed)}
                              title="Excluir esta data da planilha"
                              className="text-[9px] text-rose-300 hover:text-rose-100"
                            >
                              <Trash2 className="w-2.5 h-2.5 inline" />
                            </button>
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {feirantes.map(fr => (
                  <tr key={fr.id} className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40">
                    <td className="sticky left-0 z-10 bg-white dark:bg-neutral-900 py-2 px-3 font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-neutral-800 max-w-[205px]">
                      {editingFrRowId === fr.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={inlineFrName}
                            onChange={e => setInlineFrName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInlineFrName(fr.id);
                              if (e.key === 'Escape') setEditingFrRowId(null);
                            }}
                            className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded w-28 text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveInlineFrName(fr.id)}
                            className="p-0.5 text-emerald-600"
                            title="Salvar nome"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFrRowId(null)}
                            className="p-0.5 text-slate-400"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 group">
                          <div
                            onClick={() => {
                              setEditingFrRowId(fr.id);
                              setInlineFrName(fr.name);
                            }}
                            className="truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Clique para editar o nome da barraca"
                          >
                            <div>{fr.name}</div>
                            <div className="text-[10px] font-normal text-slate-400 dark:text-neutral-500 truncate">
                              {fr.stallType}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFeirante(fr)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity shrink-0"
                            title="Excluir feirante"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {editions.map(ed => {
                      if (ed.status === 'cancelada') {
                        return (
                          <td
                            key={ed.id}
                            className="bg-rose-600 text-white text-center font-bold text-[10px] py-2 px-1 border-r border-rose-500 select-none"
                          >
                            CANCELADO
                          </td>
                        );
                      }

                      const part = participations.find(p => p.editionId === ed.id && p.feiranteId === fr.id);
                      const status = part?.status || 'ausente';

                      let cellStyle = 'bg-white dark:bg-neutral-900 text-slate-400 dark:text-neutral-600 hover:bg-slate-100 dark:hover:bg-neutral-800';
                      let cellText = '—';

                      if (status === 'pago_pix') {
                        cellStyle = 'bg-sky-50/90 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/60';
                        cellText = formatCurrency(part?.amount || 0);
                      } else if (status === 'pago_dinheiro') {
                        cellStyle = 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60';
                        cellText = formatCurrency(part?.amount || 0);
                      } else if (status === 'pendente') {
                        cellStyle = 'bg-amber-200/90 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-bold hover:bg-amber-300 dark:hover:bg-amber-800/70';
                        cellText = formatCurrency(part?.amount || 0);
                      } else if (status === 'atestado') {
                        cellStyle = 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-medium text-[10px]';
                        cellText = 'ATESTADO';
                      }

                      return (
                        <td
                          key={ed.id}
                          onClick={() => openCellEditor(ed, fr)}
                          className={`py-2 px-1.5 text-center font-mono border-r border-slate-200 dark:border-neutral-800 cursor-pointer transition-colors ${cellStyle}`}
                          title={part?.note ? `${cellText} (${part.note})` : 'Clique para editar ou excluir'}
                        >
                          <div>{cellText}</div>
                          {part?.note && (
                            <div className="text-[9px] font-sans font-bold uppercase tracking-tight truncate max-w-[88px] mx-auto text-orange-700 dark:text-orange-300">
                              {part.note}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Total Recebido Row */}
                <tr className="bg-emerald-900 text-white font-bold font-mono">
                  <td className="sticky left-0 z-10 bg-emerald-900 py-2.5 px-3 border-r border-emerald-800 font-sans">
                    TOTAL RECEBIDO
                  </td>
                  {editions.map(ed => {
                    const sum =
                      ed.status === 'cancelada'
                        ? 0
                        : participations
                            .filter(p => p.editionId === ed.id && (p.status === 'pago_pix' || p.status === 'pago_dinheiro'))
                            .reduce((s, p) => s + p.amount, 0);
                    return (
                      <td key={ed.id} className="py-2.5 px-2 text-center border-r border-emerald-800">
                        {formatCurrency(sum)}
                      </td>
                    );
                  })}
                </tr>

                {/* Sist OK Row */}
                <tr className="bg-slate-50 dark:bg-neutral-950 text-[11px] font-semibold">
                  <td className="sticky left-0 z-10 bg-slate-50 dark:bg-neutral-950 py-1.5 px-3 text-slate-500 dark:text-neutral-400 border-r border-slate-200 dark:border-neutral-800">
                    Conferência Sistema
                  </td>
                  {editions.map(ed => (
                    <td key={ed.id} className="py-1.5 px-2 text-center border-r border-slate-200 dark:border-neutral-800">
                      {ed.status === 'cancelada' ? (
                        <span className="text-rose-600">—</span>
                      ) : (
                        <button
                          onClick={() => handleToggleSistOk(ed)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            ed.sistOk
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
                          }`}
                        >
                          {ed.sistOk ? 'sist ok' : 'pendente'}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>

                {/* PAGAMENTOS / DESPESAS DA FEIRA */}
                <tr className="bg-amber-800 text-white font-bold">
                  <td className="sticky left-0 z-10 bg-amber-800 py-2 px-3 border-r border-amber-700">
                    <div className="flex items-center justify-between gap-2">
                      <span>PAGAMENTOS / CUSTOS</span>
                      <button
                        onClick={() => setShowNewCostModal(true)}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-950 hover:bg-black text-white rounded"
                        title="Adicionar nova linha de custo"
                      >
                        + Custo
                      </button>
                    </div>
                  </td>
                  {editions.map(ed => (
                    <td key={ed.id} className="py-2 px-2 text-center font-mono text-[11px] border-r border-amber-700">
                      {ed.label}
                    </td>
                  ))}
                </tr>

                {expenseCategories.map(row => (
                  <tr key={row.id} className="bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/70 dark:hover:bg-rose-950/25">
                    <td className="sticky left-0 z-10 bg-white dark:bg-neutral-900 py-2 px-3 font-medium text-slate-800 dark:text-neutral-200 border-r border-slate-200 dark:border-neutral-800">
                      {editingCostRowId === row.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={inlineCostLabel}
                            onChange={e => setInlineCostLabel(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInlineCostLabel(row.id);
                              if (e.key === 'Escape') setEditingCostRowId(null);
                            }}
                            className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded w-28 text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveInlineCostLabel(row.id)}
                            className="p-0.5 text-emerald-600"
                            title="Salvar nome do custo"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCostRowId(null)}
                            className="p-0.5 text-slate-400"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 group">
                          <span
                            onClick={() => {
                              setEditingCostRowId(row.id);
                              setInlineCostLabel(row.label);
                            }}
                            className="truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Clique para renomear este custo"
                          >
                            {row.label}
                          </span>
                          <button
                            onClick={() => handleDeleteCostCategory(row)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity shrink-0"
                            title="Excluir linha de custo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    {editions.map(ed => {
                      if (ed.status === 'cancelada') {
                        return (
                          <td
                            key={ed.id}
                            className="bg-rose-600 text-white text-center font-bold text-[10px] py-2 px-1 border-r border-rose-500"
                          >
                            CANCELADO
                          </td>
                        );
                      }
                      const exp = orgExpenses.find(e => e.editionId === ed.id && e.category === row.id);
                      const amt = exp?.amount || 0;
                      return (
                        <td
                          key={ed.id}
                          onClick={() => openExpenseEditor(ed, row.id, row.label)}
                          className="py-2 px-1.5 text-center font-mono text-rose-900 dark:text-rose-300 border-r border-slate-200 dark:border-neutral-800 cursor-pointer hover:bg-rose-100/70 dark:hover:bg-rose-900/30"
                        >
                          {amt > 0 ? formatCurrency(amt) : 'R$ 0,00'}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Total Pago Row */}
                <tr className="bg-rose-900 text-white font-bold font-mono">
                  <td className="sticky left-0 z-10 bg-rose-900 py-2.5 px-3 border-r border-rose-800 font-sans">
                    TOTAL PAGO (DESPESAS)
                  </td>
                  {editions.map(ed => {
                    const sum =
                      ed.status === 'cancelada'
                        ? 0
                        : orgExpenses.filter(e => e.editionId === ed.id).reduce((s, e) => s + e.amount, 0);
                    return (
                      <td key={ed.id} className="py-2.5 px-2 text-center border-r border-rose-800">
                        {formatCurrency(sum)}
                      </td>
                    );
                  })}
                </tr>

                {/* Saldo Líquido por Edição */}
                <tr className="bg-slate-900 dark:bg-black text-white font-bold font-mono">
                  <td className="sticky left-0 z-10 bg-slate-900 dark:bg-black py-2.5 px-3 border-r border-slate-700 dark:border-neutral-800 font-sans">
                    SALDO LÍQUIDO DA FEIRA
                  </td>
                  {editions.map(ed => {
                    if (ed.status === 'cancelada') {
                      return (
                        <td key={ed.id} className="py-2.5 px-2 text-center border-r border-slate-700 dark:border-neutral-800 text-slate-400">
                          R$ 0,00
                        </td>
                      );
                    }
                    const rec = participations
                      .filter(p => p.editionId === ed.id && (p.status === 'pago_pix' || p.status === 'pago_dinheiro'))
                      .reduce((s, p) => s + p.amount, 0);
                    const pag = orgExpenses.filter(e => e.editionId === ed.id).reduce((s, e) => s + e.amount, 0);
                    const net = rec - pag;
                    return (
                      <td
                        key={ed.id}
                        className={`py-2.5 px-2 text-center border-r border-slate-700 dark:border-neutral-800 ${
                          net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(net)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: COBRANÇAS (PUXA APENAS PENDENTES DA PLANILHA GERAL + CONTATO DE FEIRANTES) */}
      {activeSubTab === 'reports' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cobranças Pendentes (Puxado da Planilha Geral & Feirantes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Exibe automaticamente todas as células marcadas como Pendente na planilha Geral com o contato do feirante
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold">
              Total Pendente: {formatCurrency(totalPending)}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3">Feira (Data)</th>
                  <th className="py-3 px-3">Feirante</th>
                  <th className="py-3 px-3">Contato (Feirantes)</th>
                  <th className="py-3 px-3">Status na Geral</th>
                  <th className="py-3 px-3 text-right">Valor Pendente</th>
                  <th className="py-3 px-3 text-right">Ações / Cobrança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {pendingItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-neutral-500">
                      Nenhuma célula marcada como Pendente na planilha Geral!
                    </td>
                  </tr>
                ) : (
                  pendingItems.map(({ participation, edition, feirante }) => (
                    <tr key={participation.id} className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {edition.label}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{feirante.name}</div>
                        {feirante.stallType && (
                          <div className="text-[10px] text-slate-400 dark:text-neutral-500">{feirante.stallType}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {editingPhoneId === feirante.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="(41) 99999-9999"
                              value={inlinePhoneVal}
                              onChange={e => setInlinePhoneVal(e.target.value)}
                              className="px-2 py-1 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded w-32 text-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveInlinePhone(feirante.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPhoneId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-600 dark:text-neutral-300">
                              {feirante.phone || '-'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPhoneId(feirante.id);
                                setInlinePhoneVal(feirante.phone || '');
                              }}
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              {feirante.phone ? 'Editar' : '+ Adicionar'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-semibold text-[11px]">
                          Pendente
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(participation.amount)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickSettlePending(participation, 'pago_pix')}
                            className="px-2 py-1 text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 rounded transition-colors"
                            title="Dar baixa como pago via PIX na planilha Geral"
                          >
                            Quitar PIX
                          </button>
                          <button
                            onClick={() => handleQuickSettlePending(participation, 'pago_dinheiro')}
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 rounded transition-colors"
                            title="Dar baixa como pago em Dinheiro na planilha Geral"
                          >
                            Quitar Dinheiro
                          </button>
                          {feirante.phone ? (
                            <a
                              href={`https://wa.me/55${feirante.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Olá ${feirante.name}, tudo bem? Consta uma pendência referente à Feira do dia ${edition.label} no valor de ${formatCurrency(participation.amount)}. Segue nossa chave PIX para acerto!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Cobrar
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 px-1">Sem telefone</span>
                          )}
                          <button
                            onClick={() => handleDeletePending(participation)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Excluir lançamento pendente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FEIRANTES CADASTRADOS */}
      {activeSubTab === 'feirantes' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cadastro de Feirantes & Barracas
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Gerencie os expositores, valores de taxa padrão e contatos de WhatsApp para cobrança
              </p>
            </div>
            <button
              onClick={openNewFeiranteModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Feirante
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {feirantes.map(f => {
              const pendingForFeirante = participations
                .filter(p => p.feiranteId === f.id && p.status === 'pendente')
                .reduce((s, p) => s + p.amount, 0);

              return (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{f.name}</h4>
                        <div className="text-xs text-slate-500 dark:text-neutral-400">{f.stallType}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditFeiranteModal(f)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                          title="Editar feirante"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeirante(f)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Excluir feirante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-neutral-400">Taxa Padrão:</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(f.defaultFee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-neutral-400">WhatsApp:</span>
                        <span className="font-mono text-slate-700 dark:text-neutral-300">
                          {f.phone || 'Não cadastrado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-neutral-400">Pendências na Geral:</span>
                    {pendingForFeirante > 0 ? (
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(pendingForFeirante)}
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Em dia</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / EXCLUIR CÉLULA DE FEIRANTE NA PLANILHA GERAL */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingCell.feirante.name} — {editingCell.edition.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 mb-4">
              Atualize o status de pagamento, valor da taxa ou exclua este lançamento
            </p>

            <form onSubmit={handleSaveCell} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                  Situação do Pagamento / Presença
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pago_pix', label: 'Pago via PIX' },
                    { id: 'pago_dinheiro', label: 'Pago em Dinheiro' },
                    { id: 'pendente', label: 'Pendente (A Cobrar)' },
                    { id: 'atestado', label: 'Atestado / Justificado' },
                    { id: 'ausente', label: 'Ausente / Não Veio' },
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setCellStatus(st.id as FeiraCellStatus)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                        cellStatus === st.id
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600'
                          : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {cellStatus !== 'atestado' && cellStatus !== 'ausente' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Valor da Taxa (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cellAmount}
                    onChange={e => setCellAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Observação (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pagou Lincon, Meia taxa chuva..."
                  value={cellNote}
                  onChange={e => setCellNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleDeleteCell}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Lançamento
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / EXCLUIR DESPESA DA ORGANIZAÇÃO */}
      {editingExpenseCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingExpenseCell.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Edição da Feira: {editingExpenseCell.edition.label}
            </p>

            <form onSubmit={handleSaveExpenseCell} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={expAmount}
                  onChange={e => setExpAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpMethod('pix')}
                    className={`py-2 text-xs font-semibold rounded-lg border ${
                      expMethod === 'pix'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600'
                        : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpMethod('dinheiro')}
                    className={`py-2 text-xs font-semibold rounded-lg border ${
                      expMethod === 'dinheiro'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600'
                        : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    Dinheiro
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleDeleteExpenseCell}
                  className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingExpenseCell(null)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA LINHA DE CUSTO */}
      {showNewCostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Nova Linha de Custo / Pagamento
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Adicione uma nova categoria de despesa na planilha Geral
            </p>

            <form onSubmit={handleCreateCostCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Nome do Custo
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Limpeza, Divulgação, Aluguel Tenda..."
                  value={newCostLabel}
                  onChange={e => setNewCostLabel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewCostModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Adicionar Custo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA EDIÇÃO DE FEIRA */}
      {showNewEditionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Nova Edição da Feira
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Adicione uma nova coluna de data na planilha Geral para lançar os recebimentos e despesas
            </p>

            <form onSubmit={handleCreateEdition} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Data da Feira
                </label>
                <input
                  type="date"
                  required
                  value={newEditionDate}
                  onChange={e => setNewEditionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewEditionModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Criar Coluna na Planilha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO / EDITAR FEIRANTE */}
      {showFeiranteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {editingFeirante ? 'Editar Feirante' : 'Cadastrar Novo Feirante'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Informe os dados da barraca, taxa semanal e WhatsApp para cobranças
            </p>

            <form onSubmit={handleSaveFeirante} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Nome da Barraca / Feirante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pastelaria da Praça"
                  value={frName}
                  onChange={e => setFrName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Ramo / Produto Principal
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pastéis, Caldo de Cana, Artesanato..."
                  value={frStallType}
                  onChange={e => setFrStallType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(41) 99999-9999"
                    value={frPhone}
                    onChange={e => setFrPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Taxa Padrão (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={frFee}
                    onChange={e => setFrFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowFeiranteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Salvar Feirante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
