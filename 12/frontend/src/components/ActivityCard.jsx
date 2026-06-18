import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { getStatusText, isUrgent, formatDateTime } from '../utils/helpers';

export default function ActivityCard({ activity }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/activity/${activity.id}`);
  };

  return (
    <div className="activity-card" onClick={handleClick}>
      {isUrgent(activity.registration_deadline) && (
        <span className="urgent-badge">⚡ 即将截止</span>
      )}
      <span className={`status-badge ${activity.status}`}>
        {getStatusText(activity.status)}
      </span>
      <div className="activity-card-header">
        <h3>{activity.title}</h3>
      </div>
      <div className="activity-card-body">
        <div className="activity-info">
          <span className="info-icon">🕐</span>
          <span>{formatDateTime(activity.activity_time)}</span>
        </div>
        <div className="activity-info">
          <span className="info-icon">📍</span>
          <span>{activity.location}</span>
        </div>
        <div className="activity-info">
          <span className="info-icon">⏰</span>
          <span>报名截止：{formatDateTime(activity.registration_deadline)}</span>
        </div>
        <ProgressBar current={activity.registered_count} max={activity.max_participants} />
      </div>
    </div>
  );
}
