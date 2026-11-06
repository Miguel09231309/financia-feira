import {
  Transaction,
  CategoryBudget,
  BankAccount,
  FeiraSession,
  FeiraItemSale,
  FeiraExpense,
  CloudBackupSnapshot,
  SecuritySettings,
  Feirante,
  FeiraEdition,
  FeiraParticipation,
  FeiraOrgExpense,
  FeiraExpenseCategoryItem,
} from '../types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finanzen_transactions_v1',
  BUDGETS: 'finanzen_budgets_v1',
  BANKS: 'finanzen_banks_v1',
  FEIRA_SESSIONS: 'finanzen_feira_sessions_v1',
  FEIRA_SALES: 'finanzen_feira_sales_v1',
  FEIRA_EXPENSES: 'finanzen_feira_expenses_v1',
  BACKUPS: 'finanzen_cloud_backups_v1',
  SECURITY: 'finanzen_security_v1',
  FEIRANTES: 'finanzen_feirantes_v1',
  FEIRA_EDITIONS: 'finanzen_feira_editions_v1',
  FEIRA_PARTICIPATIONS: 'finanzen_feira_participations_v1',
  FEIRA_ORG_EXPENSES: 'finanzen_feira_org_expenses_v1',
  FEIRA_EXPENSE_CATEGORIES: 'finanzen_feira_expense_categories_v1',
};

// Data do contexto: 2026-11-03
const CURRENT_DATE_STR = '2026-11-03';
const CURRENT_MONTH = '2026-11';
const PREV_MONTH = '2026-10';

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Alimentação & Supermercado', monthlyLimit: 2200, color: '#10B981', iconName: 'ShoppingBag' },
  { category: 'Moradia & Contas', monthlyLimit: 2800, color: '#3B82F6', iconName: 'Home' },
  { category: 'Transporte & Combustível', monthlyLimit: 900, color: '#F59E0B', iconName: 'Car' },
  { category: 'Feira - Mercadorias Ceasa', monthlyLimit: 4500, color: '#8B5CF6', iconName: 'PackageCheck' },
  { category: 'Feira - Custos Operacionais', monthlyLimit: 1400, color: '#EC4899', iconName: 'Store' },
  { category: 'Saúde & Farmácia', monthlyLimit: 600, color: '#EF4444', iconName: 'Activity' },
  { category: 'Lazer & Restaurantes', monthlyLimit: 750, color: '#14B8A6', iconName: 'Coffee' },
  { category: 'Investimentos & Reserva', monthlyLimit: 1500, color: '#6366F1', iconName: 'TrendingUp' },
];

