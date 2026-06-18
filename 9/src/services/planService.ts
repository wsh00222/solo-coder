import { apiClient } from './apiClient';
import type { Plan, PlanWithItineraries, CreatePlanRequest, UpdatePlanRequest } from '../types';

export const planService = {
  getAllPlans: () => apiClient.get<Plan[]>('/plans'),
  getPlanById: (id: string) => apiClient.get<PlanWithItineraries>(`/plans/${id}`),
  createPlan: (data: CreatePlanRequest) => apiClient.post<Plan>('/plans', data),
  updatePlan: (id: string, data: UpdatePlanRequest) => apiClient.put<Plan>(`/plans/${id}`, data),
  deletePlan: (id: string) => apiClient.delete<{ message: string }>(`/plans/${id}`),
};
