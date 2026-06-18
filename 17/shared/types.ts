export interface Plan {
  id: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  dailyGoalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Record {
  id: number;
  planId: number;
  date: string;
  durationMinutes: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanWithStats extends Plan {
  totalDays: number;
  studiedDays: number;
  progress: number;
  currentStreak: number;
  longestStreak: number;
  daysSinceLastStudy: number;
  status: 'active' | 'completed';
}

export interface StatsOverview {
  totalPlans: number;
  activePlans: number;
  todayStudyMinutes: number;
  monthStudyDays: number;
  longestGlobalStreak: number;
}

export interface Alert {
  planId: number;
  planName: string;
  days: number;
  severity: 'warning' | 'danger';
}

export interface TrendDataPoint {
  date: string;
  minutes: number;
}

export interface CreatePlanDto {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  dailyGoalMinutes: number;
}

export interface UpdatePlanDto {
  name?: string;
  goal?: string;
  endDate?: string;
  dailyGoalMinutes?: number;
}

export interface CreateRecordDto {
  date: string;
  durationMinutes: number;
  content: string;
}

export interface UpdateRecordDto {
  durationMinutes?: number;
  content?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
