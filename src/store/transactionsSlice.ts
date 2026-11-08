import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Transaction } from '../types';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
}

const initialState: TransactionsState = {
  items: storage.getTransactions(),
  loading: false,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (
      state,
      action: PayloadAction<Omit<Transaction, 'id' | 'createdAt'>>
    ) => {
      const newTx: Transaction = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      state.items.push(newTx);
      storage.saveTransactions(state.items);
    },

    updateTransaction: (
      state,
      action: PayloadAction<Partial<Transaction> & { id: string }>
    ) => {
      const idx = state.items.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
        storage.saveTransactions(state.items);
      }
    },

    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
      storage.saveTransactions(state.items);
    },

    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
      storage.saveTransactions(state.items);
    },

    loadTransactions: (state) => {
      state.items = storage.getTransactions();
    },
  },
});

export const {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setTransactions,
  loadTransactions,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
