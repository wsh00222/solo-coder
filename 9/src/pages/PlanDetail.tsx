import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PlanForm } from '../components/PlanForm';
import { ItineraryForm } from '../components/ItineraryForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge, SoonBadge } from '../components/Badge';
import { planService } from '../services/planService';
import { itineraryService } from '../services/itineraryService';
import { useToastStore } from '../store/useToastStore';
import type { PlanWithItineraries, Itinerary, CreatePlanRequest, CreateItineraryRequest, TimeSlot } from '../types';
import {
  getPlanStatus,
  isUpcomingSoon,
  groupItinerariesByDate,
  getTimeSlotLabel,
  formatBudget,
  findConflicts,
} from '../utils/planUtils';
import { formatDateRange, calculateDays, formatDateDisplay } from '../utils/dateUtils';
import {
  ArrowLeft,
  Calendar,
  Users,
  Wallet,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Copy,
  MapPin,
  Clock,
  Car,
  Activity,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanWithItineraries | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [newItineraryId, setNewItineraryId] = useState<string | null>(null);
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean;
    data?: CreateItineraryRequest;
    existingId?: string;
    isShaking: boolean;
  }>({ isOpen: false, isShaking: false });

  const { success, error, info } = useToastStore();

  const loadPlan = async () => {
    if (!id) return;
    setLoading(true);
    const response = await planService.getPlanById(id);
    if (response.success && response.data) {
      setPlan(response.data);
    } else {
      error(response.error || '加载计划详情失败');
      navigate('/');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlan();
  }, [id]);

  useEffect(() => {
    if (newItineraryId) {
      const timer = setTimeout(() => setNewItineraryId(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [newItineraryId]);

  const status = plan ? getPlanStatus(plan.startDate, plan.endDate) : 'upcoming';
  const isSoon = plan ? isUpcomingSoon(plan.startDate) && status === 'upcoming' : false;
  const days = plan ? calculateDays(plan.startDate, plan.endDate) : 0;

  const groupedItineraries = useMemo(() => {
    if (!plan) return {};
    return groupItinerariesByDate(plan.itineraries);
  }, [plan]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedItineraries).sort();
  }, [groupedItineraries]);

  const handleUpdatePlan = async (data: CreatePlanRequest) => {
    if (!id) return;
    setIsSubmitting(true);
    const response = await planService.updatePlan(id, data);
    if (response.success) {
      success('计划更新成功');
      setIsEditFormOpen(false);
      loadPlan();
    } else {
      error(response.error || '更新计划失败');
    }
    setIsSubmitting(false);
  };

  const handleDeletePlan = async () => {
    if (!id) return;
    const response = await planService.deletePlan(id);
    if (response.success) {
      success('计划删除成功');
      navigate('/');
    } else {
      error(response.error || '删除计划失败');
    }
  };

  const checkAndSubmitItinerary = async (
    data: CreateItineraryRequest,
    existingId?: string
  ) => {
    if (!plan) return;

    const conflicts = findConflicts(plan.itineraries, data.date, data.timeSlot, existingId);
    
    if (conflicts.length > 0) {
      setConflictDialog({
        isOpen: true,
        data,
        existingId,
        isShaking: true,
      });
      setTimeout(() => {
        setConflictDialog(prev => ({ ...prev, isShaking: false }));
      }, 500);
      return;
    }

    await submitItinerary(data, existingId);
  };

  const submitItinerary = async (data: CreateItineraryRequest, existingId?: string) => {
    if (!id || !plan) return;
    setIsSubmitting(true);

    let response;
    if (existingId) {
      response = await itineraryService.updateItinerary(id, existingId, data);
      if (response.success) {
        success('行程更新成功');
        setEditingItinerary(null);
      }
    } else {
      response = await itineraryService.createItinerary(id, data);
      if (response.success && response.data) {
        success('行程添加成功');
        setShowAddForm(false);
        setNewItineraryId(response.data.id);
      }
    }

    if (response.success) {
      loadPlan();
    } else {
      error(response.error || (existingId ? '更新行程失败' : '添加行程失败'));
    }

    setIsSubmitting(false);
    setConflictDialog({ isOpen: false, isShaking: false });
  };

  const handleDeleteItinerary = async (itineraryId: string) => {
    if (!id) return;
    const response = await itineraryService.deleteItinerary(id, itineraryId);
    if (response.success) {
      success('行程删除成功');
      loadPlan();
    } else {
      error(response.error || '删除行程失败');
    }
  };

  const handleCopyItinerary = async (itineraryId: string) => {
    if (!id) return;
    const response = await itineraryService.copyItinerary(id, itineraryId);
    if (response.success && response.data) {
      info('行程已复制');
      setNewItineraryId(response.data.id);
      loadPlan();
    } else {
      error(response.error || '复制行程失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">返回列表</span>
            </button>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsEditFormOpen(true)}
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                编辑计划
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                删除计划
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900">{plan.destination}</h1>
                <StatusBadge status={status} />
                {isSoon && <SoonBadge />}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
                  <span className="text-primary-600 font-medium">· {days}天</span>
                </div>
                {plan.companions && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{plan.companions}</span>
                  </div>
                )}
                <div className={cn(
                  'flex items-center gap-2',
                  plan.budget !== undefined && plan.budget !== null ? 'text-primary-600' : 'text-gray-400'
                )}>
                  <Wallet className="w-4 h-4" />
                  <span className="font-medium">{formatBudget(plan.budget)}</span>
                </div>
              </div>
            </div>
          </div>
          {plan.notes && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-gray-700">{plan.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-gray-900">
            行程安排
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({plan.itineraries.length} 项)
            </span>
          </h2>
          {!showAddForm && !editingItinerary && (
            <Button
              onClick={() => setShowAddForm(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              添加行程
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-6 animate-fade-in">
            <ItineraryForm
              plan={plan}
              onSubmit={(data) => checkAndSubmitItinerary(data)}
              onCancel={() => setShowAddForm(false)}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {sortedDates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有行程安排</h3>
            <p className="text-gray-500 mb-4">点击上方按钮添加你的第一个行程吧</p>
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                添加行程
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date, dateIndex) => (
              <div
                key={date}
                className="animate-stagger-in"
                style={{ animationDelay: `${dateIndex * 100}ms`, opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {dateIndex + 1}
                  </div>
                  <h3 className="text-lg font-display font-semibold text-gray-900">
                    {formatDateDisplay(date)}
                  </h3>
                  <span className="text-sm text-gray-500">{date}</span>
                </div>

                <div className="ml-5 pl-8 border-l-2 border-primary-200 space-y-4">
                  {groupedItineraries[date].map((itinerary, index) => (
                    <div
                      key={itinerary.id}
                      className={cn(
                        'relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all',
                        'hover:shadow-md hover:-translate-y-0.5',
                        newItineraryId === itinerary.id && 'animate-flash'
                      )}
                    >
                      <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-primary-500 border-4 border-white shadow" />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {getTimeSlotLabel(itinerary.timeSlot)}
                            </span>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {itinerary.activity}
                            </h4>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{itinerary.location}</span>
                            </div>
                            {itinerary.transportation && (
                              <div className="flex items-center gap-2">
                                <Car className="w-4 h-4 text-gray-400" />
                                <span>交通：{itinerary.transportation}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingItinerary?.id === itinerary.id ? (
                            <ItineraryForm
                              plan={plan}
                              initialData={itinerary}
                              onSubmit={(data) => checkAndSubmitItinerary(data, itinerary.id)}
                              onCancel={() => setEditingItinerary(null)}
                              isLoading={isSubmitting}
                              className="absolute right-0 top-0 z-10 w-96 shadow-xl"
                            />
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingItinerary(itinerary)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                title="编辑行程"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCopyItinerary(itinerary.id)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="复制此行"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItinerary(itinerary.id)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="删除行程"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PlanForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleUpdatePlan}
        initialData={plan}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePlan}
        title="确认删除旅行计划？"
        message="删除后该计划及其所有行程项将无法恢复。此操作不可撤销。"
        confirmText="确认删除"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={conflictDialog.isOpen}
        onClose={() => setConflictDialog({ isOpen: false, isShaking: false })}
        onConfirm={() => conflictDialog.data && submitItinerary(conflictDialog.data, conflictDialog.existingId)}
        title="行程冲突警告"
        message="该时间段已安排活动，是否继续添加？"
        confirmText="继续添加"
        cancelText="取消"
        variant="warning"
        isShaking={conflictDialog.isShaking}
      />
    </div>
  );
}
