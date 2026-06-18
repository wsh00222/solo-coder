import axios from 'axios';
import type {
  Habit,
  HabitFormData,
  GlobalStats,
  HeatmapData,
  CheckinResponse,
  AuthResponse,
  LoginData,
  RegisterData,
  User,
} from '../types';

const TOKEN_KEY = 'habit_tracker_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout(): void {
    removeToken();
  },
};

export const habitApi = {
  async getAllHabits(): Promise<Habit[]> {
    const response = await api.get<Habit[]>('/habits');
    return response.data;
  },

  async getHabitById(id: number): Promise<Habit> {
    const response = await api.get<Habit>(`/habits/${id}`);
    return response.data;
  },

  async createHabit(data: HabitFormData): Promise<{ success: boolean; habit: Habit; message: string }> {
    const response = await api.post('/habits', data);
    return response.data;
  },

  async updateHabit(id: number, data: Partial<HabitFormData>): Promise<{ success: boolean; habit: Habit; message: string }> {
    const response = await api.put(`/habits/${id}`, data);
    return response.data;
  },

  async deleteHabit(id: number): Promise<{ success: boolean; stats: GlobalStats; message: string }> {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },

  async checkin(id: number, date?: string): Promise<CheckinResponse> {
    const response = await api.post(`/habits/${id}/checkin`, { date });
    return response.data;
  },

  async uncheckin(id: number, date?: string): Promise<CheckinResponse> {
    const response = await api.delete(`/habits/${id}/checkin`, { data: { date } });
    return response.data;
  },

  async getHeatmapData(id: number): Promise<{ habit: Habit; heatmapData: HeatmapData[] }> {
    const response = await api.get(`/habits/${id}/heatmap`);
    return response.data;
  },

  async getGlobalStats(): Promise<GlobalStats> {
    const response = await api.get('/habits/stats/global');
    return response.data;
  },

  async checkinAllToday(): Promise<{
    success: boolean;
    successCount: number;
    alreadyCount: number;
    totalCount: number;
    stats: GlobalStats;
    habits: Habit[];
    message: string;
  }> {
    const response = await api.post('/habits/checkin-all');
    return response.data;
  },
};
