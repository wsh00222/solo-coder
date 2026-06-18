import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, Target, CalendarDays, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { planApi, recordApi, statsApi } from '../services/api';
import type { Plan, RecordsGroupedByWeek, ChartItem, RecordFilters, TrainingRecord } from '../types';
import { GOAL_COLORS, getToday, shortDate, weekdayStr, formatTime } from '../utils';
import { WeeklyProgressBar } from '../components/WeeklyProgressBar';
import { StarRating } from '../components/StarRating';
import { DurationChart } from '../components/DurationChart';
import { EditPlanModal } from '../components/EditPlanModal';
import { QuickAddForm } from '../components/QuickAddForm';
import { ConfirmDialog } from '../components/Modal';

export default function PlanDetailPage() {
  const { id } = useParams();
  const planId = Number(id);
  const navigate = useNavigate();
  const { fetchPlans, fetchStats, fetchReminder, showMessage, stats } = useAppStore();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [groupedRecords, setGroupedRecords] = useState<RecordsGroupedByWeek[]>([]);
  const [flatRecords, setFlatRecords] = useState<TrainingRecord[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minFeeling, setMinFeeling] = useState<number | ''>('');

  const filters: RecordFilters = useMemo(() => {
    const f: RecordFilters = {};
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    if (minFeeling !== '') f.minFeeling = Number(minFeeling);
    return f;
  }, [startDate, endDate, minFeeling]);

  const hasFilters = Object.keys(filters).length > 0;

  const filteredStats = useMemo(() => {
    if (!hasFilters || !stats) return null;
    let count = flatRecords.length;
    let dur = flatRecords.reduce((s, r) => s + r.duration, 0);
    const today = getToday();
    const monthStart = today.slice(0, 7) + '-01';
    const monthEnd = new Date(new Date(today).getFullYear(), new Date(today).getMonth() + 1, 0);
    const me = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth()+1).padStart(2,'0')}-${String(monthEnd.getDate()).padStart(2,'0')}`;
    const effStart = startDate && startDate > monthStart ? startDate : monthStart;
    const effEnd = endDate && endDate < me ? endDate : me;
    const inMonth = flatRecords.filter(r => r.date >= effStart && r.date <= effEnd);
    count = inMonth.length;
    dur = inMonth.reduce((s, r) => s + r.duration, 0);
    return {
      total_plans: stats.total_plans,
      month_records_count: count,
      month_duration_hours: Math.round((dur / 60) * 10) / 10,
      current_streak_days: stats.current_streak_days,
      days_without_training: stats.days_without_training,
    };
  }, [hasFilters, flatRecords, stats, startDate, endDate]);

  useEffect(() => {
    if (!planId) return;
    loadAll();
  }, [planId, JSON.stringify(filters)]);

  async function loadAll() {
    setLoading(true);
    const [planRes, recRes, chartRes] = await Promise.all([
      planApi.getById(planId),
      recordApi.getByPlanId(planId, filters),
      statsApi.getLast7DaysChart(planId),
    ]);
    if (planRes.success && planRes.data) {
      setPlan(planRes.data);
    } else {
      showMessage('error', '计划不存在');
      navigate('/');
    }
    if (recRes.success && recRes.data) {
      setGroupedRecords(recRes.data.grouped);
      setFlatRecords(recRes.data.flat);
    }
    if (chartRes.success && chartRes.data) {
      setChartData(chartRes.data);
    }
    setLoading(false);
  }

  async function handleEditSave(data: any) {
    const res = await planApi.update(planId, data);
    if (res.success) {
      showMessage('success', '计划已更新');
      setShowEdit(false);
      loadAll();
      fetchPlans();
    } else {
      showMessage('error', res.error || '更新失败');
    }
  }

  async function handleDelete() {
    const res = await planApi.remove(planId);
    if (res.success) {
      showMessage('success', '计划已删除');
      setShowDelete(false);
      navigate('/');
      fetchPlans();
      fetchStats();
      fetchReminder();
    } else {
      showMessage('error', res.error || '删除失败');
    }
  }

  async function handleAddRecord(data: { date: string; duration: number; content: string; feeling: number | null }) {
    const res = await recordApi.create({ plan_id: planId, ...data });
    if (res.success && res.data) {
      setShowQuickAdd(false);
      setHighlightId(res.data.id);
      showMessage(res.existed ? 'info' : 'success', res.existed ? '今日记录已更新' : '记录已添加');
      setTimeout(() => setHighlightId(null), 1200);
      loadAll();
      fetchPlans();
      fetchStats();
      fetchReminder();
    } else {
      showMessage('error', res.error || '保存失败');
    }
  }

  async function handleDeleteRecord(recId: number) {
    const res = await recordApi.remove(recId);
    if (res.success) {
      showMessage('success', '记录已删除');
      loadAll();
      fetchPlans();
      fetchStats();
      fetchReminder();
    } else {
      showMessage('error', res.error || '删除失败');
    }
  }

  function clearFilters() {
    setStartDate('');
    setEndDate('');
    setMinFeeling('');
  }

  const displayStats = filteredStats || stats;
  const today = getToday();
  const todayRecordExists = flatRecords.some(r => r.date === today);

  if (loading && !plan) {
    return <div className="p-12 text-center text-gray-500">加载中...</div>;
  }

  if (!plan) return null;
  const colors = GOAL_COLORS[plan.goal] || GOAL_COLORS['保持'];

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{plan.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              <Target className="w-3 h-3" />
              {plan.goal}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {plan.start_date} ~ {plan.end_date || '长期'}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              每周 {plan.weekly_frequency} 次
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            title="编辑计划"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
            title="删除计划"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${colors.bg} border ${colors.border}`}>
        <WeeklyProgressBar
          goal={plan.goal}
          done={plan.current_week_done}
          target={plan.current_week_target}
          progress={plan.current_week_progress}
        />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">筛选记录</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">起</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-2 py-1 rounded-md border border-gray-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">止</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-2 py-1 rounded-md border border-gray-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={minFeeling}
              onChange={e => setMinFeeling(e.target.value ? Number(e.target.value) : '')}
              className="px-2 py-1 rounded-md border border-gray-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">全部星级</option>
              <option value="1">1星及以上</option>
              <option value="2">2星及以上</option>
              <option value="3">3星及以上</option>
              <option value="4">4星及以上</option>
              <option value="5">仅5星</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                清除
              </button>
            )}
          </div>
        </div>

        {displayStats && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">本月训练次数 {hasFilters && '(筛选后)'}</div>
              <div className="text-xl font-bold text-gray-800 mt-0.5">{displayStats.month_records_count}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">本月训练时长 {hasFilters && '(筛选后)'}</div>
              <div className="text-xl font-bold text-gray-800 mt-0.5">{displayStats.month_duration_hours}h</div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">训练记录 <span className="text-sm font-normal text-gray-500">（共 {flatRecords.length} 条）</span></h2>

        {groupedRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 mb-3">还没有训练记录</p>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              点击添加第一条记录
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedRecords.map(group => (
              <div key={group.weekStart} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className={`w-1 h-5 rounded-full ${colors.bar}`} />
                  <span className="text-sm font-semibold text-gray-700">
                    {shortDate(group.weekStart)} - {shortDate(group.weekEnd)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({group.records.length} 次训练)
                  </span>
                </div>
                <div className="space-y-2">
                  {group.records.map(rec => (
                    <div
                      key={rec.id}
                      id={`rec-${rec.id}`}
                      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden transition-all
                        ${highlightId === rec.id ? 'animate-flash' : ''}`}
                    >
                      {highlightId === rec.id && (
                        <div className="absolute inset-0 animate-flash-bg pointer-events-none" />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <div className="font-semibold text-gray-800">{shortDate(rec.date)}</div>
                            <div className="text-xs text-gray-400">{weekdayStr(rec.date)}</div>
                            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {rec.duration} 分钟
                            </div>
                            <StarRating rating={rec.feeling} size="sm" />
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{rec.content}</p>
                          <div className="text-[11px] text-gray-400 mt-2">
                            更新于 {rec.updated_at.split(' ')[1] || formatTime(new Date())}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('确定删除该训练记录？')) handleDeleteRecord(rec.id);
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                          title="删除记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-gray-800">最近 7 天训练时长</h3>
        </div>
        <DurationChart data={chartData} />
      </div>

      {showQuickAdd && (
        <div className="sticky bottom-6 z-20 max-w-2xl mx-auto relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <button
              onClick={() => setShowQuickAdd(false)}
              className="w-12 h-12 rounded-full bg-gray-500 text-white shadow-lg hover:bg-gray-600 flex items-center justify-center -rotate-45"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="pt-6">
            <QuickAddForm
              onClose={() => setShowQuickAdd(false)}
              onSubmit={handleAddRecord}
              todayRecordExisted={todayRecordExists}
            />
          </div>
        </div>
      )}

      {!showQuickAdd && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-indigo-500 text-white shadow-xl hover:bg-indigo-600 hover:shadow-2xl transition-all flex items-center justify-center hover:scale-110 active:scale-95"
          title="添加训练记录"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      <EditPlanModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        plan={plan}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={showDelete}
        title="删除计划"
        message="确定要删除该训练计划吗？该计划下的所有训练记录也将被一并删除，且无法恢复。"
        confirmText="确认删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
