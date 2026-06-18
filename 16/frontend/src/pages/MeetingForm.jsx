import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getMeeting, createMeeting, updateMeeting, checkConflict } from '../api.js';

export default function MeetingForm({ onDataChange }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;
  const copyData = location.state?.copyData;

  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    duration: 60,
    location: '',
    attendees: '',
    agenda: ''
  });
  const [conflicts, setConflicts] = useState([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadMeeting();
    } else if (copyData) {
      setFormData({
        title: copyData.title || '',
        startTime: copyData.startTime || '',
        duration: copyData.duration || 60,
        location: copyData.location || '',
        attendees: Array.isArray(copyData.attendees) ? copyData.attendees.join(', ') : (copyData.attendees || ''),
        agenda: copyData.agenda || ''
      });
    }
  }, [id, copyData, isEdit]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const data = await getMeeting(id);
      setFormData({
        title: data.title,
        startTime: data.startTime.slice(0, 16),
        duration: data.duration,
        location: data.location || '',
        attendees: data.attendees.join(', '),
        agenda: data.agenda || ''
      });
    } catch (e) {
      alert('获取会议信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!formData.title.trim()) {
      alert('请输入会议标题');
      return false;
    }
    if (!formData.startTime) {
      alert('请选择开始时间');
      return false;
    }
    if (!formData.duration || formData.duration <= 0) {
      alert('请输入有效的持续时间');
      return false;
    }
    return true;
  };

  const doSave = async (force = false) => {
    if (!validate()) return;

    const attendees = formData.attendees
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const data = {
      title: formData.title.trim(),
      startTime: formData.startTime,
      duration: parseInt(formData.duration),
      location: formData.location.trim(),
      attendees,
      agenda: formData.agenda,
      force
    };

    setSaving(true);
    try {
      let result;
      if (isEdit) {
        result = await updateMeeting(id, data);
      } else {
        result = await createMeeting(data);
      }

      if (result.hasConflict && result.conflicts && result.conflicts.length > 0) {
        setConflicts(result.conflicts);
        setShowConflictWarning(true);
        setSaving(false);
        return;
      }

      onDataChange && onDataChange();
      navigate(isEdit ? `/meetings/${id}` : `/meetings/${result.meeting.id}`);
    } catch (e) {
      alert(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSave(false);
  };

  const handleForceSave = () => {
    setShowConflictWarning(false);
    doSave(true);
  };

  if (loading) {
    return <p>加载中...</p>;
  }

  return (
    <div>
      <div className="back-link" onClick={() => navigate(-1)}>
        ← 返回
      </div>

      <div className="form-container">
        <h2 className="form-title">{isEdit ? '编辑会议' : (copyData ? '复制会议 - 请调整后保存' : '新建会议')}</h2>

        {showConflictWarning && conflicts.length > 0 && (
          <div className="conflict-warning">
            ⚠️ 时间冲突，以下会议与当前会议时间重叠：
            <ul>
              {conflicts.map(c => (
                <li key={c.id}>
                  {c.title}（{c.startTime.slice(5, 16)}，{c.duration}分钟）
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-danger btn-sm" onClick={handleForceSave}>
                强制保存
              </button>
              <button className="btn btn-sm" onClick={() => setShowConflictWarning(false)}>
                返回修改
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">会议标题 *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="请输入会议标题"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">开始时间 *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.startTime}
              onChange={e => handleChange('startTime', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">持续时间（分钟） *</label>
            <input
              type="number"
              className="form-input"
              value={formData.duration}
              onChange={e => handleChange('duration', e.target.value)}
              min="1"
              style={{ width: '150px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">地点（可选）</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="请输入会议地点"
            />
          </div>

          <div className="form-group">
            <label className="form-label">参会人员（多个姓名用逗号分隔）</label>
            <input
              type="text"
              className="form-input"
              value={formData.attendees}
              onChange={e => handleChange('attendees', e.target.value)}
              placeholder="例如：张三, 李四, 王五"
            />
          </div>

          <div className="form-group">
            <label className="form-label">会议议程</label>
            <textarea
              className="form-textarea"
              value={formData.agenda}
              onChange={e => handleChange('agenda', e.target.value)}
              placeholder="请输入会议议程..."
            />
            <div className="agenda-word-count">
              <span>{formData.agenda ? formData.agenda.length : 0} 字</span>
              {formData.agenda && formData.agenda.length > 200 && (
                <span className="long-badge">较长</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate(-1)}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
