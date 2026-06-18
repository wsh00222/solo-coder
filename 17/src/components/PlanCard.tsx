import { Flame, Calendar, Target, ChevronRight, CheckCircle2, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import type { PlanWithStats } from '../../shared/types.js';
import { formatDateCN, formatDuration } from '../utils/date';

interface PlanCardProps {
  plan: PlanWithStats;
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PlanCard({ plan, onClick, onView, onEdit, onDelete }: PlanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onView) {
      onView();
    }
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };
  const statusLabel = plan.status === 'active' ? '进行中' : '已结束';
  const statusColor =
    plan.status === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-600';

  const progressColor =
    plan.progress >= 80
      ? 'from-emerald-500 to-emerald-600'
      : plan.progress >= 50
      ? 'from-blue-500 to-blue-600'
      : plan.progress >= 20
      ? 'from-orange-500 to-orange-600'
      : 'from-rose-500 to-rose-600';

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${progressColor}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {plan.name}
              </h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {plan.goal}
            </p>
          </div>
          {(onView || onEdit || onDelete) ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                    {onView && (
                      <button
                        onClick={handleAction(onView)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={handleAction(onEdit)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        编辑
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={handleAction(onDelete)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
          )}
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDateCN(plan.startDate)} - {formatDateCN(plan.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>每日 {formatDuration(plan.dailyGoalMinutes)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-600 font-medium">学习进度</span>
            <span className="text-slate-800 font-bold">
              {plan.studiedDays}/{plan.totalDays} 天 ({plan.progress}%)
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(plan.progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {plan.currentStreak > 0 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-sm font-semibold text-orange-700">
                  连续 {plan.currentStreak} 天
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-full">
                <Flame className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">暂无连续记录</span>
              </div>
            )}
          </div>
          {plan.longestStreak > 0 && (
            <div className="text-xs text-slate-400">
              最长连续 {plan.longestStreak} 天
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlanCardList({
  plans,
  onPlanClick,
  loading,
}: {
  plans: PlanWithStats[];
  onPlanClick: (id: number) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <Target className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无学习计划</h3>
        <p className="text-slate-500">点击上方「新建计划」按钮开始创建你的第一个学习计划</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {plans.map((plan, index) => (
        <div
          key={plan.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PlanCard plan={plan} onClick={() => onPlanClick(plan.id)} />
        </div>
      ))}
    </div>
  );
}
