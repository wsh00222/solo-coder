import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const priorityLabel = {
  high: '高',
  medium: '中',
  low: '低'
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff < oneDay) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const mins = Math.floor(diff / (60 * 1000));
      return mins <= 1 ? '刚刚' : `${mins} 分钟前`;
    }
    return `${hours} 小时前`;
  }
  const days = Math.floor(diff / oneDay);
  if (days < 7) return `${days} 天前`;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function TaskCard({ task, onUpdate, onDeleteRequest, isExiting }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status, task }
  });

  const style = {
    transform: CSS.Translate.toString(transform)
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  const handleDoubleClick = () => {
    if (isDragging) return;
    setIsEditing(true);
  };

  const handleBlur = () => {
    commitEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const commitEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card task-card-${task.status} ${isDragging ? 'dragging' : ''} ${isExiting ? 'slide-out' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-top">
        <span className={`priority-tag priority-${task.priority}`}>
          {priorityLabel[task.priority]}
        </span>
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(task);
          }}
          title="删除任务"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          className="task-title-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="task-title"
          onDoubleClick={handleDoubleClick}
          title="双击编辑标题"
        >
          {task.title}
        </div>
      )}

      {task.description && (
        <div className="task-description">{task.description}</div>
      )}

      <div className="task-meta">
        <span>创建于 {formatDate(task.created_at)}</span>
      </div>
    </div>
  );
}
