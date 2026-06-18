import React, { useState, useEffect, useCallback } from 'react';
import { Button, Select, Input, Empty, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ActivityCard from '../components/ActivityCard';
import ActivityFormModal from '../components/ActivityFormModal';
import { activityApi } from '../services/api';
import { getActivityStatus } from '../utils/helpers';

const { Search } = Input;

export default function ActivityList({ refreshStats }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [keyword, setKeyword] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const result = await activityApi.getList({
        status: statusFilter || undefined,
        sortOrder,
        keyword: keyword || undefined
      });
      if (result.success) {
        setActivities(result.data.map(a => ({ ...a, status: getActivityStatus(a) })));
      }
    } catch (err) {
      console.error('加载活动列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortOrder, keyword]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      const result = await activityApi.create(data);
      if (result.success) {
        setCreateModalOpen(false);
        fetchActivities();
        refreshStats();
      }
    } catch (err) {
      console.error('创建活动失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <Select
          placeholder="按状态筛选"
          style={{ width: 140 }}
          allowClear
          value={statusFilter || undefined}
          onChange={setStatusFilter}
          options={[
            { value: 'open', label: '报名中' },
            { value: 'closed', label: '已截止' },
            { value: 'ended', label: '已结束' }
          ]}
        />
        <Select
          placeholder="排序方式"
          style={{ width: 160 }}
          value={sortOrder}
          onChange={setSortOrder}
          options={[
            { value: 'desc', label: '活动时间：最新优先' },
            { value: 'asc', label: '活动时间：最早优先' }
          ]}
        />
        <Search
          placeholder="搜索活动标题"
          allowClear
          style={{ width: 240 }}
          prefix={<SearchOutlined />}
          onSearch={(value) => setKeyword(value)}
          onChange={(e) => !e.target.value && setKeyword('')}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          创建活动
        </Button>
        <span className="count-info">共 <b>{activities.length}</b> 个活动</span>
      </div>

      <Spin spinning={loading}>
        {activities.length === 0 && !loading ? (
          <div className="empty-state">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<h3>还没有任何活动</h3>}
            />
            <p>点击上方「创建活动」按钮，开启您的活动管理之旅</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              创建第一个活动
            </Button>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </Spin>

      <ActivityFormModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />
    </div>
  );
}
