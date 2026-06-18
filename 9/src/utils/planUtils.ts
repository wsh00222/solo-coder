import type { Plan, PlanStatus, PlanStats, Itinerary, TimeSlot } from '../types';
import { isWithinDays } from './dateUtils';

export function getPlanStatus(startDate: string, endDate: string): PlanStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (today < start) return 'upcoming';
  if (today > end) return 'ended';
  return 'ongoing';
}

export function getStatusLabel(status: PlanStatus): string {
  const labels: Record<PlanStatus, string> = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束',
  };
  return labels[status];
}

export function getStatusColor(status: PlanStatus): string {
  const colors: Record<PlanStatus, string> = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    ongoing: 'bg-green-100 text-green-700 border-green-200',
    ended: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return colors[status];
}

export function isUpcomingSoon(startDate: string): boolean {
  return isWithinDays(startDate, 3);
}

export function calculateStats(plans: Plan[]): PlanStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let upcoming = 0;
  let ongoing = 0;

  plans.forEach(plan => {
    const status = getPlanStatus(plan.startDate, plan.endDate);
    if (status === 'ongoing') ongoing++;
    if (status === 'upcoming' && isWithinDays(plan.startDate, 7)) upcoming++;
  });

  return {
    total: plans.length,
    upcoming,
    ongoing,
  };
}

export function getTimeSlotLabel(slot: TimeSlot): string {
  const labels: Record<TimeSlot, string> = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
  };
  return labels[slot];
}

export function getTimeSlotOrder(slot: TimeSlot): number {
  const order: Record<TimeSlot, number> = {
    morning: 0,
    afternoon: 1,
    evening: 2,
  };
  return order[slot];
}

export function groupItinerariesByDate(itineraries: Itinerary[]): Record<string, Itinerary[]> {
  const groups: Record<string, Itinerary[]> = {};
  
  itineraries.forEach(item => {
    if (!groups[item.date]) {
      groups[item.date] = [];
    }
    groups[item.date].push(item);
  });

  Object.keys(groups).forEach(date => {
    groups[date].sort((a, b) => getTimeSlotOrder(a.timeSlot) - getTimeSlotOrder(b.timeSlot));
  });

  return groups;
}

export function findConflicts(
  itineraries: Itinerary[],
  date: string,
  timeSlot: TimeSlot,
  excludeId?: string
): Itinerary[] {
  return itineraries.filter(
    item => item.date === date && item.timeSlot === timeSlot && item.id !== excludeId
  );
}

export function formatBudget(budget?: number): string {
  if (budget === undefined || budget === null) return '预算未设置';
  return `预算：¥${budget.toLocaleString()}`;
}
