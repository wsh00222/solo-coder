import React, { useState, useEffect } from 'react';
import type { Habit } from '../types';
import { getDatePickerRange, formatDisplayDate, getChineseWeekday, isDateWithinNDays, getToday } from '../utils/dateUtils';
import ConfirmModal from './ConfirmModal';

interface BackfillModalProps {
  isOpen: boolean;
  habit: Habit;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

const BackfillModal: React.FC<BackfillModalProps> = ({
  isOpen,
  habit,
  onConfirm,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const { min, max } = getDatePickerRange();

  useEffect(() => {
    if (isOpen) {
      setSelectedDate('');
      setShowConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateDateOptions = () => {
    const dates: { date: string; display: string; weekday: string; isToday: boolean; disabled: boolean }[] = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push({
        date: dateStr,
        display: formatDisplayDate(dateStr),
        weekday: getChineseWeekday(dateStr),
        isToday: i === 0,
        disabled: !isDateWithinNDays(dateStr, 7),
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  const handleSelectDate = (date: string) => {
    if (!isDateWithinNDays(date, 7)) return;
    setSelectedDate(date);
  };

  const handleSubmit = () => {
    if (!selectedDate) return;
    if (selectedDate !== getToday()) {
      setShowConfirm(true);
    } else {
      onConfirm(selectedDate);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">补打卡</h2>
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">为「{habit.name}」选择补打卡日期（最近7天）</p>
          </div>

          <div className="p-6">
            <div className="space-y-2 mb-6">
              {dateOptions.map((option) => (
                <button
                  key={option.date}
                  type="button"
                  onClick={() => handleSelectDate(option.date)}
                  disabled={option.disabled}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    option.disabled
                      ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-50'
                      : selectedDate === option.date
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        option.isToday
                          ? 'bg-blue-500 text-white'
                          : selectedDate === option.date
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {new Date(option.date).getDate()}
                    </div>
                    <div className="text-left">
                      <div className={`font-medium ${selectedDate === option.date ? 'text-blue-700' : 'text-gray-800'}`}>
                        {option.display}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.weekday}
                        {option.isToday && <span className="ml-2 text-blue-500 font-medium">今天</span>}
                      </div>
                    </div>
                  </div>
                  {selectedDate === option.date && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedDate}
                className={`flex-1 px-4 py-3 rounded-xl font-medium shadow-lg transition-all ${
                  selectedDate
                    ? 'text-white hover:shadow-xl active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={selectedDate ? { backgroundColor: habit.color, boxShadow: `0 10px 25px -5px ${habit.color}40` } : {}}
              >
                确认打卡
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="确认补打卡"
        message={`确定要为「${habit.name}」补打卡 ${formatDisplayDate(selectedDate)}（${getChineseWeekday(selectedDate)}）吗？这将重新计算连续打卡天数。`}
        confirmText="确认补打卡"
        cancelText="取消"
        confirmButtonClass="bg-blue-500 hover:bg-blue-600"
        onConfirm={() => {
          setShowConfirm(false);
          onConfirm(selectedDate);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default BackfillModal;
