import { TrendingUp, BookOpen, Clock, Calendar, Flame } from 'lucide-react';
import { formatDuration } from '../utils/date';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: 'plans' | 'active' | 'today' | 'month' | 'streak';
  trend?: string;
}

const iconMap = {
  plans: BookOpen,
  active: TrendingUp,
  today: Clock,
  month: Calendar,
  streak: Flame,
};

const colorMap = {
  plans: 'from-blue-500 to-blue-600',
  active: 'from-emerald-500 to-emerald-600',
  today: 'from-orange-500 to-orange-600',
  month: 'from-purple-500 to-purple-600',
  streak: 'from-rose-500 to-rose-600',
};

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  const Icon = iconMap[icon];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[icon]}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
            {trend && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[icon]} bg-opacity-10`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsOverview {
  totalPlans: number;
  activePlans: number;
  todayStudyMinutes: number;
  monthStudyDays: number;
  longestGlobalStreak: number;
}

export function StatsGrid({ stats }: { stats: StatsOverview | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="总计划数"
        value={stats.totalPlans}
        icon="plans"
      />
      <StatsCard
        title="进行中计划"
        value={stats.activePlans}
        icon="active"
      />
      <StatsCard
        title="今日已学"
        value={formatDuration(stats.todayStudyMinutes)}
        icon="today"
      />
      <StatsCard
        title="本月学习天数"
        value={`${stats.monthStudyDays} 天`}
        icon="month"
      />
    </div>
  );
}
