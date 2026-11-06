import React, { useState, useEffect } from 'react';
import {
  Feirante,
  FeiraEdition,
  FeiraParticipation,
  FeiraOrgExpense,
  FeiraExpenseCategoryItem,
} from './types/finance';
import { storageService } from './services/storage';
import { Navbar, AppTab } from './components/Navbar';
import { FeiraManagement } from './components/FeiraManagement';
import { FeiraCharts } from './components/FeiraCharts';
import { pdfReportGenerator } from './services/pdfReportGenerator';

const THEME_STORAGE_KEY = 'finanzen_dark_theme_v1';

export default function App() {
  // Core Feira State
  const [feirantes, setFeirantes] = useState<Feirante[]>(() => storageService.getFeirantes());
  const [feiraEditions, setFeiraEditions] = useState<FeiraEdition[]>(() => storageService.getFeiraEditions());
  const [feiraParticipations, setFeiraParticipations] = useState<FeiraParticipation[]>(() => storageService.getFeiraParticipations());
  const [feiraOrgExpenses, setFeiraOrgExpenses] = useState<FeiraOrgExpense[]>(() => storageService.getFeiraOrgExpenses());
  const [expenseCategories, setExpenseCategories] = useState<FeiraExpenseCategoryItem[]>(() => storageService.getFeiraExpenseCategories());

  // Theme State (Fundo Preto / Claro)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, String(isDark));
  }, [isDark]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<AppTab>('geral');

  const handleUpdateFeirantes = (updated: Feirante[]) => {
    setFeirantes(updated);
    storageService.saveFeirantes(updated);
  };

  const handleUpdateFeiraEditions = (updated: FeiraEdition[]) => {
    setFeiraEditions(updated);
    storageService.saveFeiraEditions(updated);
  };

  const handleUpdateFeiraParticipations = (updated: FeiraParticipation[]) => {
    setFeiraParticipations(updated);
    storageService.saveFeiraParticipations(updated);
  };

  const handleUpdateFeiraOrgExpenses = (updated: FeiraOrgExpense[]) => {
    setFeiraOrgExpenses(updated);
    storageService.saveFeiraOrgExpenses(updated);
  };

  const handleUpdateExpenseCategories = (updated: FeiraExpenseCategoryItem[]) => {
    setExpenseCategories(updated);
    storageService.saveFeiraExpenseCategories(updated);
  };

  // Print Consolidated Feira PDF from Top Bar
  const handlePrintConsolidatedPDF = () => {
    const realizedEditions = feiraEditions.filter(e => e.status === 'realizada');
    let totalReceivedPix = 0;
    let totalReceivedCash = 0;
    let totalPending = 0;

    feiraParticipations.forEach(p => {
      const ed = feiraEditions.find(e => e.id === p.editionId);
      if (!ed || ed.status === 'cancelada') return;
      if (p.status === 'pago_pix') totalReceivedPix += p.amount;
      else if (p.status === 'pago_dinheiro') totalReceivedCash += p.amount;
      else if (p.status === 'pendente') totalPending += p.amount;
    });

    let totalPaidPix = 0;
    let totalPaidCash = 0;
    feiraOrgExpenses.forEach(exp => {
      const ed = feiraEditions.find(e => e.id === exp.editionId);
      if (!ed || ed.status === 'cancelada') return;
      if (exp.paymentMethod === 'pix') totalPaidPix += exp.amount;
      else totalPaidCash += exp.amount;
    });

    const netPix = totalReceivedPix - totalPaidPix;
    const netCash = totalReceivedCash - totalPaidCash;
    const netTotal = netPix + netCash;

    const pendingList = feiraParticipations
      .filter(p => {
        const ed = feiraEditions.find(e => e.id === p.editionId);
        return ed && ed.status !== 'cancelada' && p.status === 'pendente' && p.amount > 0;
      })
      .map(p => {
        const ed = feiraEditions.find(e => e.id === p.editionId)!;
        const fr = feirantes.find(f => f.id === p.feiranteId);
        return {
          dateLabel: ed.label,
          feiranteName: fr?.name || 'Feirante',
          phone: fr?.phone || '-',
          amount: p.amount,
        };
      });

    const editionsSummary = feiraEditions.map(ed => {
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
      const edParts = feiraParticipations.filter(p => p.editionId === ed.id);
      const recPix = edParts.filter(p => p.status === 'pago_pix').reduce((s, p) => s + p.amount, 0);
      const recCash = edParts.filter(p => p.status === 'pago_dinheiro').reduce((s, p) => s + p.amount, 0);
      const totRec = recPix + recCash;
      const totExp = feiraOrgExpenses.filter(e => e.editionId === ed.id).reduce((s, e) => s + e.amount, 0);
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
      pendingList,
      editionsSummary,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onPrintReport={handlePrintConsolidatedPDF}
        isDark={isDark}
        onToggleDark={() => setIsDark(prev => !prev)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {(currentTab === 'geral' || currentTab === 'reports' || currentTab === 'feirantes') && (
          <FeiraManagement
            activeSubTab={currentTab}
            onChangeSubTab={tab => setCurrentTab(tab)}
            feirantes={feirantes}
            editions={feiraEditions}
            participations={feiraParticipations}
            orgExpenses={feiraOrgExpenses}
            expenseCategories={expenseCategories}
            onUpdateFeirantes={handleUpdateFeirantes}
            onUpdateEditions={handleUpdateFeiraEditions}
            onUpdateParticipations={handleUpdateFeiraParticipations}
            onUpdateOrgExpenses={handleUpdateFeiraOrgExpenses}
            onUpdateExpenseCategories={handleUpdateExpenseCategories}
          />
        )}

        {currentTab === 'charts' && (
          <FeiraCharts
            editions={feiraEditions}
            participations={feiraParticipations}
            orgExpenses={feiraOrgExpenses}
            expenseCategories={expenseCategories}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-neutral-800 py-6 text-center text-xs text-slate-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-neutral-200">Feira da Lua</span>
            <span>—</span>
            <span>Gestão Financeira de Recebimentos, Pagamentos e Feirantes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