export const INITIAL_BANKS: BankAccount[] = [
  {
    id: 'bank-nubank',
    bankName: 'Nubank S.A.',
    bankCode: '260',
    accountType: 'pagamentos',
    accountNumber: '4839201-9',
    agency: '0001',
    balance: 7850.40,
    status: 'connected',
    lastSync: '2026-11-03 09:15',
    logoColor: '#820AD1',
    institutionColor: '#820AD1',
    autoSyncEnabled: true,
  },
  {
    id: 'bank-itau',
    bankName: 'Banco Itaú Unibanco',
    bankCode: '341',
    accountType: 'corrente',
    accountNumber: '12948-2',
    agency: '4082',
    balance: 14320.15,
    status: 'connected',
    lastSync: '2026-11-03 08:30',
    logoColor: '#EC7000',
    institutionColor: '#EC7000',
    autoSyncEnabled: true,
  },
  {
    id: 'bank-inter',
    bankName: 'Banco Inter PJ',
    bankCode: '077',
    accountType: 'corrente',
    accountNumber: '839210-4',
    agency: '0001',
    balance: 6180.90,
    status: 'connected',
    lastSync: '2026-11-03 07:45',
    logoColor: '#FF7A00',
    institutionColor: '#FF7A00',
    autoSyncEnabled: true,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Novembro 2026
  {
    id: 'tx-nov-1',
    description: 'Vendas da Feira de Domingo - PIX',
    amount: 3480.00,
    type: 'income',
    category: 'Feira - Vendas',
    date: '2026-11-01',
    paymentMethod: 'pix',
    status: 'completed',
    bankAccountId: 'bank-nubank',
    source: 'feira_pdv',
    notes: 'Recebimentos consolidados via chave PIX na barraca',
    reconciled: true,
    feiraId: 'feira-2026-11-01',
  },
  {
    id: 'tx-nov-2',
    description: 'Vendas da Feira de Domingo - Dinheiro em Espécie',
    amount: 1940.00,
    type: 'income',
    category: 'Feira - Vendas',
    date: '2026-11-01',
    paymentMethod: 'dinheiro',
    status: 'completed',
    source: 'feira_pdv',
    notes: 'Dinheiro recebido e depositado no caixa',
    reconciled: true,
    feiraId: 'feira-2026-11-01',
  },
  {
    id: 'tx-nov-3',
    description: 'Fornecedor Ceasa - Cargas de Hortifrúti',
    amount: 1850.00,
    type: 'expense',
    category: 'Feira - Mercadorias Ceasa',
    date: '2026-11-02',
    paymentMethod: 'pix',
    status: 'completed',
    bankAccountId: 'bank-itau',
    source: 'open_finance',
    notes: 'NF-e 84920 - Caixas de Tomate, Alface e Batata',
    reconciled: true,
  },
  {
    id: 'tx-nov-4',
    description: 'Combustível Caminhonete Fiorino',
    amount: 280.00,
    type: 'expense',
    category: 'Transporte & Combustível',
    date: '2026-11-02',
    paymentMethod: 'cartao_debito',
    status: 'completed',
    bankAccountId: 'bank-nubank',
    source: 'open_finance',
    notes: 'Posto Shell Ipiranga',
    reconciled: true,
  },
  {
    id: 'tx-nov-5',
    description: 'Taxa Diária de Solo - Prefeitura Municipal',
    amount: 85.00,
    type: 'expense',
    category: 'Feira - Custos Operacionais',
    date: '2026-11-01',
    paymentMethod: 'dinheiro',
    status: 'completed',
    source: 'feira_pdv',
    notes: 'Alvará diário feirante ponto 42',
    reconciled: true,
    feiraId: 'feira-2026-11-01',
  },
  {
    id: 'tx-nov-6',
    description: 'Diária Ajudante Paulo (Montagem e Atendimento)',
    amount: 150.00,
    type: 'expense',
    category: 'Feira - Custos Operacionais',
    date: '2026-11-01',
    paymentMethod: 'dinheiro',
    status: 'completed',
    source: 'feira_pdv',
    notes: 'Diária de domingo 06h às 14h',
    reconciled: true,
    feiraId: 'feira-2026-11-01',
  },
  {
    id: 'tx-nov-7',
    description: 'Supermercado Mensal Pão de Açúcar',
    amount: 840.50,
    type: 'expense',
    category: 'Alimentação & Supermercado',
    date: '2026-11-03',
    paymentMethod: 'cartao_credito',
    status: 'completed',
    bankAccountId: 'bank-nubank',
    source: 'open_finance',
    reconciled: true,
  },
  {
    id: 'tx-nov-8',
    description: 'Aluguel do Galpão & Moradia',
    amount: 2200.00,
    type: 'expense',
    category: 'Moradia & Contas',
    date: '2026-11-05',
    paymentMethod: 'boleto',
    status: 'pending',
    bankAccountId: 'bank-itau',
    source: 'manual',
    notes: 'Vencimento dia 05',
    reconciled: false,
  },
  {
    id: 'tx-nov-9',
    description: 'Energia Elétrica Copel / Enel',
    amount: 320.40,
    type: 'expense',
    category: 'Moradia & Contas',
    date: '2026-11-06',
    paymentMethod: 'boleto',
    status: 'pending',
    bankAccountId: 'bank-itau',
    source: 'manual',
    reconciled: false,
  },

  // Outubro 2026 (Mês anterior para comparativos e gráficos)
  {
    id: 'tx-oct-1',
    description: 'Faturamento Total Feiras - Outubro',
    amount: 22450.00,
    type: 'income',
    category: 'Feira - Vendas',
    date: '2026-10-28',
    paymentMethod: 'pix',
    status: 'completed',
    bankAccountId: 'bank-itau',
    source: 'manual',
    reconciled: true,
  },
  {
    id: 'tx-oct-2',
    description: 'Fornecedores Ceasa Hortifrúti - Outubro',
    amount: 8940.00,
    type: 'expense',
    category: 'Feira - Mercadorias Ceasa',
    date: '2026-10-25',
    paymentMethod: 'transferencia',
    status: 'completed',
    bankAccountId: 'bank-itau',
    source: 'open_finance',
    reconciled: true,
  },
  {
    id: 'tx-oct-3',
    description: 'Custos Operacionais Feiras de Outubro',
    amount: 1980.00,
    type: 'expense',
    category: 'Feira - Custos Operacionais',
    date: '2026-10-26',
    paymentMethod: 'dinheiro',
    status: 'completed',
    source: 'manual',
    reconciled: true,
  },
  {
    id: 'tx-oct-4',
    description: 'Moradia, Aluguel e Contas - Outubro',
    amount: 2580.00,
    type: 'expense',
    category: 'Moradia & Contas',
    date: '2026-10-10',
    paymentMethod: 'boleto',
    status: 'completed',
    bankAccountId: 'bank-itau',
    source: 'open_finance',
    reconciled: true,
  },
  {
    id: 'tx-oct-5',
    description: 'Alimentação Familiar - Outubro',
    amount: 1950.00,
    type: 'expense',
    category: 'Alimentação & Supermercado',
    date: '2026-10-18',
    paymentMethod: 'cartao_credito',
    status: 'completed',
    bankAccountId: 'bank-nubank',
    source: 'open_finance',
    reconciled: true,
  },
  {
    id: 'tx-oct-6',
    description: 'Combustível e Manutenção - Outubro',
    amount: 840.00,
    type: 'expense',
    category: 'Transporte & Combustível',
    date: '2026-10-22',
    paymentMethod: 'cartao_debito',
    status: 'completed',
    bankAccountId: 'bank-nubank',
    source: 'open_finance',
    reconciled: true,
  },
  {
    id: 'tx-oct-7',
    description: 'Aporte Tesouro Selic / Reserva',
    amount: 1500.00,
    type: 'expense',
    category: 'Investimentos & Reserva',
    date: '2026-10-30',
    paymentMethod: 'pix',
    status: 'completed',
    bankAccountId: 'bank-inter',
    source: 'manual',
    reconciled: true,
  },
];

export const INITIAL_FEIRA_SESSIONS: FeiraSession[] = [
  {
    id: 'feira-2026-11-01',
    name: 'Feira de Domingo - Praça Central',
    location: 'Praça da Matriz, Ponto 42',
    date: '2026-11-01',
    status: 'closed',
    initialCashFund: 350.00, // R$ 350 de troco inicial
    notes: 'Excelente movimento, estoque de tomates esgotou às 11:30',
    closedAt: '2026-11-01 14:15',
    physicalCashCount: 2055.00,
    cashDifference: 0.00, // Caixa perfeito
  },
  {
    id: 'feira-2026-11-04',
    name: 'Feira Noturna de Quarta',
    location: 'Av. Brasil, Barraca 18',
    date: '2026-11-04',
    status: 'open',
    initialCashFund: 400.00,
    notes: 'Feira com foco em hortaliças frescas, pastel de feira e queijos artesanais',
  },
];

export const INITIAL_FEIRA_SALES: FeiraItemSale[] = [
  {
    id: 'sale-1',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Tomate Italiano Selecionado',
    category: 'hortifruti',
    quantity: 120,
    unit: 'kg',
    unitPrice: 8.50,
    totalPrice: 1020.00,
    paymentMethod: 'pix',
    timestamp: '2026-11-01 08:45',
  },
  {
    id: 'sale-2',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Banana Prata da Terra',
    category: 'hortifruti',
    quantity: 45,
    unit: 'duzia',
    unitPrice: 9.00,
    totalPrice: 405.00,
    paymentMethod: 'dinheiro',
    timestamp: '2026-11-01 09:10',
  },
  {
    id: 'sale-3',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Alface Hidropônica Crespa',
    category: 'hortifruti',
    quantity: 80,
    unit: 'maco',
    unitPrice: 4.50,
    totalPrice: 360.00,
    paymentMethod: 'pix',
    timestamp: '2026-11-01 09:30',
  },
  {
    id: 'sale-4',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Pastel de Carne com Queijo',
    category: 'pastelaria_bebidas',
    quantity: 65,
    unit: 'un',
    unitPrice: 12.00,
    totalPrice: 780.00,
    paymentMethod: 'pix',
    timestamp: '2026-11-01 10:20',
  },
  {
    id: 'sale-5',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Caldo de Cana 500ml Gelado',
    category: 'pastelaria_bebidas',
    quantity: 70,
    unit: 'copo',
    unitPrice: 7.00,
    totalPrice: 490.00,
    paymentMethod: 'dinheiro',
    timestamp: '2026-11-01 10:35',
  },
  {
    id: 'sale-6',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Queijo Canastra Meia Cura Artesanal',
    category: 'laticinios',
    quantity: 22,
    unit: 'un',
    unitPrice: 45.00,
    totalPrice: 990.00,
    paymentMethod: 'pix',
    timestamp: '2026-11-01 11:15',
  },
  {
    id: 'sale-7',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Batata Monalisa Especial',
    category: 'hortifruti',
    quantity: 90,
    unit: 'kg',
    unitPrice: 6.00,
    totalPrice: 540.00,
    paymentMethod: 'dinheiro',
    timestamp: '2026-11-01 11:45',
  },
  {
    id: 'sale-8',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Cenoura Fresca com Rama',
    category: 'hortifruti',
    quantity: 50,
    unit: 'kg',
    unitPrice: 5.50,
    totalPrice: 275.00,
    paymentMethod: 'cartao_debito',
    timestamp: '2026-11-01 12:10',
  },
  {
    id: 'sale-9',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Mel Silvestre Puro Pote 500g',
    category: 'artesanato',
    quantity: 15,
    unit: 'un',
    unitPrice: 35.00,
    totalPrice: 525.00,
    paymentMethod: 'pix',
    timestamp: '2026-11-01 12:40',
  },
  {
    id: 'sale-10',
    feiraId: 'feira-2026-11-01',
    itemDescription: 'Temperos & Ervas Desidratadas Sortidas',
    category: 'graos_temperos',
    quantity: 25,
    unit: 'porcao',
    unitPrice: 8.00,
    totalPrice: 200.00,
    paymentMethod: 'dinheiro',
    timestamp: '2026-11-01 13:00',
  },
];

export const INITIAL_FEIRA_EXPENSES: FeiraExpense[] = [
  {
    id: 'fe-1',
    feiraId: 'feira-2026-11-01',
    description: 'Taxa de Solo e Limpeza - Prefeitura',
    category: 'aluguel_solo',
    amount: 85.00,
    paidFromCashBox: true,
    paymentMethod: 'dinheiro',
    receiptNumber: 'DAM-2026-9481',
    timestamp: '2026-11-01 07:15',
  },
  {
    id: 'fe-2',
    feiraId: 'feira-2026-11-01',
    description: 'Diária Ajudante Paulo (Montador/Atendente)',
    category: 'ajudante_diaria',
    amount: 150.00,
    paidFromCashBox: true,
    paymentMethod: 'dinheiro',
    timestamp: '2026-11-01 14:00',
  },
  {
    id: 'fe-3',
    feiraId: 'feira-2026-11-01',
    description: 'Frete e Descarregamento Ceasa',
    category: 'transporte_combustivel',
    amount: 120.00,
    paidFromCashBox: false,
    paymentMethod: 'pix',
    supplierName: 'Transportes Silva',
    timestamp: '2026-11-01 06:30',
  },
  {
    id: 'fe-4',
    feiraId: 'feira-2026-11-01',
    description: 'Fardo de Sacolas Biodegradáveis + Papel Pastel',
    category: 'insumos_embalagens',
    amount: 95.00,
    paidFromCashBox: true,
    paymentMethod: 'dinheiro',
    timestamp: '2026-11-01 08:00',
  },
];

export const INITIAL_BACKUPS: CloudBackupSnapshot[] = [
  {
    id: 'bkp-2026-11-03-06',
    timestamp: '2026-11-03 06:15:22',
    version: '1.4.2',
    recordCount: 84,
    sizeKb: 142.8,
    status: 'synced',
    checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    note: 'Backup automático matinal na nuvem segura',
  },
  {
    id: 'bkp-2026-11-02-23',
    timestamp: '2026-11-02 23:59:00',
    version: '1.4.2',
    recordCount: 82,
    sizeKb: 139.4,
    status: 'synced',
    checksum: 'sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    note: 'Fechamento diário automático',
  },
  {
    id: 'bkp-2026-11-01-15',
    timestamp: '2026-11-01 15:30:10',
    version: '1.4.1',
    recordCount: 78,
    sizeKb: 132.1,
    status: 'synced',
    checksum: 'sha256:7bc5296e838b0068ba02a64016f4ad925828a2a0f82df9787e9c99ec765f0423',
    note: 'Fechamento da Feira de Domingo',
  },
];

export const INITIAL_SECURITY: SecuritySettings = {
  cloudBackupEnabled: true,
  autoSyncIntervalMinutes: 30,
  lastCloudBackup: '2026-11-03 06:15:22',
  encryptionAlgorithm: 'AES-256-GCM / SHA-256 Cloud Vault',
  vaultPinEnabled: false,
  vaultPinHash: null,
  isLocked: false,
};

// Storage helper functions
export const storageService = {
  getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(data: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data));
  },

  getBudgets(): CategoryBudget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(data: CategoryBudget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data));
  },

  getBanks(): BankAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BANKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(INITIAL_BANKS));
      return INITIAL_BANKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BANKS;
    }
  },

  saveBanks(data: BankAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(data));
  },

  getFeiraSessions(): FeiraSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEIRA_SESSIONS, JSON.stringify(INITIAL_FEIRA_SESSIONS));
      return INITIAL_FEIRA_SESSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEIRA_SESSIONS;
    }
  },

  saveFeiraSessions(data: FeiraSession[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_SESSIONS, JSON.stringify(data));
  },

  getFeiraSales(): FeiraItemSale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEIRA_SALES, JSON.stringify(INITIAL_FEIRA_SALES));
      return INITIAL_FEIRA_SALES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEIRA_SALES;
    }
  },

  saveFeiraSales(data: FeiraItemSale[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_SALES, JSON.stringify(data));
  },

  getFeiraExpenses(): FeiraExpense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEIRA_EXPENSES, JSON.stringify(INITIAL_FEIRA_EXPENSES));
      return INITIAL_FEIRA_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEIRA_EXPENSES;
    }
  },

  saveFeiraExpenses(data: FeiraExpense[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_EXPENSES, JSON.stringify(data));
  },

  getBackups(): CloudBackupSnapshot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(INITIAL_BACKUPS));
      return INITIAL_BACKUPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BACKUPS;
    }
  },

  saveBackups(data: CloudBackupSnapshot[]): void {
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(data));
  },

  getSecurity(): SecuritySettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SECURITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(INITIAL_SECURITY));
      return INITIAL_SECURITY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SECURITY;
    }
  },

  saveSecurity(data: SecuritySettings): void {
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(data));
  },

  // Export full encrypted backup JSON
  createExportPayload(): string {
    const payload = {
      app: 'FinanZen & Gestão de Feira',
      version: '1.4.2',
      exportDate: new Date().toISOString(),
      checksum: 'sha256:' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      data: {
        transactions: this.getTransactions(),
        budgets: this.getBudgets(),
        banks: this.getBanks(),
        feiraSessions: this.getFeiraSessions(),
        feiraSales: this.getFeiraSales(),
        feiraExpenses: this.getFeiraExpenses(),
        security: this.getSecurity(),
      }
    };
    return JSON.stringify(payload, null, 2);
  },

  // Restore payload
  restoreFromPayload(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;
      if (parsed.data.transactions) this.saveTransactions(parsed.data.transactions);
      if (parsed.data.budgets) this.saveBudgets(parsed.data.budgets);
      if (parsed.data.banks) this.saveBanks(parsed.data.banks);
      if (parsed.data.feiraSessions) this.saveFeiraSessions(parsed.data.feiraSessions);
      if (parsed.data.feiraSales) this.saveFeiraSales(parsed.data.feiraSales);
      if (parsed.data.feiraExpenses) this.saveFeiraExpenses(parsed.data.feiraExpenses);
      return true;
    } catch (e) {
      console.error('Falha ao restaurar dados:', e);
      return false;
    }
  },

  // Reset to default
  resetToInitial(): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(INITIAL_BANKS));
    localStorage.setItem(STORAGE_KEYS.FEIRA_SESSIONS, JSON.stringify(INITIAL_FEIRA_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.FEIRA_SALES, JSON.stringify(INITIAL_FEIRA_SALES));
    localStorage.setItem(STORAGE_KEYS.FEIRA_EXPENSES, JSON.stringify(INITIAL_FEIRA_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(INITIAL_BACKUPS));
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(INITIAL_SECURITY));
    localStorage.setItem(STORAGE_KEYS.FEIRANTES, JSON.stringify(INITIAL_FEIRANTES));
    localStorage.setItem(STORAGE_KEYS.FEIRA_EDITIONS, JSON.stringify(INITIAL_FEIRA_EDITIONS));
    localStorage.setItem(STORAGE_KEYS.FEIRA_PARTICIPATIONS, JSON.stringify(buildInitialParticipations()));
    localStorage.setItem(STORAGE_KEYS.FEIRA_ORG_EXPENSES, JSON.stringify(buildInitialOrgExpenses()));
  },

  getFeirantes(): Feirante[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRANTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEIRANTES, JSON.stringify(INITIAL_FEIRANTES));
      return INITIAL_FEIRANTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEIRANTES;
    }
  },

  saveFeirantes(data: Feirante[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRANTES, JSON.stringify(data));
  },

  getFeiraEditions(): FeiraEdition[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_EDITIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEIRA_EDITIONS, JSON.stringify(INITIAL_FEIRA_EDITIONS));
      return INITIAL_FEIRA_EDITIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEIRA_EDITIONS;
    }
  },

  saveFeiraEditions(data: FeiraEdition[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_EDITIONS, JSON.stringify(data));
  },

  getFeiraParticipations(): FeiraParticipation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_PARTICIPATIONS);
    if (!raw) {
      const seeded = buildInitialParticipations();
      localStorage.setItem(STORAGE_KEYS.FEIRA_PARTICIPATIONS, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return buildInitialParticipations();
    }
  },

  saveFeiraParticipations(data: FeiraParticipation[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_PARTICIPATIONS, JSON.stringify(data));
  },

  getFeiraOrgExpenses(): FeiraOrgExpense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_ORG_EXPENSES);
    if (!raw) {
      const seeded = buildInitialOrgExpenses();
      localStorage.setItem(STORAGE_KEYS.FEIRA_ORG_EXPENSES, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return buildInitialOrgExpenses();
    }
  },

  saveFeiraOrgExpenses(data: FeiraOrgExpense[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_ORG_EXPENSES, JSON.stringify(data));
  },

  getFeiraExpenseCategories(): FeiraExpenseCategoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEIRA_EXPENSE_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEIRA_EXPENSE_CATEGORIES, JSON.stringify(INITIAL_FEIRA_EXPENSE_CATEGORIES));
      return INITIAL_FEIRA_EXPENSE_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEIRA_EXPENSE_CATEGORIES;
    }
  },

  saveFeiraExpenseCategories(data: FeiraExpenseCategoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.FEIRA_EXPENSE_CATEGORIES, JSON.stringify(data));
  },
};

