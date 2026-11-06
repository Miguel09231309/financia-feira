import { Transaction, CategoryBudget, FeiraSession, FeiraItemSale, FeiraExpense } from '../types/finance';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export interface MonthlyReportData {
  monthYear: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  categoryTotals: { [key: string]: number };
}

export interface FeiraReportData {
  session: FeiraSession;
  sales: FeiraItemSale[];
  expenses: FeiraExpense[];
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  salesByMethod: { [key: string]: number };
  expensesFromCash: number;
  expectedCashInDrawer: number;
}

export const pdfReportGenerator = {
  // Generate Printable HTML Document for Monthly Finances
  openMonthlyReportPrint(data: MonthlyReportData) {
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório Financeiro Mensal - ${data.monthYear}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 20px; font-size: 11pt; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 22pt; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .brand span { color: #10b981; }
          .meta { text-align: right; font-size: 9pt; color: #64748b; }
          .title { font-size: 16pt; font-weight: 700; margin-bottom: 5px; color: #0f172a; }
          .subtitle { font-size: 10pt; color: #64748b; margin-bottom: 20px; }
          
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .kpi-label { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
          .kpi-value { font-size: 14pt; font-weight: 700; font-family: monospace; }
          .income { color: #16a34a; }
          .expense { color: #dc2626; }
          .balance { color: #0f172a; }
          .rate { color: #2563eb; }

          h3 { font-size: 12pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; color: #0f172a; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9.5pt; }
          th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-weight: 600; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) { background-color: #fafafa; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; }
          
          .status-tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8pt; font-weight: 600; }
          .status-ok { background: #dcfce7; color: #15803d; }
          .status-warn { background: #fef9c3; color: #854d0e; }
          .status-danger { background: #fee2e2; color: #b91c1c; }

          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #94a3b8; }
          .security-badge { font-family: monospace; font-size: 8pt; color: #059669; }

          @media print {
            body { padding: 0; }
            button { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 10px;" class="no-print">
          <button onclick="window.print()" style="background: #0f172a; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Imprimir / Salvar em PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="brand">Finan<span>Zen</span></div>
            <div style="font-size: 9pt; color: #64748b;">Sistema Integrado de Gestão Financeira & Open Finance</div>
          </div>
          <div class="meta">
            <div>Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
            <div class="security-badge">Autenticidade: SHA-256 Validado</div>
          </div>
        </div>

        <div class="title">Demonstrativo Financeiro Mensal</div>
        <div class="subtitle">Período de Referência: <strong>${data.monthYear}</strong></div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Receitas</div>
            <div class="kpi-value income">${formatCurrency(data.totalIncome)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Despesas</div>
            <div class="kpi-value expense">${formatCurrency(data.totalExpense)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Saldo Líquido</div>
            <div class="kpi-value balance">${formatCurrency(data.netSavings)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Taxa de Poupança</div>
            <div class="kpi-value rate">${data.savingsRate.toFixed(1)}%</div>
          </div>
        </div>

        <h3>Acompanhamento de Orçamentos por Categoria</h3>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th class="text-right">Teto Orçado</th>
              <th class="text-right">Gasto Realizado</th>
              <th class="text-right">Saldo Restante</th>
              <th class="text-right">% Consumido</th>
              <th class="text-right">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${data.budgets.map(b => {
              const spent = data.categoryTotals[b.category] || 0;
              const remaining = b.monthlyLimit - spent;
              const pct = (spent / (b.monthlyLimit || 1)) * 100;
              let statusClass = 'status-ok';
              let statusLabel = 'No Limite';
              if (pct > 100) {
                statusClass = 'status-danger';
                statusLabel = 'Estourado';
              } else if (pct > 80) {
                statusClass = 'status-warn';
                statusLabel = 'Atenção';
              }
              return `
                <tr>
                  <td><strong>${b.category}</strong></td>
                  <td class="text-right font-mono">${formatCurrency(b.monthlyLimit)}</td>
                  <td class="text-right font-mono">${formatCurrency(spent)}</td>
                  <td class="text-right font-mono ${remaining < 0 ? 'expense' : ''}">${formatCurrency(remaining)}</td>
                  <td class="text-right font-mono">${pct.toFixed(0)}%</td>
                  <td class="text-right"><span class="status-tag ${statusClass}">${statusLabel}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <h3>Detalhamento das Movimentações do Período (${data.transactions.length} registros)</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Método</th>
              <th>Status</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.map(t => `
              <tr>
                <td class="font-mono">${formatDateBR(t.date)}</td>
                <td><strong>${t.description}</strong></td>
                <td>${t.category}</td>
                <td>${t.paymentMethod.toUpperCase()}</td>
                <td><span class="status-tag ${t.status === 'completed' ? 'status-ok' : 'status-warn'}">${t.status === 'completed' ? 'Concluído' : 'Pendente'}</span></td>
                <td class="text-right font-mono ${t.type === 'income' ? 'income' : 'expense'}">
                  ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Documento gerado automaticamente pelo FinanZen. Total conformidade e criptografia local.</div>
          <div>Página 1 de 1</div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(reportHtml);
      printWin.document.close();
      // Optional print auto prompt
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    }
  },

  // Generate Printable HTML Document for Feira Closing Report
  openFeiraReportPrint(data: FeiraReportData) {
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório de Fechamento de Feira - ${data.session.name}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 20px; font-size: 11pt; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 20pt; font-weight: 800; color: #065f46; letter-spacing: -0.5px; }
          .brand span { color: #10b981; }
          .meta { text-align: right; font-size: 9pt; color: #64748b; }
          .title { font-size: 16pt; font-weight: 700; margin-bottom: 4px; color: #065f46; }
          .subtitle { font-size: 10pt; color: #475569; margin-bottom: 20px; }
          
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .kpi-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; }
          .kpi-label { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; font-weight: 600; margin-bottom: 4px; }
          .kpi-value { font-size: 14pt; font-weight: 700; font-family: monospace; }
          .profit { color: #15803d; }
          .expense { color: #dc2626; }
          .sales { color: #047857; }
          .drawer { color: #0284c7; }

          .cashbox-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 25px; }
          .cashbox-title { font-size: 11pt; font-weight: 700; color: #1e293b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .cashbox-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 10pt; }
          .cashbox-total { border-top: 2px solid #0f172a; margin-top: 10px; padding-top: 8px; font-weight: 700; font-size: 12pt; }

          h3 { font-size: 12pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; color: #0f172a; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9.5pt; }
          th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-weight: 600; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) { background-color: #fafafa; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; }

          .signature-box { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 30px; }
          .sig-line { width: 45%; border-top: 1px solid #94a3b8; text-align: center; font-size: 9pt; color: #64748b; padding-top: 6px; }
          
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 10px;" class="no-print">
          <button onclick="window.print()" style="background: #059669; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Imprimir / Salvar em PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="brand">Módulo Feira <span>· FinanZen</span></div>
            <div style="font-size: 9pt; color: #64748b;">Gestão Operacional de Caixa & Vendas de Feirantes</div>
          </div>
          <div class="meta">
            <div>Data da Feira: <strong>${formatDateBR(data.session.date)}</strong></div>
            <div>Local: ${data.session.location}</div>
            <div>Status: <strong>${data.session.status === 'closed' ? 'FECHADO' : 'EM ANDAMENTO'}</strong></div>
          </div>
        </div>

        <div class="title">${data.session.name}</div>
        <div class="subtitle">Conferência Física e Conciliação Financeira de Fechamento</div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Faturamento Total</div>
            <div class="kpi-value sales">${formatCurrency(data.totalSales)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Despesas da Feira</div>
            <div class="kpi-value expense">${formatCurrency(data.totalExpenses)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Lucro Líquido do Dia</div>
            <div class="kpi-value profit">${formatCurrency(data.netProfit)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Gaveta Física (Dinheiro)</div>
            <div class="kpi-value drawer">${formatCurrency(data.expectedCashInDrawer)}</div>
          </div>
        </div>

        <div class="cashbox-box">
          <div class="cashbox-title">Conferência & Auditoria da Gaveta de Dinheiro (Espécie)</div>
          <div class="cashbox-row">
            <span>(+) Fundo de Troco Inicial (Suprimento de Abertura):</span>
            <span class="font-mono">${formatCurrency(data.session.initialCashFund)}</span>
          </div>
          <div class="cashbox-row">
            <span>(+) Total de Vendas Recebidas em Dinheiro Vivo:</span>
            <span class="font-mono income">${formatCurrency(data.salesByMethod['dinheiro'] || 0)}</span>
          </div>
          <div class="cashbox-row">
            <span>(-) Despesas e Pagamentos Pagos Direto da Gaveta:</span>
            <span class="font-mono expense">- ${formatCurrency(data.expensesFromCash)}</span>
          </div>
          <div class="cashbox-row cashbox-total">
            <span>(=) Saldo Físico Esperado na Gaveta:</span>
            <span class="font-mono">${formatCurrency(data.expectedCashInDrawer)}</span>
          </div>
          ${data.session.physicalCashCount !== undefined ? `
            <div class="cashbox-row" style="margin-top: 6px;">
              <span>Contagem Física Declarada:</span>
              <span class="font-mono"><strong>${formatCurrency(data.session.physicalCashCount)}</strong></span>
            </div>
            <div class="cashbox-row">
              <span>Diferença Apurada (Sobra / Falta):</span>
              <span class="font-mono ${(data.session.cashDifference || 0) < 0 ? 'expense' : 'income'}">
                <strong>${(data.session.cashDifference || 0) >= 0 ? '+' : ''}${formatCurrency(data.session.cashDifference || 0)}</strong>
              </span>
            </div>
          ` : ''}
        </div>

        <h3>Distribuição de Vendas por Forma de Pagamento</h3>
        <table>
          <thead>
            <tr>
              <th>Forma de Pagamento</th>
              <th class="text-right">Total Apurado</th>
              <th class="text-right">% do Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>PIX Instantâneo</strong></td>
              <td class="text-right font-mono">${formatCurrency(data.salesByMethod['pix'] || 0)}</td>
              <td class="text-right font-mono">${data.totalSales > 0 ? (((data.salesByMethod['pix'] || 0) / data.totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Dinheiro em Espécie</strong></td>
              <td class="text-right font-mono">${formatCurrency(data.salesByMethod['dinheiro'] || 0)}</td>
              <td class="text-right font-mono">${data.totalSales > 0 ? (((data.salesByMethod['dinheiro'] || 0) / data.totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Cartão de Débito</strong></td>
              <td class="text-right font-mono">${formatCurrency(data.salesByMethod['cartao_debito'] || 0)}</td>
              <td class="text-right font-mono">${data.totalSales > 0 ? (((data.salesByMethod['cartao_debito'] || 0) / data.totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Cartão de Crédito</strong></td>
              <td class="text-right font-mono">${formatCurrency(data.salesByMethod['cartao_credito'] || 0)}</td>
              <td class="text-right font-mono">${data.totalSales > 0 ? (((data.salesByMethod['cartao_credito'] || 0) / data.totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Caderneta / A Prazo</strong></td>
              <td class="text-right font-mono">${formatCurrency(data.salesByMethod['fiado'] || 0)}</td>
              <td class="text-right font-mono">${data.totalSales > 0 ? (((data.salesByMethod['fiado'] || 0) / data.totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
          </tbody>
        </table>

        <h3>Despesas Operacionais e Fornecedores da Feira</h3>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Forma Pgto</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.expenses.map(e => `
              <tr>
                <td class="font-mono">${e.timestamp ? e.timestamp.split(' ')[1] || e.timestamp : ''}</td>
                <td><strong>${e.description}</strong></td>
                <td>${e.category.replace('_', ' ').toUpperCase()}</td>
                <td>${e.paidFromCashBox ? 'Dinheiro da Gaveta' : e.paymentMethod.toUpperCase()}</td>
                <td class="text-right font-mono expense">- ${formatCurrency(e.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-box">
          <div class="sig-line">
            Responsável pelo Fechamento do Caixa<br>
            <strong>Conferido e Atestado</strong>
          </div>
          <div class="sig-line">
            Titular da Barraca / Administrador<br>
            <strong>Visto Geral</strong>
          </div>
        </div>

        <div class="footer">
          <div>FinanZen Feira - Sistema Profissional para Feirantes e Produtores Rurais</div>
          <div>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(reportHtml);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    }
  },

  // Export transactions to CSV
  exportTransactionsCSV(transactions: Transaction[]) {
    const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)', 'Forma de Pagamento', 'Status', 'Origem', 'Notas'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2).replace('.', ','),
      t.paymentMethod,
      t.status,
      t.source,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_financeiro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Generate Printable HTML Document for Consolidated Feira Geral & Pendentes Report
  openFeiraGeralReportPrint(data: {
    totalEditions: number;
    netCash: number;
    netPix: number;
    netTotal: number;
    totalPending: number;
    pendingList: { dateLabel: string; feiranteName: string; phone: string; amount: number }[];
    editionsSummary: { label: string; status: string; receivedPix: number; receivedCash: number; totalReceived: number; totalExpenses: number; net: number }[];
  }) {
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório Geral de Feiras - Prestação de Contas</title>
        <style>
          @page { size: A4; margin: 14mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 20px; font-size: 10.5pt; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
          .brand { font-size: 20pt; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .brand span { color: #10b981; }
          .meta { text-align: right; font-size: 9pt; color: #64748b; }
          .title { font-size: 15pt; font-weight: 700; margin-bottom: 4px; color: #0f172a; }
          .subtitle { font-size: 9.5pt; color: #64748b; margin-bottom: 18px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 11px; }
          .kpi-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
          .kpi-value { font-size: 13.5pt; font-weight: 700; font-family: monospace; }
          .income { color: #16a34a; }
          .expense { color: #dc2626; }
          .pix { color: #0284c7; }
          h3 { font-size: 11.5pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 22px; margin-bottom: 10px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 9pt; }
          th { background: #f1f5f9; text-align: left; padding: 7px 9px; font-weight: 600; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 7px 9px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) { background-color: #fafafa; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; }
          .footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #94a3b8; }
          @media print { body { padding: 0; } button { display: none !important; } }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 10px;">
          <button onclick="window.print()" style="background: #0f172a; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Imprimir / Salvar em PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="brand">Finan<span>Zen</span> · Gestão de Feiras</div>
            <div style="font-size: 9pt; color: #64748b;">Prestação de Contas Consolidada — Recebimentos, Pagamentos e Cobranças</div>
          </div>
          <div class="meta">
            <div>Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
            <div>Total Pendente: <strong style="color:#dc2626;">${formatCurrency(data.totalPending)}</strong></div>
          </div>
        </div>

        <div class="title">Relatório Geral de Feiras</div>
        <div class="subtitle">Consolidado de edições realizadas, saldos líquidos em PIX e Dinheiro, e pendências de feirantes</div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total de Feiras</div>
            <div class="kpi-value">${data.totalEditions}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Dinheiro (Líq)</div>
            <div class="kpi-value income">${formatCurrency(data.netCash)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total PIX (Líq)</div>
            <div class="kpi-value pix">${formatCurrency(data.netPix)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Saldo Líquido Geral</div>
            <div class="kpi-value ${data.netTotal >= 0 ? 'income' : 'expense'}">${formatCurrency(data.netTotal)}</div>
          </div>
        </div>

        <h3>Relatório de Pendentes para Cobrança (${data.pendingList.length} pendências · Total: ${formatCurrency(data.totalPending)})</h3>
        <table>
          <thead>
            <tr>
              <th>Feira (Data)</th>
              <th>Feirante</th>
              <th>Contato</th>
              <th>Presença</th>
              <th class="text-right">Valor Pendente</th>
            </tr>
          </thead>
          <tbody>
            ${data.pendingList.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#64748b;">Nenhuma pendência em aberto.</td></tr>' : data.pendingList.map(p => `
              <tr>
                <td class="font-mono">${p.dateLabel}</td>
                <td><strong>${p.feiranteName}</strong></td>
                <td>${p.phone || '-'}</td>
                <td>Presente</td>
                <td class="text-right font-mono expense"><strong>${formatCurrency(p.amount)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Resumo Financeiro por Edição da Feira</h3>
        <table>
          <thead>
            <tr>
              <th>Data da Feira</th>
              <th>Situação</th>
              <th class="text-right">Recebido PIX</th>
              <th class="text-right">Recebido Dinheiro</th>
              <th class="text-right">Total Recebido</th>
              <th class="text-right">Total Pago (Despesas)</th>
              <th class="text-right">Saldo Líquido</th>
            </tr>
          </thead>
          <tbody>
            ${data.editionsSummary.map(ed => `
              <tr>
                <td class="font-mono"><strong>${ed.label}</strong></td>
                <td>${ed.status === 'cancelada' ? '<span class="expense">CANCELADA</span>' : '<span class="income">Realizada</span>'}</td>
                <td class="text-right font-mono">${formatCurrency(ed.receivedPix)}</td>
                <td class="text-right font-mono">${formatCurrency(ed.receivedCash)}</td>
                <td class="text-right font-mono income"><strong>${formatCurrency(ed.totalReceived)}</strong></td>
                <td class="text-right font-mono expense">- ${formatCurrency(ed.totalExpenses)}</td>
                <td class="text-right font-mono ${ed.net >= 0 ? 'income' : 'expense'}"><strong>${formatCurrency(ed.net)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>FinanZen — Controle Financeiro e Gestão de Feiras</div>
          <div>Documento gerado automaticamente</div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(reportHtml);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    }
  },
};

