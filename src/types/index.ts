export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  walletId: string;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  type: TransactionType | 'both';
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'credit' | 'other';
  color: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly';
  nextDate: string;
  walletId: string;
  isActive: boolean;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  reminders: Reminder[];
}
