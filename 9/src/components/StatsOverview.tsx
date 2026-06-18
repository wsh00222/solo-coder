import type { PlanStats } from '../types';
import { Map, CalendarClock, Compass } from 'lucide-react';

interface StatsOverviewProps {
  stats: PlanStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      label: '总计划数',
      value: stats.total,
      icon: Map,
      gradient: 'from-blue-400 to-blue-600',
      bgLight: 'bg-blue-50',
      delay: 0,
    },
    {
      label: '即将出发',
      value: stats.upcoming,
      icon: CalendarClock,
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'bg-amber-50',
      delay: 100,
    },
    {
      label: '正在进行',
      value: stats.ongoing,
      icon: Compass,
      gradient: 'from-emerald-400 to-green-600',
      bgLight: 'bg-emerald-50',
      delay: 200,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`relative overflow-hidden rounded-2xl p-6 ${item.bgLight} animate-stagger-in`}
            style={{ animationDelay: `${item.delay}ms`, opacity: 0 }}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-10`} />
            
            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                <p className="text-3xl font-display font-bold text-gray-900 mt-0.5">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
