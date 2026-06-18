export type { Plan, Itinerary, PlanWithItineraries, PlanStatus, TimeSlot } from '@shared/types';
export type { CreatePlanRequest, UpdatePlanRequest, CreateItineraryRequest, UpdateItineraryRequest } from '@shared/types';
export type { ApiResponse } from '@shared/types';

export interface PlanStats {
  total: number;
  upcoming: number;
  ongoing: number;
}

export type SortOrder = 'asc' | 'desc';
export type FilterStatus = 'all' | PlanStatus;

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
