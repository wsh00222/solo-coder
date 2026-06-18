import React from 'react';
import { getProgressColor } from '../utils/helpers';

export default function ProgressBar({ current, max }) {
  const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const color = getProgressColor(percent);

  return (
    <div className="progress-wrapper">
      <div className="progress-header">
        <span className="progress-count">报名 {current}/{max} 人</span>
        <span className="progress-percent">{percent.toFixed(0)}%</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${color === 'orange' ? 'orange' : color === 'red' ? 'red' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
