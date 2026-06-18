export type Goal = '增肌' | '减脂' | '保持';

export interface Plan {
  id: number;
  name: string;
  goal: Goal;
  weekly_frequency: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  total_records: number;
  expected_total: number;
  current_week_done: number;
  current_week_target: number;
  current_week_progress: number;
}

export interface TrainingRecord {
  id: number;
  plan_id: number;
  date: string;
  duration: number;
  content: string;
  feeling: number | null;
  created_at: string;
  updated_at: string;
}

export { TrainingRecord as Record };

export interface RecordsGroupedByWeek {
  weekStart: string;
  weekEnd: string;
  records: TrainingRecord[];
}

export interface GlobalStats {
  total_plans: number;
  month_records_count: number;
  month_duration_hours: number;
  current_streak_days: number;
  days_without_training: number;
}

export interface ReminderLevel {
  level: 'none' | 'warning' | 'danger';
  message: string | null;
}

export interface ChartItem {
  date: string;
  duration: number;
}

export interface RecordFilters {
  startDate?: string;
  endDate?: string;
  minFeeling?: number;
}
