import { create } from 'zustand';
import { planApi, recordApi, statsApi } from '../services/api';
import type {
  PlanWithStats,
  Record,
  StatsOverview,
  Alert,
  CreatePlanDto,
  UpdatePlanDto,
  CreateRecordDto,
  UpdateRecordDto,
} from '../../shared/types.js';

interface PlanState {
  plans: PlanWithStats[];
  currentPlan: PlanWithStats | null;
  records: Record[];
  stats: StatsOverview | null;
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  newRecordId: number | null;
  filters: {
    status: 'all' | 'active' | 'completed';
    sortBy: 'startDate' | 'endDate' | 'name' | 'createdAt';
    search: string;
  };
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
  sortOrder: 'asc' | 'desc';
  newPlanFormOpen: boolean;
  editingPlan: PlanWithStats | null;
  deleteConfirmOpen: boolean;
  planToDelete: PlanWithStats | null;

  fetchPlans: () => Promise<void>;
  fetchPlan: (id: number) => Promise<void>;
  createPlan: (data: CreatePlanDto) => Promise<void>;
  updatePlan: (id: number, data: UpdatePlanDto) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  addRecord: (planId: number, data: CreateRecordDto) => Promise<boolean>;
  updateRecord: (planId: number, recordId: number, data: UpdateRecordDto) => Promise<void>;
  deleteRecord: (planId: number, recordId: number) => Promise<void>;
  fetchRecords: (planId: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  setFilters: (filters: Partial<PlanState['filters']>) => void;
  setNewRecordId: (id: number | null) => void;
  clearError: () => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setLoading: (loading: boolean) => void;
  openNewPlanForm: () => void;
  closePlanForm: () => void;
  openEditPlanForm: (plan: PlanWithStats) => void;
  openDeleteConfirm: (plan: PlanWithStats) => void;
  closeDeleteConfirm: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  currentPlan: null,
  records: [],
  stats: null,
  alerts: [],
  loading: false,
  error: null,
  newRecordId: null,
  filters: {
    status: 'all',
    sortBy: 'createdAt',
    search: '',
  },
  filter: 'all',
  searchQuery: '',
  sortOrder: 'desc',
  newPlanFormOpen: false,
  editingPlan: null,
  deleteConfirmOpen: false,
  planToDelete: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const plans = await planApi.getAllPlans(filters);
      set({ plans, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取计划列表失败',
        loading: false,
      });
    }
  },

  fetchPlan: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const plan = await planApi.getPlanById(id);
      set({ currentPlan: plan, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取计划详情失败',
        loading: false,
      });
    }
  },

  createPlan: async (data: CreatePlanDto) => {
    set({ loading: true, error: null });
    try {
      await planApi.createPlan(data);
      await get().fetchPlans();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建计划失败',
        loading: false,
      });
      throw error;
    }
  },

  updatePlan: async (id: number, data: UpdatePlanDto) => {
    set({ loading: true, error: null });
    try {
      const updatedPlan = await planApi.updatePlan(id, data);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? updatedPlan : p)),
        currentPlan: state.currentPlan?.id === id ? updatedPlan : state.currentPlan,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新计划失败',
        loading: false,
      });
      throw error;
    }
  },

  deletePlan: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await planApi.deletePlan(id);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除计划失败',
        loading: false,
      });
      throw error;
    }
  },

  addRecord: async (planId: number, data: CreateRecordDto): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const result = await recordApi.addRecord(planId, data);
      await get().fetchRecords(planId);
      await get().fetchPlan(planId);
      await get().fetchPlans();
      await get().fetchStats();
      set({ newRecordId: result.record.id, loading: false });

      setTimeout(() => {
        set({ newRecordId: null });
      }, 2000);

      return result.isUpdate;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '添加记录失败',
        loading: false,
      });
      throw error;
    }
  },

  updateRecord: async (planId: number, recordId: number, data: UpdateRecordDto) => {
    set({ loading: true, error: null });
    try {
      await recordApi.updateRecord(planId, recordId, data);
      await get().fetchRecords(planId);
      await get().fetchPlan(planId);
      await get().fetchStats();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新记录失败',
        loading: false,
      });
      throw error;
    }
  },

  deleteRecord: async (planId: number, recordId: number) => {
    set({ loading: true, error: null });
    try {
      await recordApi.deleteRecord(planId, recordId);
      await get().fetchRecords(planId);
      await get().fetchPlan(planId);
      await get().fetchStats();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除记录失败',
        loading: false,
      });
      throw error;
    }
  },

  fetchRecords: async (planId: number) => {
    set({ loading: true, error: null });
    try {
      const records = await recordApi.getRecords(planId);
      set({ records, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取记录列表失败',
        loading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await statsApi.getOverview();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  fetchAlerts: async () => {
    try {
      const alerts = await statsApi.getAlerts();
      set({ alerts });
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  },

  setFilters: (filters: Partial<PlanState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setNewRecordId: (id: number | null) => {
    set({ newRecordId: id });
  },

  clearError: () => {
    set({ error: null });
  },

  setFilter: (filter: 'all' | 'active' | 'completed') => {
    set({ filter });
    set((state) => ({
      filters: { ...state.filters, status: filter },
    }));
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    set((state) => ({
      filters: { ...state.filters, search: query },
    }));
  },

  setSortOrder: (order: 'asc' | 'desc') => {
    set({ sortOrder: order });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  openNewPlanForm: () => {
    set({ newPlanFormOpen: true, editingPlan: null });
  },

  closePlanForm: () => {
    set({ newPlanFormOpen: false, editingPlan: null });
  },

  openEditPlanForm: (plan: PlanWithStats) => {
    set({ editingPlan: plan, newPlanFormOpen: false });
  },

  openDeleteConfirm: (plan: PlanWithStats) => {
    set({ planToDelete: plan, deleteConfirmOpen: true });
  },

  closeDeleteConfirm: () => {
    set({ planToDelete: null, deleteConfirmOpen: false });
  },
}));
