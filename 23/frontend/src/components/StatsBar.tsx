import { Stats } from '../types';

interface StatsBarProps {
  stats: Stats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-value">{stats.totalActivities}</div>
        <div className="stat-label">总活动数</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: '#16a34a' }}>
          {stats.registeringActivities}
        </div>
        <div className="stat-label">报名中活动</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: '#7c3aed' }}>
          {stats.totalRegistrations}
        </div>
        <div className="stat-label">总报名人次</div>
      </div>
    </div>
  );
}
