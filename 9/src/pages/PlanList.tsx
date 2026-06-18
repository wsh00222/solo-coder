import { useState, useEffect, useMemo } from 'react';
import { PlanCard } from '../components/PlanCard';
import { StatsOverview } from '../components/StatsOverview';
import { FilterBar } from '../components/FilterBar';
import { PlanForm } from '../components/PlanForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Button } from '../components/Button';
import { planService } from '../services/planService';
import { useToastStore } from '../store/useToastStore';
import type { Plan, CreatePlanRequest, FilterStatus, SortOrder } from '../types';
import { calculateStats, getPlanStatus } from '../utils/planUtils';
import { Plus, MapPin } from 'lucide-react';

export default function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { success, error } = useToastStore();

  const loadPlans = async () => {
    setLoading(true);
    const response = await planService.getAllPlans();
    if (response.success && response.data) {
      setPlans(response.data);
    } else {
      error(response.error || '加载计划列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const stats = useMemo(() => calculateStats(plans), [plans]);

  const filteredPlans = useMemo(() => {
    let result = [...plans];

    if (filterStatus !== 'all') {
      result = result.filter(plan => getPlanStatus(plan.startDate, plan.endDate) === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(plan =>
        plan.destination.toLowerCase().includes(query) ||
        (plan.companions && plan.companions.toLowerCase().includes(query)) ||
        (plan.notes && plan.notes.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      const comparison = a.startDate.localeCompare(b.startDate);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [plans, filterStatus, searchQuery, sortOrder]);

  const handleCreatePlan = async (data: CreatePlanRequest) => {
    setIsSubmitting(true);
    const response = await planService.createPlan(data);
    if (response.success) {
      success('计划创建成功');
      setIsFormOpen(false);
      loadPlans();
    } else {
      error(response.error || '创建计划失败');
    }
    setIsSubmitting(false);
  };

  const handleDeletePlan = async (id: string) => {
    const response = await planService.deletePlan(id);
    if (response.success) {
      success('计划删除成功');
      setPlans(prev => prev.filter(p => p.id !== id));
    } else {
      error(response.error || '删除计划失败');
    }
    setDeleteConfirmId(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">旅行计划管理器</h1>
                <p className="text-sm text-gray-500">规划你的每一次精彩旅程</p>
              </div>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              新建计划
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <StatsOverview stats={stats} />
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
              {plans.length === 0 ? '还没有旅行计划' : '没有符合条件的计划'}
            </h3>
            <p className="text-gray-500 mb-6">
              {plans.length === 0
                ? '点击右上角按钮创建你的第一个旅行计划吧！'
                : '试试调整筛选条件或搜索关键词'}
            </p>
            {plans.length === 0 && (
              <Button
                onClick={() => setIsFormOpen(true)}
                leftIcon={<Plus className="w-5 h-5" />}
              >
                新建计划
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onDelete={handleDeleteClick}
                  index={index}
                />
              ))}
            </div>
            <div className="text-center text-sm text-gray-500">
              共 {filteredPlans.length} 个计划
            </div>
          </>
        )}
      </main>

      <PlanForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreatePlan}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeletePlan(deleteConfirmId)}
        title="确认删除旅行计划？"
        message="删除后该计划及其所有行程项将无法恢复。"
        confirmText="删除"
        variant="danger"
      />
    </div>
  );
}
