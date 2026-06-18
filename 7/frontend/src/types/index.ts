export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: number;
  name: string;
  frequency_type: FrequencyType;
  frequency_count: number;
  color: string;
  created_at: string;
  updated_at: string;
  isCheckedToday: boolean;
  weekCount: number;
  targetCount: number;
  streak: number;
  progressPercent: number;
}

export interface HabitFormData {
  name: string;
  frequency_type: FrequencyType;
  frequency_count: number;
  color: string;
}

export interface HeatmapData {
  date: string;
  checked: boolean;
}

export interface GlobalStats {
  totalHabits: number;
  monthlyCheckins: number;
  maxStreak: number;
}

export interface CheckinResponse {
  success: boolean;
  habit?: Habit;
  date?: string;
  alreadyChecked?: boolean;
  message: string;
  error?: string;
  isBackfill?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type SortOption = 'created_at' | 'streak';

export type FilterColor = 'all' | string;

export type FilterFrequency = 'all' | FrequencyType;

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const COLOR_PALETTE = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
];

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}
