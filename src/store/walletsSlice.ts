import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Wallet } from '../types';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface WalletsState {
  items: Wallet[];
}

const initialState: WalletsState = {
  items: storage.getWallets(),
};

const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    addWallet: (state, action: PayloadAction<Omit<Wallet, 'id'>>) => {
      const newWallet: Wallet = {
        ...action.payload,
        id: uuidv4(),
      };
      state.items.push(newWallet);
      storage.saveWallets(state.items);
    },

    updateWallet: (
      state,
      action: PayloadAction<Partial<Wallet> & { id: string }>
    ) => {
      const idx = state.items.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
        storage.saveWallets(state.items);
      }
    },

    deleteWallet: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((w) => w.id !== action.payload);
      storage.saveWallets(state.items);
    },

    transferBetweenWallets: (
      state,
      action: PayloadAction<{
        fromId: string;
        toId: string;
        amount: number;
      }>
    ) => {
      const { fromId, toId, amount } = action.payload;
      const from = state.items.find((w) => w.id === fromId);
      const to = state.items.find((w) => w.id === toId);
      if (from && to && from.balance >= amount) {
        from.balance -= amount;
        to.balance += amount;
        storage.saveWallets(state.items);
      }
    },

    adjustBalance: (
      state,
      action: PayloadAction<{ id: string; amount: number; type: 'income' | 'expense' }>
    ) => {
      const wallet = state.items.find((w) => w.id === action.payload.id);
      if (wallet) {
        if (action.payload.type === 'income') {
          wallet.balance += action.payload.amount;
        } else {
          wallet.balance -= action.payload.amount;
        }
        storage.saveWallets(state.items);
      }
    },

    loadWallets: (state) => {
      state.items = storage.getWallets();
    },
  },
});

export const {
  addWallet,
  updateWallet,
  deleteWallet,
  transferBetweenWallets,
  adjustBalance,
  loadWallets,
} = walletsSlice.actions;
export default walletsSlice.reducer;
