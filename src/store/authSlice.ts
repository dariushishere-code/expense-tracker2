import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';
import { storage, defaultCategories, defaultWallets } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialUsers = storage.getUsers();
const currentUserId = storage.getCurrentUserId();
const currentUser = currentUserId
  ? initialUsers.find((u) => u.id === currentUserId) || null
  : null;

const initialState: AuthState = {
  currentUser,
  isAuthenticated: !!currentUser,
  users: initialUsers,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signup: (
      state,
      action: PayloadAction<{ name: string; email: string; password: string }>
    ) => {
      const { name, email, password } = action.payload;
      const exists = state.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) {
        state.error = 'Email already registered';
        return;
      }
      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        password, // In real apps hash this
        createdAt: new Date().toISOString(),
      };
      state.users.push(newUser);
      state.currentUser = newUser;
      state.isAuthenticated = true;
      state.error = null;
      storage.saveUsers(state.users);
      storage.setCurrentUserId(newUser.id);

      // Seed default categories & wallets for new user
      const cats = storage.getCategories();
      const newCats = defaultCategories.map((c) => ({
        ...c,
        id: uuidv4(),
        userId: newUser.id,
      }));
      storage.saveCategories([...cats, ...newCats]);

      const wallets = storage.getWallets();
      const newWallets = defaultWallets.map((w) => ({
        ...w,
        id: uuidv4(),
        userId: newUser.id,
      }));
      storage.saveWallets([...wallets, ...newWallets]);
    },

    login: (
      state,
      action: PayloadAction<{ email: string; password: string }>
    ) => {
      const { email, password } = action.payload;
      const user = state.users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );
      if (!user) {
        state.error = 'Invalid email or password';
        return;
      }
      state.currentUser = user;
      state.isAuthenticated = true;
      state.error = null;
      storage.setCurrentUserId(user.id);
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      storage.setCurrentUserId(null);
    },

    clearError: (state) => {
      state.error = null;
    },

    updateProfile: (
      state,
      action: PayloadAction<{ name?: string; email?: string }>
    ) => {
      if (!state.currentUser) return;
      const idx = state.users.findIndex((u) => u.id === state.currentUser!.id);
      if (idx === -1) return;
      if (action.payload.name) {
        state.users[idx].name = action.payload.name;
        state.currentUser.name = action.payload.name;
      }
      if (action.payload.email) {
        state.users[idx].email = action.payload.email;
        state.currentUser.email = action.payload.email;
      }
      storage.saveUsers(state.users);
    },
  },
});

export const { signup, login, logout, clearError, updateProfile } =
  authSlice.actions;
export default authSlice.reducer;
