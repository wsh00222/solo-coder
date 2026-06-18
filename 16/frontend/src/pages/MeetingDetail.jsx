import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeeting, deleteMeeting } from '../api.js';
import { formatDateTime, getCountdown } from '../utils.js';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function MeetingDetail({ onDataChange }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const data = await getMeeting(id);
      setMeeting(data);
    } catch (e) {
      alert('获取会议详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeeting(id);
      setDeleteModal(false);
      onDataChange && onDataChange();
      navigate('/');
    } catch (e) {
      alert('删除失败');
    }
  };

  const handleCopy = () => {
    if (!meeting) return;
    const d = new Date(meeting.startTime);
    d.setHours(d.getHours() + 1);
    const newStartTime = d.toISOString().slice(0, 16);
    const copyData = {
      title: meeting.title + '（副本）',
      startTime: newStartTime,
      duration: meeting.duration,
      location: meeting.location,
      attendees: meeting.attendees,
      agenda: meeting.agenda
    };
    navigate('/create', { state: { copyData } });
  };

  if (loading) {
    return <p>加载中...</p>;
  }

  if (!meeting) {
    return (
      <div className="empty-state">
        <h3>会议不存在</h3>
        <button className="btn btn-primary" onClick={() => navigate('/')}>返回列表</button>
      </div>
    );
  }

  const cd = getCountdown(meeting.startTime);
  const wordCount = meeting.agenda ? meeting.agenda.length : 0;
  const isLong = wordCount > 200;

  return (
    <div>
      <div className="back-link" onClick={() => navigate(-1)}>
        ← 返回
      </div>

      <div className="detail-container">
        <div className="detail-title">
          {meeting.title}
          <span
            className={`countdown-badge ${cd.isUpcoming ? 'upcoming' : ''} ${cd.isPast ? 'past' : ''}`}
            style={{ marginLeft: '12px', fontSize: '12px' }}
          >
            {cd.text}
          </span>
        </div>

        <div className="detail-section">
          <div className="detail-label">开始时间</div>
          <div className="detail-value">{formatDateTime(meeting.startTime)}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">持续时间</div>
          <div className="detail-value">{meeting.duration} 分钟</div>
        </div>

        {meeting.location && (
          <div className="detail-section">
            <div className="detail-label">地点</div>
            <div className="detail-value">📍 {meeting.location}</div>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-label">参会人员</div>
          <div className="attendee-tags">
            {meeting.attendees.length > 0 ? (
              meeting.attendees.map(a => (
                <span key={a} className="attendee-tag">{a}</span>
              ))
            ) : (
              <span style={{ color: '#bfbfbf' }}>无</span>
            )}
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-label">会议议程</div>
          <div className="detail-value agenda">
            {meeting.agenda || '暂无议程'}
          </div>
          <div className="agenda-word-count">
            <span>{wordCount} 字</span>
            {isLong && <span className="long-badge">较长</span>}
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn" onClick={handleCopy}>
            📋 复制
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/edit/${id}`)}>
            ✏️ 编辑
          </button>
          <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>
            🗑 删除
          </button>
        </div>
      </div>

      <ConfirmModal
        open={deleteModal}
        title="确认删除"
        content={`确定要删除会议"${meeting.title}"吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </div>
  );
}
