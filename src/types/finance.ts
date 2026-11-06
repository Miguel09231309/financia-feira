export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'pix' 
  | 'dinheiro' 
  | 'cartao_credito' 
  | 'cartao_debito' 
  | 'boleto' 
  | 'transferencia';

export type TransactionStatus = 'completed' | 'pending';

export type TransactionSource = 'manual' | 'open_finance' | 'feira_pdv' | 'ofx_import';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  bankAccountId?: string;
  source: TransactionSource;
  notes?: string;
  reconciled?: boolean;
  feiraId?: string;
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number;
  color: string;
  iconName: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountType: 'corrente' | 'poupanca' | 'pagamentos';
  accountNumber: string;
  agency: string;
  balance: number;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSync: string;
  logoColor: string;
  autoSyncEnabled: boolean;
  institutionColor: string;
}

export interface FeiraSession {
  id: string;
  name: string;
  location: string;
  date: string; // YYYY-MM-DD
  status: 'open' | 'closed';
  initialCashFund: number; // Fundo de troco da gaveta
  notes?: string;
  closedAt?: string;
  physicalCashCount?: number;
  cashDifference?: number; // Sobra (+) ou Falta (-)
}

export type FeiraItemCategory = 
  | 'hortifruti' 
  | 'laticinios' 
  | 'pastelaria_bebidas' 
  | 'artesanato' 
  | 'graos_temperos' 
  | 'flores_mudas'
  | 'outros';

export interface FeiraItemSale {
  id: string;
  feiraId: string;
  itemDescription: string;
  category: FeiraItemCategory;
  quantity: number;
  unit: 'kg' | 'un' | 'duzia' | 'maco' | 'bandeja' | 'porcao' | 'copo' | 'litro';
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'fiado';
  clientName?: string;
  timestamp: string;
}

export type FeiraExpenseCategory = 
  | 'aluguel_solo' 
  | 'fornecedor_ceasa' 
  | 'ajudante_diaria' 
  | 'transporte_combustivel' 
  | 'insumos_embalagens' 
  | 'outros';

export interface FeiraExpense {
  id: string;
  feiraId: string;
  description: string;
  category: FeiraExpenseCategory;
  amount: number;
  paidFromCashBox: boolean; // se saiu do dinheiro vivo da gaveta da feira
  paymentMethod: 'dinheiro' | 'pix' | 'cartao';
  receiptNumber?: string;
  supplierName?: string;
  timestamp: string;
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  version: string;
  recordCount: number;
  sizeKb: number;
  status: 'synced' | 'pending';
  checksum: string;
  note?: string;
}

export interface SecuritySettings {
  cloudBackupEnabled: boolean;
  autoSyncIntervalMinutes: number;
  lastCloudBackup: string | null;
  encryptionAlgorithm: string;
  vaultPinEnabled: boolean;
  vaultPinHash: string | null;
  isLocked: boolean;
}

// --- Feira da Lua (Planilha Matriz, Feirantes, Recebimentos & Pagamentos) ---

export type FeiraCellStatus =
  | 'pago_pix'
  | 'pago_dinheiro'
  | 'pendente'
  | 'atestado'
  | 'ausente'
  | 'cancelado';

export interface Feirante {
  id: string;
  name: string;
  stallType: string;
  phone?: string;
  defaultFee: number;
  active: boolean;
}

export interface FeiraEdition {
  id: string;
  date: string; // YYYY-MM-DD
  label: string; // e.g. 15/10/2026
  status: 'realizada' | 'cancelada' | 'agendada';
  cancelReason?: string;
  sistOk?: boolean;
}

export interface FeiraParticipation {
  id: string;
  editionId: string;
  feiranteId: string;
  amount: number;
  status: FeiraCellStatus;
  note?: string;
}

export interface FeiraOrgExpense {
  id: string;
  editionId: string;
  description: string;
  category: 'som' | 'seguranca' | 'banheiro' | 'energia' | 'coordenacao' | 'extras';
  amount: number;
  paymentMethod: 'pix' | 'dinheiro';
}

