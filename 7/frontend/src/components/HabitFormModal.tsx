import React, { useState, useEffect } from 'react';
import type { Habit, HabitFormData, FrequencyType } from '../types';
import { COLOR_PALETTE, FREQUENCY_LABELS } from '../types';

interface HabitFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  habit?: Habit;
  onSubmit: (data: HabitFormData) => void;
  onCancel: () => void;
}

const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  mode,
  habit,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [frequencyCount, setFrequencyCount] = useState(1);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && habit) {
        setName(habit.name);
        setFrequencyType(habit.frequency_type);
        setFrequencyCount(habit.frequency_count);
        setColor(habit.color);
      } else {
        setName('');
        setFrequencyType('daily');
        setFrequencyCount(1);
        setColor(COLOR_PALETTE[0]);
      }
      setErrors({});
    }
  }, [isOpen, mode, habit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = '请输入习惯名称';
    }
    if (frequencyCount < 1) {
      newErrors.frequencyCount = '频率次数必须大于0';
    }
    if (frequencyType === 'weekly' && frequencyCount > 7) {
      newErrors.frequencyCount = '每周最多7次';
    }
    if (frequencyType === 'monthly' && frequencyCount > 31) {
      newErrors.frequencyCount = '每月最多31次';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: name.trim(),
        frequency_type: frequencyType,
        frequency_count: frequencyCount,
        color,
      });
    }
  };

  if (!isOpen) return null;

  const getFrequencyCountMax = () => {
    switch (frequencyType) {
      case 'daily':
        return 1;
      case 'weekly':
        return 7;
      case 'monthly':
        return 31;
      default:
        return 1;
    }
  };

  const getFrequencyUnit = () => {
    switch (frequencyType) {
      case 'daily':
        return '次/天';
      case 'weekly':
        return '次/周';
      case 'monthly':
        return '次/月';
      default:
        return '';
    }
  };

  useEffect(() => {
    const max = getFrequencyCountMax();
    if (frequencyCount > max) {
      setFrequencyCount(max);
    }
  }, [frequencyType]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? '创建新习惯' : '编辑习惯'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              习惯名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：每日阅读30分钟"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
              }`}
              maxLength={50}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目标频率</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['daily', 'weekly', 'monthly'] as FrequencyType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFrequencyType(type)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    frequencyType === type
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {FREQUENCY_LABELS[type]}
                </button>
              ))}
            </div>

            {frequencyType !== 'daily' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标次数 <span className="text-gray-400 text-xs">({getFrequencyUnit()})</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFrequencyCount(Math.max(1, frequencyCount - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-bold text-gray-600"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={getFrequencyCountMax()}
                    value={frequencyCount}
                    onChange={(e) =>
                      setFrequencyCount(
                        Math.min(getFrequencyCountMax(), Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                    className={`flex-1 text-center px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-lg font-bold ${
                      errors.frequencyCount
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFrequencyCount(Math.min(getFrequencyCountMax(), frequencyCount + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
                {errors.frequencyCount && (
                  <p className="mt-1 text-sm text-red-500">{errors.frequencyCount}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">颜色标记</label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`aspect-square rounded-xl transition-all hover:scale-110 ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-lg' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`选择颜色${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all hover:bg-blue-600 hover:shadow-xl active:scale-[0.98]"
            >
              {mode === 'create' ? '创建习惯' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitFormModal;
