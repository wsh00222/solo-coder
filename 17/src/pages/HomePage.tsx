import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';
import { StatsGrid } from '../components/StatsCard';
import AlertBanner from '../components/AlertBanner';
import FilterBar from '../components/FilterBar';
import PlanCard from '../components/PlanCard';
import PlanForm from '../components/PlanForm';
import ConfirmDialog from '../components/ConfirmDialog';
import type { CreatePlanDto, UpdatePlanDto } from '../../shared/types.js';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    plans,
    stats,
    alerts,
    loading,
    newPlanFormOpen,
    editingPlan,
    deleteConfirmOpen,
    planToDelete,
    openNewPlanForm,
    closePlanForm,
    openEditPlanForm,
    openDeleteConfirm,
    closeDeleteConfirm,
    createPlan,
    updatePlan,
    deletePlan,
    fetchPlans,
    fetchStats,
    fetchAlerts,
  } = usePlanStore();

  useEffect(() => {
    fetchPlans();
    fetchStats();
    fetchAlerts();
  }, [fetchPlans, fetchStats, fetchAlerts]);

  const handleCreatePlan = async (data: CreatePlanDto) => {
    await createPlan(data);
  };

  const handleUpdatePlan = async (data: UpdatePlanDto) => {
    if (editingPlan) {
      await updatePlan(editingPlan.id, data);
    }
  };

  const handleDeletePlan = async () => {
    if (planToDelete) {
      await deletePlan(planToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">学习计划追踪</h1>
                <p className="text-xs text-slate-500">记录每一步，见证成长</p>
              </div>
            </div>
            <button
              onClick={openNewPlanForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              新建计划
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AlertBanner alerts={alerts} />

        <StatsGrid stats={stats} />

        <FilterBar onNewPlan={openNewPlanForm} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 bg-white rounded-xl border border-slate-100 animate-pulse"
              />
            ))
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={() => navigate(`/plans/${plan.id}`)}
                onEdit={() => openEditPlanForm(plan)}
                onDelete={() => openDeleteConfirm(plan)}
              />
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  还没有学习计划
                </h3>
                <p className="text-slate-400 mb-6">
                  创建你的第一个学习计划，开始成长之旅
                </p>
                <button
                  onClick={openNewPlanForm}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5" />
                  创建学习计划
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <PlanForm
        isOpen={newPlanFormOpen || !!editingPlan}
        onClose={closePlanForm}
        onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
        plan={editingPlan}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeletePlan}
        title="删除学习计划"
        message={
          planToDelete
            ? `确定要删除计划「${planToDelete.name}」吗？此操作将同时删除该计划下的所有学习记录，且无法恢复。`
            : ''
        }
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
