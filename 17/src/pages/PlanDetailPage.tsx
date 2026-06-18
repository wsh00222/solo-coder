import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Download,
  Target,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';
import { api } from '../services/api';
import RecordForm from '../components/RecordForm';
import { RecordList } from '../components/RecordItem';
import LineChart from '../components/LineChart';
import PlanForm from '../components/PlanForm';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  formatDateCN,
  formatDuration,
  getToday,
  isTodayDate,
} from '../utils/date';
import type {
  Record,
  PlanWithStats,
  UpdateRecordDto,
  CreateRecordDto,
  UpdatePlanDto,
  TrendDataPoint,
} from '../../shared/types.js';

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const planId = id ? parseInt(id, 10) : 0;

  const { loading, setLoading } = usePlanStore();
  const [plan, setPlan] = useState<PlanWithStats | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [newRecordId, setNewRecordId] = useState<number | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const [planData, recordsData, trendDataResponse] = await Promise.all([
        api.plans.getById(planId),
        api.records.getAll(planId),
        api.records.getTrend(planId),
      ]);
      setPlan(planData);
      setRecords(recordsData);
      setTrendData(trendDataResponse);
    } catch (error) {
      console.error('Failed to load plan data:', error);
    } finally {
      setLoading(false);
    }
  }, [planId, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddRecord = async (
    data: CreateRecordDto
  ): Promise<boolean> => {
    if (!planId) return false;
    setLoading(true);
    try {
      const result = await api.records.create(planId, data);
      setNewRecordId(result.record.id);
      await loadData();
      setTimeout(() => setNewRecordId(null), 2000);
      return result.isUpdate;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (
    recordId: number,
    data: UpdateRecordDto
  ) => {
    if (!planId) return;
    setLoading(true);
    try {
      await api.records.update(planId, recordId, data);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!planId || !confirm('确定要删除这条记录吗？')) return;
    setLoading(true);
    try {
      await api.records.delete(planId, recordId);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!planId) return;
    try {
      const csvData = await api.records.exportCSV(planId);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${plan?.name || '学习记录'}_${getToday()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请稍后重试');
    }
  };

  const handleUpdatePlan = async (data: UpdatePlanDto) => {
    if (!planId) return;
    setLoading(true);
    try {
      await api.plans.update(planId, data);
      setEditFormOpen(false);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planId) return;
    setDeleteLoading(true);
    try {
      await api.plans.delete(planId);
      navigate('/');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const todayRecordExists = records.some((r) => isTodayDate(r.date));

  if (!plan && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-600 mb-2">
            计划不存在
          </h2>
          <p className="text-slate-400 mb-4">该学习计划可能已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {plan?.name || '加载中...'}
                </h1>
                {plan && (
                  <p className="text-xs text-slate-500">
                    {plan.status === 'active' ? '进行中' : '已结束'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="导出CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setEditFormOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="编辑计划"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="删除计划"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {plan && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">学习目标</p>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {plan.goal}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">学习周期</p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDateCN(plan.startDate)}
                    <br />
                    至 {formatDateCN(plan.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">每日目标</p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDuration(plan.dailyGoalMinutes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">当前连续</p>
                  <p className="text-sm font-medium text-slate-700">
                    {plan.currentStreak} 天
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  学习进度
                </span>
                <span className="text-sm text-slate-600">
                  {plan.studiedDays} / {plan.totalDays} 天 ·{' '}
                  {plan.progress.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(plan.progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {plan?.status === 'active' && (
          <RecordForm
            planId={planId}
            onSubmit={handleAddRecord}
            todayRecordExists={todayRecordExists}
            loading={loading}
          />
        )}

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            学习记录
            <span className="text-sm font-normal text-slate-500">
              ({records.length} 条)
            </span>
          </h2>
          <RecordList
            records={records}
            newRecordId={newRecordId}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            loading={loading}
          />
        </div>

        <LineChart data={trendData} title="近30天学习时长趋势" />
      </main>

      <PlanForm
        isOpen={editFormOpen}
        onClose={() => setEditFormOpen(false)}
        onSubmit={handleUpdatePlan}
        plan={plan}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeletePlan}
        title="删除学习计划"
        message={
          plan
            ? `确定要删除计划「${plan.name}」吗？此操作将同时删除该计划下的所有 ${records.length} 条学习记录，且无法恢复。`
            : ''
        }
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
