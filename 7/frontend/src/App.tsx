import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { habitApi } from './api/habitApi';
import type { Habit, HabitFormData, GlobalStats, SortOption, FilterColor, FilterFrequency, FrequencyType } from './types';
import StatsOverview from './components/StatsOverview';
import HabitCard from './components/HabitCard';
import HabitFormModal from './components/HabitFormModal';
import ConfirmModal from './components/ConfirmModal';
import EmptyState from './components/EmptyState';
import AuthPage from './pages/AuthPage';

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    totalHabits: 0,
    monthlyCheckins: 0,
    maxStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [filterColor, setFilterColor] = useState<FilterColor>('all');
  const [filterFrequency, setFilterFrequency] = useState<FilterFrequency>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCheckinAllConfirm, setShowCheckinAllConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [habitsData, statsData] = await Promise.all([
        habitApi.getAllHabits(),
        habitApi.getGlobalStats(),
      ]);
      setHabits(habitsData);
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      addToast('加载数据失败，请刷新页面重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  const filteredAndSortedHabits = useMemo(() => {
    let result = [...habits];

    if (filterColor !== 'all') {
      result = result.filter((h) => h.color === filterColor);
    }
    if (filterFrequency !== 'all') {
      result = result.filter((h) => h.frequency_type === filterFrequency);
    }

    result.sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return b.streak - a.streak;
      }
    });

    return result;
  }, [habits, sortBy, filterColor, filterFrequency]);

  const updateHabitInList = (updatedHabit: Habit) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  };

  const handleCheckin = async (habitId: number) => {
    try {
      const response = await habitApi.checkin(habitId);
      if (response.success && response.habit) {
        updateHabitInList(response.habit);
        const newStats = await habitApi.getGlobalStats();
        setStats(newStats);
        addToast(response.message || '打卡成功', 'success');
      } else if (response.alreadyChecked) {
        addToast(response.message || '今日已打卡', 'info');
      } else {
        addToast(response.error || response.message || '打卡失败', 'error');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '打卡失败，请重试';
      addToast(msg, 'error');
    }
  };

  const handleBackfill = async (habitId: number, date: string) => {
    try {
      const response = await habitApi.checkin(habitId, date);
      if (response.success && response.habit) {
        updateHabitInList(response.habit);
        const newStats = await habitApi.getGlobalStats();
        setStats(newStats);
        addToast(response.message || '补打卡成功', 'success');
      } else if (response.alreadyChecked) {
        addToast('该日期已打卡', 'info');
      } else {
        addToast(response.error || response.message || '补打卡失败', 'error');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '补打卡失败，请重试';
      addToast(msg, 'error');
    }
  };

  const handleCreateHabit = async (data: HabitFormData) => {
    try {
      const response = await habitApi.createHabit(data);
      if (response.success) {
        setHabits((prev) => [response.habit, ...prev]);
        const newStats = await habitApi.getGlobalStats();
        setStats(newStats);
        setShowCreateModal(false);
        addToast(response.message || '习惯创建成功', 'success');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '创建习惯失败，请重试';
      addToast(msg, 'error');
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleUpdateHabit = async (data: HabitFormData) => {
    if (!editingHabit) return;
    try {
      const response = await habitApi.updateHabit(editingHabit.id, data);
      if (response.success) {
        updateHabitInList(response.habit);
        setEditingHabit(null);
        addToast(response.message || '习惯更新成功', 'success');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '更新习惯失败，请重试';
      addToast(msg, 'error');
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    setDeletingIds((prev) => new Set(prev).add(habitId));
  };

  const handleDeleteAnimationEnd = async (habitId: number) => {
    try {
      const response = await habitApi.deleteHabit(habitId);
      if (response.success) {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
        setStats(response.stats);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
        addToast(response.message || '习惯删除成功', 'success');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '删除习惯失败，请重试';
      addToast(msg, 'error');
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  const handleCheckinAll = async () => {
    try {
      const response = await habitApi.checkinAllToday();
      if (response.success) {
        setHabits(response.habits);
        setStats(response.stats);
        addToast(response.message, 'success');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '一键打卡失败，请重试';
      addToast(msg, 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('已退出登录', 'info');
  };

  const uniqueColors = useMemo(() => {
    const colors = new Set(habits.map((h) => h.color));
    return Array.from(colors);
  }, [habits]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  习惯打卡追踪器
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  你好，{user?.username || user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800 leading-tight">{user?.username}</p>
                  <p className="text-xs text-gray-500 leading-tight">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">新建习惯</span>
                <span className="sm:hidden">新建</span>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="退出登录"
                className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <StatsOverview stats={stats} />

        {habits.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600 whitespace-nowrap">排序：</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  >
                    <option value="created_at">创建时间</option>
                    <option value="streak">连续天数</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600 whitespace-nowrap">频率：</label>
                  <select
                    value={filterFrequency}
                    onChange={(e) => setFilterFrequency(e.target.value as FilterFrequency)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  >
                    <option value="all">全部</option>
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </div>

                {uniqueColors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600 whitespace-nowrap">颜色：</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setFilterColor('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filterColor === 'all'
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        全部
                      </button>
                      {uniqueColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setFilterColor(color)}
                          className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${
                            filterColor === color
                              ? 'ring-2 ring-offset-2 ring-gray-400 shadow-md scale-110'
                              : ''
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 text-right text-sm text-gray-500">
                显示 {filteredAndSortedHabits.length} / {habits.length} 个习惯
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : habits.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : filteredAndSortedHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">没有匹配的习惯</h3>
            <p className="text-gray-500">尝试调整筛选条件</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredAndSortedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onCheckin={handleCheckin}
                  onBackfill={handleBackfill}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onAnimationEnd={handleDeleteAnimationEnd}
                  isDeleting={deletingIds.has(habit.id)}
                />
              ))}
            </div>

            <div className="mt-8 sticky bottom-4 z-20">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">当前共</p>
                      <p className="font-bold text-gray-900">{habits.length} 个习惯</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCheckinAllConfirm(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-200 hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    一键全部打卡
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <HabitFormModal
        isOpen={showCreateModal}
        mode="create"
        onSubmit={handleCreateHabit}
        onCancel={() => setShowCreateModal(false)}
      />

      <HabitFormModal
        isOpen={!!editingHabit}
        mode="edit"
        habit={editingHabit || undefined}
        onSubmit={handleUpdateHabit}
        onCancel={() => setEditingHabit(null)}
      />

      <ConfirmModal
        isOpen={showCheckinAllConfirm}
        title="一键全部打卡"
        message={`确定要为所有今日未打卡的习惯执行打卡吗？当前共有 ${habits.filter((h) => !h.isCheckedToday).length} 个习惯未打卡。`}
        confirmText="确认打卡"
        cancelText="取消"
        confirmButtonClass="bg-green-500 hover:bg-green-600"
        onConfirm={() => {
          setShowCheckinAllConfirm(false);
          handleCheckinAll();
        }}
        onCancel={() => setShowCheckinAllConfirm(false)}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="退出登录"
        message="确定要退出登录吗？您的数据会保留在服务器，下次登录即可恢复。"
        confirmText="退出登录"
        cancelText="取消"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
