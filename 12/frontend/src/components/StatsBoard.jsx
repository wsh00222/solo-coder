import React from 'react';

export default function StatsBoard({ stats }) {
  const items = [
    { label: '总活动数', value: stats.totalActivities || 0, icon: '📅', className: 'stat-1' },
    { label: '报名中活动', value: stats.openActivities || 0, icon: '✅', className: 'stat-2' },
    { label: '总报名人次', value: stats.totalRegistrations || 0, icon: '👥', className: 'stat-3' },
    { label: '已签到人次', value: stats.checkedInCount || 0, icon: '📝', className: 'stat-4' }
  ];

  return (
    <div className="stats-board">
      {items.map((item, idx) => (
        <div key={idx} className={`stat-card ${item.className}`}>
          <div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
          </div>
          <div className="stat-icon">{item.icon}</div>
        </div>
      ))}
    </div>
  );
}
