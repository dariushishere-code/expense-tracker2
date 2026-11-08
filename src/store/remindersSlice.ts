import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Reminder } from '../types';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface RemindersState {
  items: Reminder[];
}

const initialState: RemindersState = {
  items: storage.getReminders(),
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    addReminder: (state, action: PayloadAction<Omit<Reminder, 'id'>>) => {
      const newRem: Reminder = {
        ...action.payload,
        id: uuidv4(),
      };
      state.items.push(newRem);
      storage.saveReminders(state.items);
    },

    updateReminder: (
      state,
      action: PayloadAction<Partial<Reminder> & { id: string }>
    ) => {
      const idx = state.items.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
        storage.saveReminders(state.items);
      }
    },

    deleteReminder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((r) => r.id !== action.payload);
      storage.saveReminders(state.items);
    },

    loadReminders: (state) => {
      state.items = storage.getReminders();
    },
  },
});

export const { addReminder, updateReminder, deleteReminder, loadReminders } =
  remindersSlice.actions;
export default remindersSlice.reducer;
