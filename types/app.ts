export type AppRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'kyc_pending';
export type MetalType = 'gold' | 'silver';
export type PurchaseMode = 'amount' | 'grams';
export type AdjustmentType = 'credit' | 'debit';
export type TransactionType =
  | 'buy'
  | 'sell'
  | 'credit'
  | 'debit'
  | 'adjustment';
export type TransactionStatus = 'success' | 'pending' | 'failed';
export type ReportRange = 'daily' | 'weekly' | 'monthly' | 'custom';

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: AppRole;
  updatedAt: string;
};

export type CompanyProfile = {
  id: string;
  logoUrl: string | null;
  companyName: string;
  legalBusinessName: string;
  businessType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  supportPhone: string;
  email: string;
  supportEmail: string;
  gstNumber: string;
  panNumber: string;
  termsSummary: string;
  privacySummary: string;
  refundSummary: string;
  updatedAt: string;
};

export type DailyRate = {
  id: string;
  date: string;
  gold24kPerGram: number;
  gold22kPerGram: number;
  silver999PerGram: number;
  notes?: string;
  isActive: boolean;
  updatedAt: string;
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pan?: string;
  notes?: string;
  photoUrl?: string | null;
  status: UserStatus;
  kycStatus: 'verified' | 'pending' | 'rejected';
  goldBalanceGrams: number;
  silverBalanceGrams: number;
  lastTransactionAt?: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  customerId: string;
  customerName: string;
  type: TransactionType;
  metal: MetalType;
  amountInr: number;
  grams: number;
  ratePerGram: number;
  status: TransactionStatus;
  notes?: string;
  createdAt: string;
};

export type BalanceAdjustment = {
  customerId: string;
  metal: MetalType;
  adjustmentType: AdjustmentType;
  quantityGrams: number;
  reason: string;
  notes?: string;
};

export type DashboardStats = {
  todayCollection: number;
  weeklyCollection: number;
  monthlyCollection: number;
  totalGoldLocked: number;
  totalSilverLocked: number;
  totalCustomers: number;
  activeCustomers: number;
};

export type CollectionReport = {
  range: ReportRange;
  fromDate: string;
  toDate: string;
  totalCollection: number;
  totalGoldGrams: number;
  totalSilverGrams: number;
  transactionCount: number;
  transactions: Transaction[];
};
