import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import TaskColumn from './components/TaskColumn.jsx';
import TaskCard from './components/TaskCard.jsx';
import AddTaskModal from './components/AddTaskModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';

const STATUS_ORDER = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成'
};
const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低'
};

const EmptyBoardIllustration = () => (
  <svg className="empty-icon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" fill="#F0F4FF"/>
    <rect x="45" y="50" width="30" height="100" rx="6" fill="#E0E7FF"/>
    <rect x="85" y="50" width="30" height="100" rx="6" fill="#C7D2FE"/>
    <rect x="125" y="50" width="30" height="100" rx="6" fill="#A5B4FC"/>
    <rect x="49" y="60" width="22" height="14" rx="3" fill="#818CF8"/>
    <rect x="49" y="82" width="22" height="10" rx="3" fill="#6366F1"/>
    <rect x="89" y="60" width="22" height="14" rx="3" fill="#818CF8"/>
    <path d="M90 85 L99 94 L113 78" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M129 75 L138 84 L152 68" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M129 95 L138 104 L152 88" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="165" cy="38" r="14" fill="#6366F1"/>
    <path d="M165 31 L165 45 M158 38 L172 38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exitingIds, setExitingIds] = useState([]);
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data || []);
    } catch (err) {
      console.error('获取任务失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const counts = { todo: 0, in_progress: 0, done: 0 };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return { total, ...counts };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let list = [...tasks];
    if (filterPriority !== 'all') {
      list = list.filter((t) => t.priority === filterPriority);
    }
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? ta - tb : tb - ta;
    });
    return list;
  }, [tasks, filterPriority, sortOrder]);

  const tasksByStatus = useMemo(() => {
    const grouped = { todo: [], in_progress: [], done: [] };
    visibleTasks.forEach((t) => {
      if (grouped[t.status]) grouped[t.status].push(t);
    });
    return grouped;
  }, [visibleTasks]);

  const handleCreateTask = async (payload) => {
    const res = await axios.post('/api/tasks', payload);
    setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const prev = [...tasks];
      setTasks((ts) =>
        ts.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      await axios.put(`/api/tasks/${id}`, updates);
    } catch (err) {
      console.error('更新失败:', err);
      fetchTasks();
    }
  };

  const handleDeleteRequest = (task) => {
    setDeleteTarget(task);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setExitingIds((prev) => [...prev, id]);
    setTimeout(async () => {
      try {
        await axios.delete(`/api/tasks/${id}`);
      } catch (err) {
        console.error('删除失败:', err);
      }
      setTasks((ts) => ts.filter((t) => t.id !== id));
      setExitingIds((prev) => prev.filter((x) => x !== id));
    }, 300);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === Number(active.id));
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = Number(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overId = String(over.id);
    let newStatus = null;

    if (STATUS_ORDER.includes(overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id === Number(overId));
      if (overTask) newStatus = overTask.status;
    }

    if (!newStatus || newStatus === task.status) return;

    try {
      const prev = [...tasks];
      setTasks((ts) =>
        ts.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error('状态更新失败:', err);
      fetchTasks();
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">极简待办看板</h1>

        <div className="header-row">
          <div className="stats-row">
            <div className="stat-card stat-card-total">
              <div className="stat-label">全部任务</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card stat-card-todo">
              <div className="stat-label">待办</div>
              <div className="stat-value">{stats.todo}</div>
            </div>
            <div className="stat-card stat-card-in_progress">
              <div className="stat-label">进行中</div>
              <div className="stat-value">{stats.in_progress}</div>
            </div>
            <div className="stat-card stat-card-done">
              <div className="stat-label">已完成</div>
              <div className="stat-value">{stats.done}</div>
            </div>
          </div>

          <div className="controls-row">
            <div className="filter-group">
              <span className="control-label">优先级：</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">全部</option>
                <option value="high">🔴 高</option>
                <option value="medium">🟡 中</option>
                <option value="low">🟢 低</option>
              </select>
            </div>

            <div className="sort-group">
              <span className="control-label">创建时间：</span>
              <button
                className="sort-toggle-btn"
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                title="点击切换升序/降序"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    升序
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                    降序
                  </>
                )}
              </button>
            </div>

            <button
              className="add-task-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加任务
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>
          加载中...
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <EmptyBoardIllustration />
          <h2 className="empty-title">开始你的第一个任务吧</h2>
          <p className="empty-desc">
            还没有任何任务。<br />
            点击下方按钮创建你的第一个待办事项，保持高效！
          </p>
          <button
            className="empty-add-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            ✨ 创建第一个任务
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTask(null)}
        >
          <div className="board">
            {STATUS_ORDER.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onUpdateTask={handleUpdateTask}
                onDeleteRequest={handleDeleteRequest}
                exitingIds={exitingIds}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div style={{ pointerEvents: 'none' }}>
                <TaskCard
                  task={activeTask}
                  onUpdate={() => {}}
                  onDeleteRequest={() => {}}
                  isExiting={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        danger
        title="确认删除任务？"
        message={`删除后无法恢复，确定要删除「${deleteTarget?.title || ''}」吗？`}
        confirmText="删除"
        cancelText="取消"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
