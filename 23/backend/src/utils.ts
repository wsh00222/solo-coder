import { Activity, ActivityStatus } from './types';

export function getActivityStatus(activity: Activity): ActivityStatus {
  const now = new Date();
  const activityTime = new Date(activity.activityTime.replace(' ', 'T'));
  const deadline = new Date(activity.deadline.replace(' ', 'T'));

  if (now > activityTime) return 'ended';
  if (now > deadline) return 'closed';
  return 'registering';
}

export function parseDateTime(s: string): Date {
  return new Date(s.replace(' ', 'T'));
}

export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

export function isValidEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
