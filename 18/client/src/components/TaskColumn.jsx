import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard.jsx';

const columnConfig = {
  todo: {
    title: '待办',
    emptyText: '还没有待办任务\n拖拽其他列的任务到这里',
    icon: '📋'
  },
  in_progress: {
    title: '进行中',
    emptyText: '暂无进行中的任务\n开始一项新任务吧',
    icon: '🚀'
  },
  done: {
    title: '已完成',
    emptyText: '还没有完成的任务\n加油，胜利就在前方',
    icon: '🎉'
  }
};

export default function TaskColumn({
  status,
  tasks,
  onUpdateTask,
  onDeleteRequest,
  exitingIds
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  });

  const config = columnConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={`column column-${status} ${isOver ? 'drag-over' : ''}`}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="dot"></span>
          {config.title}
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="column-body">
        {tasks.length === 0 ? (
          <div className="column-empty">
            <div className="column-empty-icon">{config.icon}</div>
            <div style={{ whiteSpace: 'pre-line' }}>{config.emptyText}</div>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDeleteRequest={onDeleteRequest}
              isExiting={exitingIds.includes(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
