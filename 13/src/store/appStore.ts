import { create } from 'zustand';
import type { Plan, GlobalStats, ReminderLevel, Goal } from '../types';
import { planApi, statsApi } from '../services/api';

interface AppState {
  plans: Plan[];
  stats: GlobalStats | null;
  reminder: ReminderLevel | null;
  goalFilter: Goal | 'all';
  loading: boolean;
  message: { type: 'success' | 'error' | 'info'; text: string } | null;
  fetchPlans: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchReminder: () => Promise<void>;
  setGoalFilter: (g: Goal | 'all') => void;
  showMessage: (type: 'success' | 'error' | 'info', text: string) => void;
  clearMessage: () => void;
  refreshAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  plans: [],
  stats: null,
  reminder: null,
  goalFilter: 'all',
  loading: false,
  message: null,

  async fetchPlans() {
    const res = await planApi.getAll(get().goalFilter);
    if (res.success) set({ plans: res.data || [] });
  },

  async fetchStats() {
    const res = await statsApi.getGlobal();
    if (res.success) set({ stats: res.data || null });
  },

  async fetchReminder() {
    const res = await statsApi.getReminder();
    if (res.success) set({ reminder: res.data || null });
  },

  setGoalFilter(g) {
    set({ goalFilter: g });
    get().fetchPlans();
  },

  showMessage(type, text) {
    set({ message: { type, text } });
    setTimeout(() => set({ message: null }), 3000);
  },

  clearMessage() {
    set({ message: null });
  },

  async refreshAll() {
    await Promise.all([get().fetchPlans(), get().fetchStats(), get().fetchReminder()]);
  },
}));
