import { cn } from '@/lib/utils';
import type { PlanStatus } from '../types';
import { getStatusLabel, getStatusColor } from '../utils/planUtils';

interface StatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

interface SoonBadgeProps {
  className?: string;
}

export function SoonBadge({ className }: SoonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-accent-500 text-white shadow-md',
        className
      )}
    >
      即将出发
    </span>
  );
}
