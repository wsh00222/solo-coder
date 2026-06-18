import { Activity, Registration, Stats } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

export const api = {
  getActivities: (params?: { status?: string; sort?: string; keyword?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.sort) qs.set('sort', params.sort);
    if (params?.keyword) qs.set('keyword', params.keyword);
    return request<Activity[]>(`/api/activities?${qs.toString()}`);
  },

  getStats: () => request<Stats>('/api/activities/stats'),

  getActivity: (id: number) =>
    request<{ activity: Activity; registrations: Registration[] }>(`/api/activities/${id}`),

  createActivity: (data: Partial<Activity>) =>
    request<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(data) }),

  updateActivity: (id: number, data: Partial<Activity>) =>
    request<Activity>(`/api/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteActivity: (id: number) =>
    request<{ success: boolean }>(`/api/activities/${id}`, { method: 'DELETE' }),

  register: (id: number, data: { name: string; phone: string; email?: string }) =>
    request<Registration>(`/api/activities/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancel: (id: number, phone: string) =>
    request<{ success: boolean }>(`/api/activities/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  checkin: (id: number, phone: string) =>
    request<{ success: boolean }>(`/api/activities/${id}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
};
