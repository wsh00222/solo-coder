import { useState, useEffect, FormEvent } from 'react';
import { Activity, Registration } from '../types';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import RegisterForm from './RegisterForm';
import ActivityForm from './ActivityForm';
import { api } from '../api';

interface ActivityDetailProps {
  activityId: number;
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
  onChange: () => void;
}

const statusLabels: Record<string, string> = {
  registering: '报名中',
  closed: '已截止',
  ended: '已结束',
};

type ModalType = 'register' | 'cancel' | 'checkin' | 'edit' | 'delete' | null;

export default function ActivityDetail({
  activityId,
  onClose,
  onToast,
  onChange,
}: ActivityDetailProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const fetchData = async () => {
    try {
      const data = await api.getActivity(activityId);
      setActivity(data.activity);
      setRegistrations(data.registrations);
    } catch (e: any) {
      onToast(e.message || '加载失败', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activityId]);

  if (!activity) return null;

  const percent = Math.min(100, (activity.currentCount / activity.maxParticipants) * 100);
  const isFull = activity.currentCount >= activity.maxParticipants;
  const canRegister = activity.status === 'registering' && !isFull;

  const handleRegister = async (data: { name: string; phone: string; email?: string }) => {
    try {
      setLoading(true);
      await api.register(activityId, data);
      onToast('报名成功！', 'success');
      setModal(null);
      fetchData();
      onChange();
    } catch (e: any) {
      onToast(e.message || '报名失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!/^1[3-9]\d{9}$/.test(phoneInput)) {
      setPhoneError('请输入有效的手机号');
      return;
    }
    try {
      setLoading(true);
      await api.cancel(activityId, phoneInput);
      onToast('取消报名成功', 'success');
      setModal(null);
      setPhoneInput('');
      setPhoneError('');
      fetchData();
      onChange();
    } catch (e: any) {
      onToast(e.message || '取消失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!/^1[3-9]\d{9}$/.test(phoneInput)) {
      setPhoneError('请输入有效的手机号');
      return;
    }
    try {
      setLoading(true);
      await api.checkin(activityId, phoneInput);
      onToast('签到成功！', 'success');
      setModal(null);
      setPhoneInput('');
      setPhoneError('');
      fetchData();
    } catch (e: any) {
      onToast(e.message || '签到失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    try {
      setLoading(true);
      await api.updateActivity(activityId, data);
      onToast('活动已更新', 'success');
      setModal(null);
      fetchData();
      onChange();
    } catch (e: any) {
      onToast(e.message || '更新失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.deleteActivity(activityId);
      onToast('活动已删除', 'success');
      setModal(null);
      onChange();
      onClose();
    } catch (e: any) {
      onToast(e.message || '删除失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneForm = (onSubmit: () => void, submitText: string) => (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setPhoneError('');
        onSubmit();
      }}
    >
      <div className="form-group">
        <label>
          手机号 <span className="required">*</span>
        </label>
        <input
          type="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="请输入报名时使用的手机号"
          maxLength={11}
        />
      </div>
      {phoneError && <div className="form-error">{phoneError}</div>}
      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setModal(null);
            setPhoneInput('');
            setPhoneError('');
          }}
          disabled={loading}
        >
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '处理中...' : submitText}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <Modal title="活动详情" onClose={onClose} large>
        <div className="detail-content">
          <div className="detail-actions">
            {canRegister && (
              <button className="btn btn-primary" onClick={() => setModal('register')}>
                立即报名
              </button>
            )}
            {activity.status === 'registering' && isFull && (
              <button className="btn btn-secondary" disabled>
                已满
              </button>
            )}
            {activity.status !== 'ended' && (
              <button className="btn btn-secondary" onClick={() => setModal('cancel')}>
                取消报名
              </button>
            )}
            {activity.status === 'ended' && (
              <button className="btn btn-primary" onClick={() => setModal('checkin')}>
                签到
              </button>
            )}
            {activity.status === 'registering' && (
              <button className="btn btn-secondary" onClick={() => setModal('edit')}>
                编辑活动
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={() => setModal('delete')}
              style={{ marginLeft: 'auto' }}
            >
              删除活动
            </button>
          </div>

          <div className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ marginBottom: 0 }}>{activity.title}</h4>
              <span className={`status-tag status-${activity.status}`}>
                {statusLabels[activity.status]}
              </span>
            </div>

            <div className="detail-info" style={{ marginBottom: 16 }}>
              <div>
                <div className="info-label">活动时间</div>
                <div className="info-value">{activity.activityTime}</div>
              </div>
              <div>
                <div className="info-label">活动地点</div>
                <div className="info-value">{activity.location}</div>
              </div>
              <div>
                <div className="info-label">报名截止</div>
                <div className="info-value">{activity.deadline}</div>
              </div>
              <div>
                <div className="info-label">报名人数</div>
                <div className="info-value">
                  {activity.currentCount} / {activity.maxParticipants}
                </div>
              </div>
            </div>

            <div className="progress-label" style={{ marginBottom: 6 }}>
              <span>报名进度</span>
              <span>{percent.toFixed(0)}%</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: 16 }}>
              <div
                className={`progress-bar-inner ${isFull ? 'full' : ''}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div>
              <div className="info-label" style={{ marginBottom: 6, fontSize: 13 }}>活动描述</div>
              <div className="detail-description">{activity.description}</div>
            </div>
          </div>

          <div className="detail-section">
            <h4>报名名单 ({registrations.length})</h4>
            {registrations.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: 14 }}>暂无报名记录</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>手机号</th>
                      <th>邮箱</th>
                      <th>签到状态</th>
                      <th>报名时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.phone}</td>
                        <td>{r.email || '-'}</td>
                        <td>
                          <span
                            className={`checkin-badge ${r.checkedIn ? 'checkin-yes' : 'checkin-no'}`}
                          >
                            {r.checkedIn ? '已签到' : '未签到'}
                          </span>
                        </td>
                        <td>{r.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {modal === 'register' && (
        <Modal title="活动报名" onClose={() => setModal(null)}>
          <RegisterForm
            onSubmit={handleRegister}
            onCancel={() => setModal(null)}
            loading={loading}
          />
        </Modal>
      )}

      {modal === 'cancel' && (
        <Modal title="取消报名" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
            请输入报名时使用的手机号验证身份
          </p>
          {renderPhoneForm(handleCancel, '确认取消')}
        </Modal>
      )}

      {modal === 'checkin' && (
        <Modal title="活动签到" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
            请输入报名时使用的手机号进行签到
          </p>
          {renderPhoneForm(handleCheckin, '确认签到')}
        </Modal>
      )}

      {modal === 'edit' && (
        <Modal title="编辑活动" onClose={() => setModal(null)}>
          <ActivityForm
            initialData={activity}
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            loading={loading}
          />
        </Modal>
      )}

      {modal === 'delete' && (
        <ConfirmDialog
          title="确认删除"
          message="删除活动将同时删除所有报名记录，此操作不可恢复。确定要删除吗？"
          confirmText="确认删除"
          danger
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
