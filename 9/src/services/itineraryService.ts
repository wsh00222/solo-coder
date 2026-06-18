import { apiClient } from './apiClient';
import type { Itinerary, CreateItineraryRequest, UpdateItineraryRequest } from '../types';

export const itineraryService = {
  getItineraries: (planId: string) =>
    apiClient.get<Itinerary[]>(`/plans/${planId}/itineraries`),
  
  checkConflicts: (planId: string, date: string, timeSlot: string, excludeId?: string) =>
    apiClient.get<{ hasConflict: boolean; conflicts: Itinerary[] }>(
      `/plans/${planId}/itineraries/conflicts?date=${date}&timeSlot=${timeSlot}${excludeId ? `&excludeId=${excludeId}` : ''}`
    ),
  
  createItinerary: (planId: string, data: CreateItineraryRequest) =>
    apiClient.post<Itinerary>(`/plans/${planId}/itineraries`, data),
  
  updateItinerary: (planId: string, id: string, data: UpdateItineraryRequest) =>
    apiClient.put<Itinerary>(`/plans/${planId}/itineraries/${id}`, data),
  
  deleteItinerary: (planId: string, id: string) =>
    apiClient.delete<{ message: string }>(`/plans/${planId}/itineraries/${id}`),
  
  copyItinerary: (planId: string, id: string) =>
    apiClient.post<Itinerary>(`/plans/${planId}/itineraries/${id}/copy`),
};
