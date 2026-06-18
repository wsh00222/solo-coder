export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type PlanStatus = 'upcoming' | 'ongoing' | 'ended';

export interface Plan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  companions?: string;
  budget?: number;
  notes?: string;
  createdAt: string;
}

export interface Itinerary {
  id: string;
  planId: string;
  date: string;
  timeSlot: TimeSlot;
  activity: string;
  location: string;
  transportation?: string;
  createdAt: string;
}

export interface PlanWithItineraries extends Plan {
  itineraries: Itinerary[];
}

export interface CreatePlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  companions?: string;
  budget?: number;
  notes?: string;
}

export interface UpdatePlanRequest extends CreatePlanRequest {}

export interface CreateItineraryRequest {
  date: string;
  timeSlot: TimeSlot;
  activity: string;
  location: string;
  transportation?: string;
}

export interface UpdateItineraryRequest extends CreateItineraryRequest {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