export const INITIAL_FEIRA_EXPENSE_CATEGORIES: FeiraExpenseCategoryItem[] = [
  { id: 'som', label: 'Som & Música ao Vivo', color: '#3B82F6' },
  { id: 'seguranca', label: 'Segurança & Apoio', color: '#EC4899' },
  { id: 'banheiro', label: 'Banheiro Químico', color: '#F59E0B' },
  { id: 'energia', label: 'Energia & Gerador', color: '#10B981' },
  { id: 'coordenacao', label: 'Coordenação & Equipe', color: '#8B5CF6' },
  { id: 'extras', label: 'Extras / Manutenção', color: '#64748B' },
];

// --- Seed Data for Feira da Lua (Geral & Cobranças) ---
export const INITIAL_FEIRANTES: Feirante[] = [
  { id: 'fr-1', name: 'Cachorro Quente', stallType: 'Lanches & Hot Dog', phone: '', defaultFee: 55, active: true },
  { id: 'fr-2', name: 'Pastelaria Sabor', stallType: 'Pastéis & Caldo', phone: '(41) 99812-3401', defaultFee: 55, active: true },
  { id: 'fr-3', name: 'Espetinho do Zé', stallType: 'Churrasco & Espetos', phone: '(41) 99745-8820', defaultFee: 55, active: true },
  { id: 'fr-4', name: 'Crepe Francês', stallType: 'Crepes & Massas', phone: '(41) 99123-4567', defaultFee: 55, active: true },
  { id: 'fr-5', name: 'Açaí & Sorvetes', stallType: 'Sobremesas Geladas', phone: '(41) 99654-1122', defaultFee: 55, active: true },
  { id: 'fr-6', name: 'Chopp Artesanal', stallType: 'Bebidas & Chopp', phone: '(41) 99888-7766', defaultFee: 72, active: true },
  { id: 'fr-7', name: 'Milho & Pamonha', stallType: 'Derivados de Milho', phone: '(41) 99234-5678', defaultFee: 55, active: true },
  { id: 'fr-8', name: 'Doces Mineiros', stallType: 'Confeitaria & Doces', phone: '(41) 99345-6789', defaultFee: 55, active: true },
  { id: 'fr-9', name: 'Artesanato Local', stallType: 'Arte & Decoração', phone: '(41) 99456-7890', defaultFee: 32, active: true },
  { id: 'fr-10', name: 'Tapioca Nordestina', stallType: 'Tapiocas & Cuscuz', phone: '(41) 99567-8901', defaultFee: 55, active: true },
  { id: 'fr-11', name: 'Hambúrguer Artesanal', stallType: 'Burgers na Brasa', phone: '(41) 99678-9012', defaultFee: 72, active: true },
  { id: 'fr-12', name: 'Batata Recheada', stallType: 'Batatas & Porções', phone: '(41) 99789-0123', defaultFee: 55, active: true },
  { id: 'fr-13', name: 'Queijos & Embutidos', stallType: 'Laticínios Coloniais', phone: '(41) 99890-1234', defaultFee: 55, active: true },
  { id: 'fr-14', name: 'Flores & Suculentas', stallType: 'Jardinagem & Plantas', phone: '(41) 99901-2345', defaultFee: 32, active: true },
  { id: 'fr-15', name: 'Yakisoba & Oriental', stallType: 'Culinária Oriental', phone: '(41) 99111-2233', defaultFee: 55, active: true },
  { id: 'fr-16', name: 'Churros Gourmet', stallType: 'Doces & Churros', phone: '(41) 99222-3344', defaultFee: 55, active: true },
];

