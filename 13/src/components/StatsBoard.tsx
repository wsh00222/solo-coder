import { useAppStore } from '../store/appStore';
import { Dumbbell, Calendar, Clock, Flame } from 'lucide-react';

export function StatsBoard() {
  const stats = useAppStore(s => s.stats);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 h-24 bg-gray-100" />
        ))}
      </div>
    );
  }

  const items = [
    { label: '总计划数', value: stats.total_plans, icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '本月训练次数', value: stats.month_records_count, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: '本月训练时长', value: `${stats.month_duration_hours}h`, icon: Clock, color: 'text-green-500', bg: 'bg-green-50' },
    { label: '连续训练天数', value: `${stats.current_streak_days}天`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {items.map(it => (
        <div key={it.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${it.bg}`}>
              <it.icon className={`w-5 h-5 ${it.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 truncate">{it.label}</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-0.5">{it.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
