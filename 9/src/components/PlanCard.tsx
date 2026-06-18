import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '../types';
import { StatusBadge, SoonBadge } from './Badge';
import { getPlanStatus, isUpcomingSoon, formatBudget } from '../utils/planUtils';
import { formatDateRange, calculateDays } from '../utils/dateUtils';
import { Calendar, Users, MapPin, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: string) => void;
  index: number;
}

export function PlanCard({ plan, onDelete, index }: PlanCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const status = getPlanStatus(plan.startDate, plan.endDate);
  const isSoon = isUpcomingSoon(plan.startDate) && status === 'upcoming';
  const days = calculateDays(plan.startDate, plan.endDate);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(plan.id);
    }, 300);
  };

  const handleClick = () => {
    if (!isDeleting) {
      navigate(`/plan/${plan.id}`);
    }
  };

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden',
        'cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        'animate-stagger-in',
        isDeleting && 'animate-slide-out'
      )}
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
      onClick={handleClick}
    >
      {isSoon && (
        <div className="absolute top-3 right-3 z-10">
          <SoonBadge />
        </div>
      )}

      <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <h3 className="text-lg font-display font-semibold text-gray-900 truncate">
                {plan.destination}
              </h3>
            </div>
            <StatusBadge status={status} />
          </div>
          <button
            onClick={handleDelete}
            className={cn(
              'p-2 rounded-xl text-gray-400 opacity-0 group-hover:opacity-100 transition-all',
              'hover:bg-red-50 hover:text-red-500',
              'focus:opacity-100'
            )}
            title="删除计划"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="truncate">{formatDateRange(plan.startDate, plan.endDate)}</span>
            <span className="text-primary-600 font-medium">· {days}天</span>
          </div>

          {plan.companions && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="truncate">{plan.companions}</span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <p className={cn(
              'text-sm font-medium',
              plan.budget !== undefined && plan.budget !== null
                ? 'text-primary-600'
                : 'text-gray-400'
            )}>
              {formatBudget(plan.budget)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end text-primary-600 text-sm font-medium group-hover:text-primary-700">
          <span>查看详情</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}
