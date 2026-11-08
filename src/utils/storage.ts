import type { User, Transaction, Category, Wallet, Reminder } from '../types';

const KEYS = {
  USERS: 'et_users',
  TRANSACTIONS: 'et_transactions',
  CATEGORIES: 'et_categories',
  WALLETS: 'et_wallets',
  REMINDERS: 'et_reminders',
  CURRENT_USER: 'et_current_user',
};

export const storage = {
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUserId: (): string | null => {
    return localStorage.getItem(KEYS.CURRENT_USER);
  },

  setCurrentUserId: (id: string | null) => {
    if (id) {
      localStorage.setItem(KEYS.CURRENT_USER, id);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getWallets: (): Wallet[] => {
    try {
      const data = localStorage.getItem(KEYS.WALLETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWallets: (wallets: Wallet[]) => {
    localStorage.setItem(KEYS.WALLETS, JSON.stringify(wallets));
  },

  getReminders: (): Reminder[] => {
    try {
      const data = localStorage.getItem(KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveReminders: (reminders: Reminder[]) => {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  },
};

export const defaultCategories: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Food', color: '#ef4444', type: 'expense', icon: '🍔' },
  { name: 'Transport', color: '#3b82f6', type: 'expense', icon: '🚗' },
  { name: 'Bills', color: '#f59e0b', type: 'expense', icon: '📄' },
  { name: 'Entertainment', color: '#8b5cf6', type: 'expense', icon: '🎬' },
  { name: 'Shopping', color: '#ec4899', type: 'expense', icon: '🛍️' },
  { name: 'Health', color: '#10b981', type: 'expense', icon: '🏥' },
  { name: 'Salary', color: '#22c55e', type: 'income', icon: '💰' },
  { name: 'Freelance', color: '#14b8a6', type: 'income', icon: '💻' },
  { name: 'Investment', color: '#6366f1', type: 'income', icon: '📈' },
  { name: 'Other', color: '#64748b', type: 'both', icon: '📦' },
];

export const defaultWallets: Omit<Wallet, 'id' | 'userId'>[] = [
  { name: 'Cash', balance: 0, type: 'cash', color: '#22c55e' },
  { name: 'Bank Account', balance: 0, type: 'bank', color: '#3b82f6' },
  { name: 'Credit Card', balance: 0, type: 'credit', color: '#f59e0b' },
];
