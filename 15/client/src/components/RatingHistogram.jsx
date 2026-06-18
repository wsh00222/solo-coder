import React from 'react';

export default function RatingHistogram({ distribution }) {
  if (!distribution) {
    return <div className="histo-empty">加载中...</div>;
  }
  const entries = Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0]));
  const max = Math.max(...entries.map(e => e[1]), 1);
  const total = entries.reduce((s, e) => s + e[1], 0);

  if (total === 0) {
    return <div className="histo-empty">暂无评分数据</div>;
  }

  return (
    <div className="histogram">
      {entries.map(([rating, count]) => (
        <div key={rating} className="histo-bar">
          <div className="histo-rating">{rating}</div>
          <div className="histo-track">
            <div
              className="histo-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <div className="histo-count">{count}</div>
        </div>
      ))}
    </div>
  );
}
