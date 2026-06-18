import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { PlanWithStats, CreatePlanDto, UpdatePlanDto } from '../../shared/types.js';
import { getToday } from '../utils/date';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePlanDto | UpdatePlanDto) => Promise<void>;
  plan?: PlanWithStats | null;
  loading?: boolean;
}

export default function PlanForm({ isOpen, onClose, onSubmit, plan, loading }: PlanFormProps) {
  const isEdit = !!plan;

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: getToday(),
    endDate: getToday(),
    dailyGoalMinutes: 60,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        goal: plan.goal,
        startDate: plan.startDate,
        endDate: plan.endDate,
        dailyGoalMinutes: plan.dailyGoalMinutes,
      });
    } else {
      setFormData({
        name: '',
        goal: '',
        startDate: getToday(),
        endDate: getToday(),
        dailyGoalMinutes: 60,
      });
    }
    setErrors({});
  }, [plan, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入计划名称';
    }
    if (!formData.goal.trim()) {
      newErrors.goal = '请输入学习目标';
    }
    if (!formData.startDate) {
      newErrors.startDate = '请选择开始日期';
    }
    if (!formData.endDate) {
      newErrors.endDate = '请选择结束日期';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }
    if (isEdit && formData.endDate && formData.endDate < getToday()) {
      newErrors.endDate = '结束日期不能早于今天';
    }
    if (!formData.dailyGoalMinutes || formData.dailyGoalMinutes <= 0) {
      newErrors.dailyGoalMinutes = '每日学习时长必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        await onSubmit({
          name: formData.name.trim(),
          goal: formData.goal.trim(),
          endDate: formData.endDate,
          dailyGoalMinutes: formData.dailyGoalMinutes,
        });
      } else {
        await onSubmit({
          name: formData.name.trim(),
          goal: formData.goal.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
          dailyGoalMinutes: formData.dailyGoalMinutes,
        });
      }
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : '保存失败',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑学习计划' : '新建学习计划'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            计划名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：Python 全栈开发"
            className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            学习目标 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="例如：掌握 Python 全栈开发技能"
            className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.goal ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.goal && <p className="mt-1 text-sm text-red-500">{errors.goal}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              开始日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              disabled={isEdit}
              className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEdit ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
              } ${errors.startDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              结束日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={isEdit ? getToday() : formData.startDate}
              className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            每日学习时长目标（分钟） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.dailyGoalMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                dailyGoalMinutes: parseInt(e.target.value) || 0,
              })
            }
            className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dailyGoalMinutes
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-200'
            }`}
          />
          {errors.dailyGoalMinutes && (
            <p className="mt-1 text-sm text-red-500">{errors.dailyGoalMinutes}</p>
          )}
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
          >
            {loading ? '保存中...' : isEdit ? '保存修改' : '创建计划'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
