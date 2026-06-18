import { useState, useEffect, FormEvent } from 'react';
import { Activity } from '../types';

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

function formatForInput(s: string): string {
  if (!s) return '';
  return s.replace(' ', 'T').slice(0, 16);
}

function formatForSubmit(s: string): string {
  return s.replace('T', ' ');
}

export default function ActivityForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: ActivityFormProps) {
  const [title, setTitle] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setActivityTime(formatForInput(initialData.activityTime));
      setLocation(initialData.location);
      setDeadline(formatForInput(initialData.deadline));
      setMaxParticipants(initialData.maxParticipants);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('请输入活动标题');
    if (!activityTime) return setError('请选择活动时间');
    if (!location.trim()) return setError('请输入活动地点');
    if (!deadline) return setError('请选择报名截止时间');
    if (!maxParticipants || maxParticipants < 1) return setError('请输入有效的最大人数');
    if (!description.trim()) return setError('请输入活动描述');

    if (new Date(activityTime) <= new Date(deadline)) {
      return setError('活动时间必须晚于报名截止时间');
    }

    onSubmit({
      title: title.trim(),
      activityTime: formatForSubmit(activityTime),
      location: location.trim(),
      deadline: formatForSubmit(deadline),
      maxParticipants: Number(maxParticipants),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          活动标题 <span className="required">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入活动标题"
        />
      </div>

      <div className="form-group">
        <label>
          活动时间 <span className="required">*</span>
        </label>
        <input
          type="datetime-local"
          value={activityTime}
          onChange={(e) => setActivityTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          活动地点 <span className="required">*</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="请输入活动地点"
        />
      </div>

      <div className="form-group">
        <label>
          报名截止时间 <span className="required">*</span>
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          最大人数 <span className="required">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={maxParticipants}
          onChange={(e) =>
            setMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder="请输入最大报名人数"
        />
      </div>

      <div className="form-group">
        <label>
          活动描述 <span className="required">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请输入活动描述"
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '提交中...' : initialData ? '保存修改' : '创建活动'}
        </button>
      </div>
    </form>
  );
}
