import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Filter } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { PlanCard } from '../components/PlanCard';
import { CreatePlanModal } from '../components/CreatePlanModal';
import { ConfirmDialog } from '../components/Modal';
import type { Goal } from '../types';
import { planApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function PlanListPage() {
  const { plans, goalFilter, setGoalFilter, fetchPlans, fetchStats, fetchReminder, showMessage } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [duplicateId, setDuplicateId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const goals: (Goal | 'all')[] = ['all', '增肌', '减脂', '保持'];
  const goalLabels: Record<string, string> = { all: '全部', '增肌': '增肌', '减脂': '减脂', '保持': '保持' };

  async function handleCreate(data: any) {
    const res = await planApi.create(data);
    if (res.success) {
      showMessage('success', '计划创建成功');
      setShowCreate(false);
      fetchPlans();
      fetchStats();
    } else {
      showMessage('error', res.error || '创建失败');
    }
  }

  async function handleDuplicate(id: number) {
    setDuplicateId(id);
  }

  async function confirmDuplicate() {
    if (!duplicateId) return;
    const res = await planApi.duplicate(duplicateId);
    if (res.success && res.data) {
      showMessage('success', '计划已复制');
      fetchPlans();
      fetchStats();
      navigate(`/plan/${res.data.id}`);
    } else {
      showMessage('error', res.error || '复制失败');
    }
    setDuplicateId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">训练计划</h1>
          <p className="text-sm text-gray-500 mt-1">制定计划，坚持训练，见证蜕变</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          创建计划
        </button>
      </div>

      {plans.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {goals.map(g => (
            <button
              key={g}
              onClick={() => setGoalFilter(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${goalFilter === g
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}
            >
              {goalLabels[g]}
            </button>
          ))}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-dashed border-gray-300 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">还没有训练计划</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">创建你的第一个训练计划，开启健身之旅吧！</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            创建第一个计划
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(p => (
            <PlanCard key={p.id} plan={p} onDuplicate={handleDuplicate} />
          ))}
        </div>
      )}

      <CreatePlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      <ConfirmDialog
        open={duplicateId !== null}
        title="复制计划"
        message="确定要复制该计划吗？新计划将以当天为开始日期，训练记录不会被复制。"
        confirmText="复制"
        onConfirm={confirmDuplicate}
        onCancel={() => setDuplicateId(null)}
      />
    </div>
  );
}
