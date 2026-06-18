import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings, getUpcomingMeetings, exportCSV, deleteMeeting } from '../api.js';
import { formatTime, getCountdown, groupByDate, getWeekRange, formatDate } from '../utils.js';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function MeetingList({ selectedAttendee, onAttendeeChange, onDataChange, stats }) {
  const [meetings, setMeetings] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
    attendee: ''
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const navigate = useNavigate();

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        attendee: selectedAttendee || filters.attendee
      };
      const data = await getMeetings(params);
      setMeetings(data);
    } catch (e) {
      console.error('加载会议列表失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedAttendee]);

  const loadUpcoming = useCallback(async () => {
    try {
      const data = await getUpcomingMeetings();
      setUpcoming(data);
    } catch (e) {
      console.error('加载即将开始的会议失败', e);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
    loadUpcoming();
    const interval = setInterval(loadUpcoming, 60000);
    return () => clearInterval(interval);
  }, [loadMeetings, loadUpcoming]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCopy = (meeting) => {
    const d = new Date(meeting.startTime);
    d.setHours(d.getHours() + 1);
    const newStartTime = d.toISOString().slice(0, 16);
    const newTitle = meeting.title + '（副本）';

    const copyData = {
      title: newTitle,
      startTime: newStartTime,
      duration: meeting.duration,
      location: meeting.location,
      attendees: meeting.attendees,
      agenda: meeting.agenda
    };

    navigate('/create', { state: { copyData } });
  };

  const handleDeleteClick = (meeting) => {
    setDeleteModal({ open: true, id: meeting.id, title: meeting.title });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMeeting(deleteModal.id);
      setDeleteModal({ open: false, id: null, title: '' });
      loadMeetings();
      loadUpcoming();
      onDataChange && onDataChange();
    } catch (e) {
      alert('删除失败');
    }
  };

  const handleExport = async () => {
    try {
      const range = getWeekRange();
      await exportCSV({ startDate: range.start, endDate: range.end });
    } catch (e) {
      alert('导出失败');
    }
  };

  const groups = groupByDate(meetings);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">会议日程</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={handleExport}>
            📥 导出本周日程
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            + 新建会议
          </button>
        </div>
      </div>

      <div className="stats-board">
        <div className="stat-card">
          <div className="stat-label">本周会议总数</div>
          <div className="stat-value">{stats.weekTotal}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">今日会议数</div>
          <div className="stat-value">{stats.todayTotal}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">平均会议时长</div>
          <div className="stat-value">{stats.avgDuration} <span style={{ fontSize: '16px' }}>分钟</span></div>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="upcoming-section">
          <div className="upcoming-title">
            <span>⏰ 即将开始的会议</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal' }}>（30分钟内）</span>
          </div>
          {upcoming.map(m => {
            const cd = getCountdown(m.startTime);
            return (
              <div
                key={m.id}
                className="upcoming-card"
                onClick={() => navigate(`/meetings/${m.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h4>{m.title}</h4>
                  <div className="time">
                    🕐 {formatTime(m.startTime)} · {m.duration}分钟
                    {m.location && ` · 📍 ${m.location}`}
                  </div>
                </div>
                <span className="upcoming-badge">{cd.text}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-group">
          <label>日期范围：</label>
          <input
            type="date"
            className="filter-input"
            value={filters.startDate}
            onChange={e => handleFilterChange('startDate', e.target.value)}
          />
          <span>至</span>
          <input
            type="date"
            className="filter-input"
            value={filters.endDate}
            onChange={e => handleFilterChange('endDate', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>参会人：</label>
          <input
            type="text"
            className="filter-input"
            placeholder="输入姓名搜索"
            style={{ width: '120px' }}
            value={filters.attendee}
            onChange={e => handleFilterChange('attendee', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>搜索：</label>
          <input
            type="text"
            className="filter-input"
            placeholder="会议标题"
            style={{ width: '150px' }}
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </div>
        <button
          className="btn btn-sm"
          onClick={() => {
            setFilters({ startDate: '', endDate: '', search: '', attendee: '' });
            onAttendeeChange && onAttendeeChange('');
          }}
        >
          重置
        </button>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : meetings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>暂无会议</h3>
          <p>点击右上角"新建会议"开始创建你的第一个会议吧</p>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            + 创建会议
          </button>
        </div>
      ) : (
        <div>
          {groups.map(group => (
            <div key={group.date} className="timeline-group">
              <div className="timeline-date-header">{group.dateLabel}</div>
              {group.meetings.map(meeting => {
                const cd = getCountdown(meeting.startTime);
                return (
                  <div
                    key={meeting.id}
                    className={`meeting-card ${cd.isPast ? 'past' : ''}`}
                  >
                    <div
                      className="meeting-info"
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="meeting-title">{meeting.title}</div>
                      <div className="meeting-meta">
                        <span className="meta-item">🕐 {formatTime(meeting.startTime)}</span>
                        <span className="meta-item">⏱ {meeting.duration}分钟</span>
                        {meeting.location && (
                          <span className="meta-item">📍 {meeting.location}</span>
                        )}
                        {meeting.attendees.length > 0 && (
                          <span className="meta-item">
                            👥 {meeting.attendees.slice(0, 3).join('、')}
                            {meeting.attendees.length > 3 && `等${meeting.attendees.length}人`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="meeting-actions">
                      <span
                        className={`countdown-badge ${cd.isUpcoming ? 'upcoming' : ''} ${cd.isPast ? 'past' : ''}`}
                      >
                        {cd.text}
                      </span>
                      <button
                        className="btn btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(meeting);
                        }}
                        title="复制会议"
                      >
                        📋 复制
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteModal.open}
        title="确认删除"
        content={`确定要删除会议"${deleteModal.title}"吗？此操作不可撤销。`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, title: '' })}
      />
    </div>
  );
}
