import React, { useState } from 'react';
import type { Habit } from '../types';
import { FREQUENCY_LABELS } from '../types';
import ConfirmModal from './ConfirmModal';
import BackfillModal from './BackfillModal';
import HeatmapModal from './HeatmapModal';

interface HabitCardProps {
  habit: Habit;
  onCheckin: (habitId: number) => void;
  onBackfill: (habitId: number, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
  onAnimationEnd?: (habitId: number) => void;
  isDeleting?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onCheckin,
  onBackfill,
  onEdit,
  onDelete,
  onAnimationEnd,
  isDeleting = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBackfill, setShowBackfill] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCheckinClick = () => {
    if (habit.isCheckedToday) return;
    setIsAnimating(true);
    onCheckin(habit.id);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const getFrequencyDisplay = () => {
    if (habit.frequency_type === 'daily') {
      return '每日';
    }
    return `${FREQUENCY_LABELS[habit.frequency_type]}${habit.frequency_count}次`;
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden ${
          isDeleting ? 'animate-slide-out' : ''
        }`}
        onAnimationEnd={() => {
          if (isDeleting && onAnimationEnd) {
            onAnimationEnd(habit.id);
          }
        }}
      >
        <div
          className="h-2 w-full"
          style={{ backgroundColor: habit.color }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: habit.color }}
                />
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {habit.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                  {getFrequencyDisplay()}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-600">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  连续 {habit.streak} 天
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                  style={{ backgroundColor: habit.color, opacity: 0.9 }}>
                  本周 {habit.weekCount}/{habit.targetCount}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-medium">本周进度</span>
              <span className="text-xs font-bold" style={{ color: habit.color }}>
                {habit.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${habit.progressPercent}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckinClick}
              disabled={habit.isCheckedToday}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                habit.isCheckedToday
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
              } ${isAnimating ? 'animate-checkin-pop' : ''}`}
              style={!habit.isCheckedToday ? { backgroundColor: habit.color } : {}}
            >
              {habit.isCheckedToday ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  今日已打卡
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  立即打卡
                </>
              )}
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => setShowBackfill(true)}
                title="补打卡"
                className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setShowHeatmap(true)}
                title="查看热力图"
                className="p-3 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={() => onEdit(habit)}
                title="编辑"
                className="p-3 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="删除"
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="删除习惯"
        message={`确定要删除「${habit.name}」吗？该习惯的所有打卡记录将一并删除，此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(habit.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <BackfillModal
        isOpen={showBackfill}
        habit={habit}
        onConfirm={(date) => {
          setShowBackfill(false);
          onBackfill(habit.id, date);
        }}
        onCancel={() => setShowBackfill(false)}
      />

      <HeatmapModal
        isOpen={showHeatmap}
        habit={habit}
        onClose={() => setShowHeatmap(false)}
      />
    </>
  );
};

export default HabitCard;