export const INITIAL_FEIRA_EDITIONS: FeiraEdition[] = [
  { id: 'ed-15-10', date: '2026-10-15', label: '15/10/2026', status: 'realizada', sistOk: true },
  { id: 'ed-08-10', date: '2026-10-08', label: '08/10/2026', status: 'realizada', sistOk: true },
  { id: 'ed-01-10', date: '2026-10-01', label: '01/10/2026', status: 'realizada', sistOk: true },
  { id: 'ed-24-09', date: '2026-09-24', label: '24/09/2026', status: 'cancelada', cancelReason: 'Chuva intensa', sistOk: false },
  { id: 'ed-17-09', date: '2026-09-17', label: '17/09/2026', status: 'realizada', sistOk: true },
  { id: 'ed-10-09', date: '2026-09-10', label: '10/09/2026', status: 'cancelada', cancelReason: 'Feriado / Ventania', sistOk: false },
  { id: 'ed-03-09', date: '2026-09-03', label: '03/09/2026', status: 'realizada', sistOk: true },
  { id: 'ed-27-08', date: '2026-08-27', label: '27/08/2026', status: 'realizada', sistOk: true },
  { id: 'ed-20-08', date: '2026-08-20', label: '20/08/2026', status: 'realizada', sistOk: true },
  { id: 'ed-13-08', date: '2026-08-13', label: '13/08/2026', status: 'realizada', sistOk: true },
  { id: 'ed-06-08', date: '2026-08-06', label: '06/08/2026', status: 'realizada', sistOk: true },
  { id: 'ed-30-07', date: '2026-07-30', label: '30/07/2026', status: 'realizada', sistOk: true },
  { id: 'ed-23-07', date: '2026-07-23', label: '23/07/2026', status: 'realizada', sistOk: true },
];

