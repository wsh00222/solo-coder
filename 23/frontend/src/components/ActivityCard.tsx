import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

const statusLabels: Record<string, string> = {
  registering: '报名中',
  closed: '已截止',
  ended: '已结束',
};

export default function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const percent = Math.min(100, (activity.currentCount / activity.maxParticipants) * 100);
  const isFull = activity.currentCount >= activity.maxParticipants;

  return (
    <div className="activity-card" onClick={onClick}>
      <div className="card-header">
        <h3>{activity.title}</h3>
        <span className={`status-tag status-${activity.status}`}>
          {statusLabels[activity.status]}
        </span>
      </div>

      <div className="card-info">
        <div className="info-item">
          <span>📅</span>
          <span>{activity.activityTime}</span>
        </div>
        <div className="info-item">
          <span>📍</span>
          <span>{activity.location}</span>
        </div>
        <div className="info-item">
          <span>⏰</span>
          <span>报名截止：{activity.deadline}</span>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-label">
          <span>
            已报名 <strong>{activity.currentCount}</strong> / {activity.maxParticipants} 人
          </span>
          <span>{percent.toFixed(0)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-inner ${isFull ? 'full' : ''}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
