import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Plan, Goal } from '../types';

interface EditPlanModalProps {
  open: boolean;
  onClose: () => void;
  plan: Plan | null;
  onSave: (data: { name: string; goal: Goal; weekly_frequency: number; end_date?: string | null }) => void;
}

export function EditPlanModal({ open, onClose, plan, onSave }: EditPlanModalProps) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal>('增肌');
  const [frequency, setFrequency] = useState(3);
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(true);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setGoal(plan.goal);
      setFrequency(plan.weekly_frequency);
      if (plan.end_date) {
        setEndDate(plan.end_date);
        setHasEndDate(true);
      } else {
        setEndDate('');
        setHasEndDate(false);
      }
    }
  }, [plan, open]);

  const goals: Goal[] = ['增肌', '减脂', '保持'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !plan) return;
    onSave({
      name: name.trim(),
      goal,
      weekly_frequency: Number(frequency),
      end_date: hasEndDate ? (endDate || null) : null,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="编辑训练计划">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">计划名称 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">开始日期</label>
          <input
            type="date"
            value={plan?.start_date || ''}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">开始日期不可修改</p>
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
            min={plan?.start_date}
          />
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
            保存修改
          </button>
        </div>
      </form>
    </Modal>
  );
}
