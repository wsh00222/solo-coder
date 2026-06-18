import type { Plan, TrainingRecord as Record, RecordsGroupedByWeek, GlobalStats, ReminderLevel, ChartItem, RecordFilters, Goal } from '../types';

interface ApiResp<T> {
  success: boolean;
  data?: T;
  error?: string;
  existed?: boolean;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResp<T>> {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return resp.json();
}

function buildQuery(params: { [key: string]: any }): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export const planApi = {
  getAll(goal?: Goal | 'all'): Promise<ApiResp<Plan[]>> {
    const qs = goal && goal !== 'all' ? `?goal=${goal}` : '';
    return request<Plan[]>(`/api/plans${qs}`);
  },

  getById(id: number): Promise<ApiResp<Plan>> {
    return request<Plan>(`/api/plans/${id}`);
  },

  create(data: { name: string; goal: Goal; weekly_frequency: number; start_date: string; end_date?: string | null }): Promise<ApiResp<Plan>> {
    return request<Plan>('/api/plans', { method: 'POST', body: JSON.stringify(data) });
  },

  update(id: number, data: { name?: string; goal?: Goal; weekly_frequency?: number; end_date?: string | null }): Promise<ApiResp<Plan>> {
    return request<Plan>(`/api/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  remove(id: number): Promise<ApiResp<void>> {
    return request<void>(`/api/plans/${id}`, { method: 'DELETE' });
  },

  duplicate(id: number): Promise<ApiResp<Plan>> {
    return request<Plan>(`/api/plans/${id}/duplicate`, { method: 'POST' });
  },
};

export const recordApi = {
  getByPlanId(planId: number, filters?: RecordFilters): Promise<ApiResp<{ grouped: RecordsGroupedByWeek[]; flat: Record[] }>> {
    const qs = buildQuery(filters || {});
    return request<{ grouped: RecordsGroupedByWeek[]; flat: Record[] }>(`/api/records/plan/${planId}${qs}`);
  },

  checkToday(planId: number, date: string): Promise<ApiResp<Record | null>> {
    return request<Record | null>(`/api/records/plan/${planId}/check-today?date=${date}`);
  },

  create(data: { plan_id: number; date: string; duration: number; content: string; feeling?: number | null }): Promise<ApiResp<Record> & { existed?: boolean }> {
    return request<Record>('/api/records', { method: 'POST', body: JSON.stringify(data) });
  },

  remove(id: number): Promise<ApiResp<void>> {
    return request<void>(`/api/records/${id}`, { method: 'DELETE' });
  },
};

export const statsApi = {
  getGlobal(filters?: RecordFilters & { planId?: number }): Promise<ApiResp<GlobalStats>> {
    const qs = buildQuery(filters || {});
    return request<GlobalStats>(`/api/stats/global${qs}`);
  },

  getReminder(): Promise<ApiResp<ReminderLevel>> {
    return request<ReminderLevel>('/api/stats/reminder');
  },

  getLast7DaysChart(planId?: number): Promise<ApiResp<ChartItem[]>> {
    const qs = planId ? `?planId=${planId}` : '';
    return request<ChartItem[]>(`/api/stats/last7days${qs}`);
  },
};
