import { create } from 'zustand';
import type { ToastItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  
  showToast: (message, type = 'info') => {
    const id = uuidv4();
    set(state => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },
  
  success: (message) => get().showToast(message, 'success'),
  error: (message) => get().showToast(message, 'error'),
  info: (message) => get().showToast(message, 'info'),
  warning: (message) => get().showToast(message, 'warning'),
}));
