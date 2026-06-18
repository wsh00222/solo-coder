import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Table, Form, Input, Spin, Modal, message } from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  UserAddOutlined, ExportOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import CountdownBar from '../components/CountdownBar';
import ProgressBar from '../components/ProgressBar';
import ActivityFormModal from '../components/ActivityFormModal';
import RegisterModal from '../components/RegisterModal';
import CheckInModal from '../components/CheckInModal';
import { activityApi, registrationApi } from '../services/api';
import {
  getActivityStatus, getStatusText, isDeadlineSoon, formatDateTime, getActivityStatus as recheckStatus
} from '../utils/helpers';

const { confirm } = Modal;

export default function ActivityDetail({ refreshStats }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerForm] = Form.useForm();

  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);

  const [cancelPhone, setCancelPhone] = useState('');
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [cancelForm] = Form.useForm();

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await activityApi.getDetail(id);
      if (result.success) {
        const data = result.data;
        data.status = recheckStatus(data);
        setActivity(data);
      }
    } catch (err) {
      console.error('加载活动详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (activity) {
      const timer = setInterval(() => {
        setActivity(prev => prev ? { ...prev, status: getActivityStatus(prev) } : prev);
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [activity?.id]);

  const isFull = activity && activity.registered_count >= activity.max_participants;
  const canEdit = activity && activity.status === 'open';
  const canRegister = activity && activity.status === 'open';
  const canCheckIn = activity && activity.status === 'ended';
  const canExport = activity && activity.status === 'ended';

  const handleEdit = async (data) => {
    setEditSubmitting(true);
    try {
      const result = await activityApi.update(id, data);
      if (result.success) {
        message.success('活动已更新');
        setEditModalOpen(false);
        fetchDetail();
        refreshStats();
      }
    } catch (err) {
      message.error(err.message || '更新失败');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = () => {
    confirm({
      title: '确定删除该活动吗？',
      content: '删除后活动及其所有报名记录将被永久清除，无法恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await activityApi.delete(id);
          if (result.success) {
            message.success('活动已删除');
            refreshStats();
            navigate('/');
          }
        } catch (err) {
          message.error(err.message || '删除失败');
        }
      }
    });
  };

  const handleRegister = async (values) => {
    setRegisterSubmitting(true);
    try {
      const result = await activityApi.register(id, values);
      if (result.success) {
        setRegisterSuccess(true);
        setRegisterModalOpen(false);
        setTimeout(() => {
          setRegisterSuccess(false);
        }, 2000);
        message.success('报名成功！');
        fetchDetail();
        refreshStats();
      }
    } catch (err) {
      message.error(err.message || '报名失败');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const openCancelForm = () => {
    setCancelFormVisible(true);
    cancelForm.resetFields();
  };

  const handleCancelRegistration = async () => {
    try {
      const values = await cancelForm.validateFields();
      const phone = values.phone;
      const reg = activity.registrations.find(r => r.phone === phone);

      if (!reg) {
        message.error('未找到该手机号的报名记录');
        return;
      }

      confirm({
        title: '确定取消报名吗？',
        content: '释放的名额将可供他人报名。',
        okText: '确认取消',
        cancelText: '我再想想',
        onOk: async () => {
          try {
            const result = await registrationApi.cancel(reg.id);
            if (result.success) {
              message.success('已取消报名');
              setCancelFormVisible(false);
              setCancelPhone('');
              fetchDetail();
              refreshStats();
            }
          } catch (err) {
            message.error(err.message || '取消报名失败');
          }
        }
      });
    } catch (err) {}
  };

  const handleCheckIn = async (phone) => {
    setCheckInSubmitting(true);
    try {
      const result = await activityApi.checkIn(id, phone);
      if (result.success) {
        message.success('签到成功！');
        setCheckInModalOpen(false);
        fetchDetail();
        refreshStats();
      }
    } catch (err) {
      message.error(err.message || '签到失败');
    } finally {
      setCheckInSubmitting(false);
    }
  };

  const handleExport = () => {
    activityApi.exportCsv(id);
    message.success('正在导出报名名单...');
  };

  if (loading || !activity) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 140
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (v) => v || '-'
    },
    {
      title: '签到状态',
      dataIndex: 'checked_in',
      key: 'checked_in',
      width: 100,
      render: (v) => (
        <span className={`checkin-tag ${v ? 'checked' : 'unchecked'}`}>
          {v ? '✓ 已签到' : '未签到'}
        </span>
      )
    },
    {
      title: '报名时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v) => formatDateTime(v)
    }
  ];

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="back-btn"
        onClick={() => navigate('/')}
      >
        返回活动列表
      </Button>

      {isDeadlineSoon(activity.registration_deadline) && activity.status === 'open' && (
        <CountdownBar deadline={activity.registration_deadline} />
      )}

      <div className="detail-page">
        <div className="detail-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {activity.title}
              <Tag color={activity.status === 'open' ? 'green' : activity.status === 'closed' ? 'orange' : 'default'}>
                {getStatusText(activity.status)}
              </Tag>
            </h2>
            <div className="detail-meta">
              <span>🕐 {formatDateTime(activity.activity_time)}</span>
              <span>📍 {activity.location}</span>
              <span>⏰ 报名截止：{formatDateTime(activity.registration_deadline)}</span>
            </div>
          </div>
          <div className="detail-actions">
            {canEdit && (
              <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>编辑活动</Button>
            )}
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>删除活动</Button>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h3>活动信息</h3>
            <div className="description-text">
              {activity.description || '暂无活动描述'}
            </div>
            <div style={{ marginTop: 24 }}>
              <ProgressBar current={activity.registered_count} max={activity.max_participants} />
            </div>
          </div>

          <div className="detail-section">
            <h3>
              操作面板
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {canRegister && (
                registerSuccess ? (
                  <div className="success-animation" style={{ justifyContent: 'flex-start', height: 40 }}>
                    <span className="checkmark-icon">✓</span>
                    <span>报名成功</span>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserAddOutlined />}
                    onClick={() => setRegisterModalOpen(true)}
                    disabled={isFull}
                  >
                    {isFull ? '名额已满' : '立即报名'}
                  </Button>
                )
              )}

              {canCheckIn && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setCheckInModalOpen(true)}
                >
                  活动签到
                </Button>
              )}

              {canExport && (
                <Button
                  size="large"
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                >
                  导出 CSV
                </Button>
              )}

              {activity.status !== 'ended' && activity.registrations.length > 0 && (
                <>
                  <Button
                    size="large"
                    danger
                    onClick={openCancelForm}
                  >
                    取消报名
                  </Button>
                  {cancelFormVisible && (
                    <Form form={cancelForm} layout="inline" style={{ flexWrap: 'wrap', gap: 8 }}>
                      <Form.Item name="phone" rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }
                      ]}>
                        <Input placeholder="请输入报名手机号" style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" onClick={handleCancelRegistration}>确认取消</Button>
                      </Form.Item>
                      <Form.Item>
                        <Button onClick={() => setCancelFormVisible(false)}>取消</Button>
                      </Form.Item>
                    </Form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px' }}>
          <div className="detail-section">
            <h3>
              报名名单
              <Tag style={{ fontWeight: 'normal', marginLeft: 8 }}>
                共 {activity.registrations.length} 人，
                已签到 {activity.registrations.filter(r => r.checked_in).length} 人
              </Tag>
            </h3>
            <Table
              dataSource={activity.registrations}
              columns={columns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: '暂无报名记录' }}
            />
          </div>
        </div>
      </div>

      <ActivityFormModal
        open={editModalOpen}
        initialData={activity}
        onCancel={() => setEditModalOpen(false)}
        onSubmit={handleEdit}
        submitting={editSubmitting}
      />

      <RegisterModal
        open={registerModalOpen}
        isFull={isFull}
        onCancel={() => setRegisterModalOpen(false)}
        onSubmit={handleRegister}
        submitting={registerSubmitting}
      />

      <CheckInModal
        open={checkInModalOpen}
        onCancel={() => setCheckInModalOpen(false)}
        onSubmit={handleCheckIn}
        submitting={checkInSubmitting}
      />
    </div>
  );
}
