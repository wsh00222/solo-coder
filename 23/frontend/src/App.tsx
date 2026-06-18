import { useState, useEffect, useCallback } from 'react';
import { Activity, Stats } from './types';
import { api } from './api';
import StatsBar from './components/StatsBar';
import ActivityCard from './components/ActivityCard';
import ActivityDetail from './components/ActivityDetail';
import ActivityForm from './components/ActivityForm';
import Modal from './components/Modal';
import Toast from './components/Toast';

type SortOrder = 'desc' | 'asc';
type StatusFilter = 'all' | 'registering' | 'closed' | 'ended';

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    registeringActivities: 0,
    totalRegistrations: 0,
  });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOrder>('desc');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const data = await api.getActivities({
        status: statusFilter,
        sort,
        keyword,
      });
      setActivities(data);
    } catch (e: any) {
      showToast(e.message || '加载活动失败', 'error');
    }
  }, [statusFilter, sort, keyword, showToast]);

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      // ignore
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadActivities();
    loadStats();
  }, [loadActivities, loadStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleCreate = async (data: any) => {
    try {
      setLoading(true);
      await api.createActivity(data);
      showToast('活动创建成功！', 'success');
      setShowCreate(false);
      refreshAll();
    } catch (e: any) {
      showToast(e.message || '创建失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>📋 活动报名管理</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + 新建活动
        </button>
      </div>

      <StatsBar stats={stats} />

      <div className="toolbar">
        <input
          type="text"
          placeholder="搜索活动标题..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">全部状态</option>
          <option value="registering">报名中</option>
          <option value="closed">已截止</option>
          <option value="ended">已结束</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
          <option value="desc">活动时间：最新优先</option>
          <option value="asc">活动时间：最早优先</option>
        </select>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>还没有任何活动</h3>
          <p>点击右上角的"新建活动"按钮来创建第一个活动吧！</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            创建第一个活动
          </button>
        </div>
      ) : (
        <div className="activities-grid">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => setSelectedId(activity.id)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="新建活动" onClose={() => setShowCreate(false)}>
          <ActivityForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            loading={loading}
          />
        </Modal>
      )}

      {selectedId !== null && (
        <ActivityDetail
          activityId={selectedId}
          onClose={() => setSelectedId(null)}
          onToast={showToast}
          onChange={refreshAll}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
