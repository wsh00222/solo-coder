import '../styles/components/Statistics.css';

function Statistics({ books }) {
  const totalBooks = books.length;
  const wantCount = books.filter(b => b.status === '想读').length;
  const readingCount = books.filter(b => b.status === '在读').length;
  const readCount = books.filter(b => b.status === '读完').length;
  
  const avgRating = books.length > 0
    ? (books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: '总藏书量', value: totalBooks, icon: '📚', color: '#667eea', bg: '#eef1ff' },
    { label: '想读', value: wantCount, icon: '📌', color: '#3498db', bg: '#ebf5fb' },
    { label: '在读', value: readingCount, icon: '📖', color: '#e67e22', bg: '#fdf2e9' },
    { label: '读完', value: readCount, icon: '✅', color: '#27ae60', bg: '#eafaf1' },
    { label: '平均评分', value: avgRating, icon: '⭐', color: '#f39c12', bg: '#fef9e7' }
  ];

  return (
    <div className="statistics-grid">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stat-item"
          style={{ background: stat.bg }}
        >
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Statistics;
