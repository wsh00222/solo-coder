import { Link } from 'react-router-dom';
import { Copy, Target, CalendarDays, TrendingUp } from 'lucide-react';
import type { Plan } from '../types';
import { GOAL_COLORS } from '../utils';
import { WeeklyProgressBar } from './WeeklyProgressBar';

interface PlanCardProps {
  plan: Plan;
  onDuplicate: (id: number) => void;
}

export function PlanCard({ plan, onDuplicate }: PlanCardProps) {
  const colors = GOAL_COLORS[plan.goal] || GOAL_COLORS['保持'];

  return (
    <div className={`group bg-white rounded-2xl p-5 shadow-sm border ${colors.border} hover:shadow-lg transition-all duration-300 relative`}>
      <Link to={`/plan/${plan.id}`} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
              {plan.name}
            </h3>
            <div className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              <Target className="w-3 h-3" />
              {plan.goal}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span>每周 <b className="text-gray-800">{plan.weekly_frequency}</b> 次</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span>进度 <b className="text-gray-800">{plan.total_records}</b> / {plan.expected_total} 次</span>
          </div>
        </div>

        <WeeklyProgressBar
          goal={plan.goal}
          done={plan.current_week_done}
          target={plan.current_week_target}
          progress={plan.current_week_progress}
        />
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); onDuplicate(plan.id); }}
        className="absolute bottom-4 right-4 p-2 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
        title="复制计划"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}
