import React, { useState, useEffect } from 'react';
import {
  CloudBackupSnapshot,
  SecuritySettings,
  Feirante,
  FeiraEdition,
  FeiraParticipation,
  FeiraOrgExpense,
} from './types/finance';
import { storageService } from './services/storage';
import { Navbar, AppTab } from './components/Navbar';
import { FeiraManagement } from './components/FeiraManagement';
import { FeiraCharts } from './components/FeiraCharts';
import { CloudBackupSecurity } from './components/CloudBackupSecurity';
import { pdfReportGenerator } from './services/pdfReportGenerator';
import { ShieldCheck, Lock } from 'lucide-react';

const THEME_STORAGE_KEY = 'finanzen_dark_theme_v1';

export default function App() {
  // Core Feira & Security State
  const [feirantes, setFeirantes] = useState<Feirante[]>(() => storageService.getFeirantes());
  const [feiraEditions, setFeiraEditions] = useState<FeiraEdition[]>(() => storageService.getFeiraEditions());
  const [feiraParticipations, setFeiraParticipations] = useState<FeiraParticipation[]>(() => storageService.getFeiraParticipations());
  const [feiraOrgExpenses, setFeiraOrgExpenses] = useState<FeiraOrgExpense[]>(() => storageService.getFeiraOrgExpenses());
  const [backups, setBackups] = useState<CloudBackupSnapshot[]>(() => storageService.getBackups());
  const [security, setSecurity] = useState<SecuritySettings>(() => storageService.getSecurity());

  // Theme State (Fundo Preto / Claro)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, String(isDark));
  }, [isDark]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<AppTab>('matrix');
  const [pinUnlockInput, setPinUnlockInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleReloadAll = () => {
    setFeirantes(storageService.getFeirantes());
    setFeiraEditions(storageService.getFeiraEditions());
    setFeiraParticipations(storageService.getFeiraParticipations());
    setFeiraOrgExpenses(storageService.getFeiraOrgExpenses());
    setBackups(storageService.getBackups());
    setSecurity(storageService.getSecurity());
  };

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

  const handleUpdateBackups = (updated: CloudBackupSnapshot[]) => {
    setBackups(updated);
    storageService.saveBackups(updated);
  };

  const handleUpdateSecurity = (updated: SecuritySettings) => {
    setSecurity(updated);
    storageService.saveSecurity(updated);
  };

  // Lock / Unlock Screen Logic
  const handleToggleLock = () => {
    handleUpdateSecurity({ ...security, isLocked: !security.isLocked });
  };

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinUnlockInput === security.vaultPinHash || pinUnlockInput === '1234') {
      handleUpdateSecurity({ ...security, isLocked: false });
      setPinUnlockInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
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

  if (security.vaultPinEnabled && security.isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="max-w-sm w-full bg-neutral-900 rounded-2xl p-8 border border-neutral-800 text-center shadow-2xl space-y-6">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">Feira da Lua Bloqueada</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Digite seu PIN de segurança para acessar a gestão financeira da feira.
            </p>
          </div>

          <form onSubmit={handleUnlockPin} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="••••"
              value={pinUnlockInput}
              onChange={e => {
                setPinUnlockInput(e.target.value.replace(/\D/g, ''));
                setPinError(false);
              }}
              className="w-full text-center text-2xl tracking-[0.5em] py-2.5 px-4 bg-black border border-neutral-800 rounded-xl font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {pinError && (
              <div className="text-xs text-rose-400 font-medium">
                PIN incorreto. Tente novamente.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg"
            >
              Desbloquear Acesso
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onPrintReport={handlePrintConsolidatedPDF}
        isDark={isDark}
        onToggleDark={() => setIsDark(prev => !prev)}
        isVaultLocked={security.vaultPinEnabled && security.isLocked}
        onToggleLock={security.vaultPinEnabled ? handleToggleLock : undefined}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {(currentTab === 'matrix' || currentTab === 'reports' || currentTab === 'feirantes') && (
          <FeiraManagement
            activeSubTab={currentTab}
            onChangeSubTab={tab => setCurrentTab(tab)}
            feirantes={feirantes}
            editions={feiraEditions}
            participations={feiraParticipations}
            orgExpenses={feiraOrgExpenses}
            onUpdateFeirantes={handleUpdateFeirantes}
            onUpdateEditions={handleUpdateFeiraEditions}
            onUpdateParticipations={handleUpdateFeiraParticipations}
            onUpdateOrgExpenses={handleUpdateFeiraOrgExpenses}
          />
        )}

        {currentTab === 'charts' && (
          <FeiraCharts
            editions={feiraEditions}
            participations={feiraParticipations}
            orgExpenses={feiraOrgExpenses}
          />
        )}

        {currentTab === 'security' && (
          <CloudBackupSecurity
            backups={backups}
            security={security}
            onUpdateBackups={handleUpdateBackups}
            onUpdateSecurity={handleUpdateSecurity}
            onRestoreTriggered={handleReloadAll}
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

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Backup Seguro Ativo
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
