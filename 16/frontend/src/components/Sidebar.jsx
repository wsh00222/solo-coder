import { useNavigate } from 'react-router-dom';

export default function Sidebar({ attendees, selectedAttendee, onAttendeeClick }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        📅 会议日程
      </div>

      <div className="sidebar-section">
        <h3>参会人员统计</h3>
        {attendees.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#bfbfbf' }}>暂无数据</p>
        ) : (
          <ul className="attendee-list">
            {attendees.map(a => (
              <li
                key={a.name}
                className={`attendee-item ${selectedAttendee === a.name ? 'active' : ''}`}
                onClick={() => onAttendeeClick(a.name)}
              >
                <span className="attendee-name">{a.name}</span>
                <span className="attendee-count">{a.count}次</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-section">
        <h3>快捷操作</h3>
        <button
          className="btn btn-primary btn-sm"
          style={{ width: '100%', marginTop: '8px' }}
          onClick={() => navigate('/create')}
        >
          + 新建会议
        </button>
      </div>
    </aside>
  );
}