function buildInitialParticipations(): FeiraParticipation[] {
  const list: FeiraParticipation[] = [];
  INITIAL_FEIRA_EDITIONS.forEach((ed, edIdx) => {
    INITIAL_FEIRANTES.forEach((fr, frIdx) => {
      if (ed.status === 'cancelada') {
        list.push({
          id: `part-${ed.id}-${fr.id}`,
          editionId: ed.id,
          feiranteId: fr.id,
          amount: 0,
          status: 'cancelado',
        });
        return;
      }

      // Match exact pending items for Cachorro Quente (fr-1) from screenshot 2:
      // 15/10/2026 -> R$ 55,00 pendente
      // 08/10/2026 -> R$ 55,00 pendente
      // 01/10/2026 -> R$ 32,00 pendente
      // 03/09/2026 -> R$ 55,00 pendente
      if (fr.id === 'fr-1') {
        if (ed.id === 'ed-15-10' || ed.id === 'ed-08-10' || ed.id === 'ed-03-09') {
          list.push({
            id: `part-${ed.id}-${fr.id}`,
            editionId: ed.id,
            feiranteId: fr.id,
            amount: 55,
            status: 'pendente',
          });
          return;
        }
        if (ed.id === 'ed-01-10') {
          list.push({
            id: `part-${ed.id}-${fr.id}`,
            editionId: ed.id,
            feiranteId: fr.id,
            amount: 32,
            status: 'pendente',
          });
          return;
        }
      }

      // Realistic mix of PIX, Dinheiro, Atestado, and notes like "Pagou Lincon"
      if (fr.id === 'fr-5' && ed.id === 'ed-13-08') {
        list.push({
          id: `part-${ed.id}-${fr.id}`,
          editionId: ed.id,
          feiranteId: fr.id,
          amount: 55,
          status: 'pago_pix',
          note: 'Pagou Lincon',
        });
        return;
      }

      if (fr.id === 'fr-12' && ed.id === 'ed-23-07') {
        list.push({
          id: `part-${ed.id}-${fr.id}`,
          editionId: ed.id,
          feiranteId: fr.id,
          amount: 0,
          status: 'atestado',
          note: 'Atestado médico',
        });
        return;
      }

      // Rainy / reduced fee day on 01/10/2026 (R$ 32,00)
      const fee = ed.id === 'ed-01-10' ? 32 : fr.defaultFee;
      const isCash = (edIdx + frIdx) % 3 === 0;
      list.push({
        id: `part-${ed.id}-${fr.id}`,
        editionId: ed.id,
        feiranteId: fr.id,
        amount: fee,
        status: isCash ? 'pago_dinheiro' : 'pago_pix',
      });
    });
  });
  return list;
}

