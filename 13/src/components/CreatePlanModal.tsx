import { useState } from 'react';
import { Modal } from './Modal';
import type { Goal } from '../types';
import { getToday } from '../utils';

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; goal: Goal; weekly_frequency: number; start_date: string; end_date?: string | null }) => void;
}

export function CreatePlanModal({ open, onClose, onCreate }: CreatePlanModalProps) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal>('增肌');
  const [frequency, setFrequency] = useState(3);
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(true);

  const goals: Goal[] = ['增肌', '减脂', '保持'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      goal,
      weekly_frequency: Number(frequency),
      start_date: startDate,
      end_date: hasEndDate ? (endDate || null) : null,
    });
    setName('');
    setGoal('增肌');
    setFrequency(3);
    setStartDate(getToday());
    setEndDate('');
    setHasEndDate(true);
  }

  return (
    <Modal open={open} onClose={onClose} title="创建训练计划">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">计划名称 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="例如：夏季增肌计划"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">训练目标 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {goals.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={`py-2.5 px-3 rounded-lg border-2 font-medium text-sm transition-all
                  ${goal === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">每周训练次数 <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={7}
              value={frequency}
              onChange={e => setFrequency(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <div className="w-12 text-center font-bold text-indigo-600 text-lg">{frequency}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">开始日期 <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">结束日期</label>
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={e => setHasEndDate(e.target.checked)}
                  className="accent-indigo-500"
                />
                设置
              </label>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              disabled={!hasEndDate}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
              min={startDate}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-sm"
          >
            创建计划
          </button>
        </div>
      </form>
    </Modal>
  );
}
