import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../types';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface CategoriesState {
  items: Category[];
}

const initialState: CategoriesState = {
  items: storage.getCategories(),
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (
      state,
      action: PayloadAction<Omit<Category, 'id'>>
    ) => {
      const newCat: Category = {
        ...action.payload,
        id: uuidv4(),
      };
      state.items.push(newCat);
      storage.saveCategories(state.items);
    },

    updateCategory: (
      state,
      action: PayloadAction<Partial<Category> & { id: string }>
    ) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
        storage.saveCategories(state.items);
      }
    },

    deleteCategory: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
      storage.saveCategories(state.items);
    },

    loadCategories: (state) => {
      state.items = storage.getCategories();
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, loadCategories } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