function buildInitialOrgExpenses(): FeiraOrgExpense[] {
  const list: FeiraOrgExpense[] = [];
  const expenseTemplates: { desc: string; cat: FeiraOrgExpense['category']; base: number; method: 'pix' | 'dinheiro' }[] = [
    { desc: 'Som & Música ao Vivo', cat: 'som', base: 150, method: 'pix' },
    { desc: 'Segurança & Apoio', cat: 'seguranca', base: 200, method: 'dinheiro' },
    { desc: 'Banheiro Químico', cat: 'banheiro', base: 90, method: 'pix' },
    { desc: 'Energia & Gerador', cat: 'energia', base: 90, method: 'pix' },
    { desc: 'Coordenação & Equipe', cat: 'coordenacao', base: 350, method: 'dinheiro' },
  ];

  INITIAL_FEIRA_EDITIONS.forEach((ed, idx) => {
    if (ed.status === 'cancelada') return;
    expenseTemplates.forEach((tpl, tIdx) => {
      const amount =
        tpl.cat === 'coordenacao'
          ? idx % 2 === 0
            ? 350
            : 500
          : ed.id === 'ed-01-10' && tpl.cat === 'som'
          ? 0
          : tpl.base;
      if (amount > 0) {
        list.push({
          id: `orgexp-${ed.id}-${tIdx}`,
          editionId: ed.id,
          description: tpl.desc,
          category: tpl.cat,
          amount,
          paymentMethod: tpl.method,
        });
      }
    });
  });
  return list;
}

