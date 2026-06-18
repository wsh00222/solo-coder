import axios from 'axios';
import type {
  Plan,
  PlanWithStats,
  Record,
  StatsOverview,
  Alert,
  TrendDataPoint,
  CreatePlanDto,
  UpdatePlanDto,
  CreateRecordDto,
  UpdateRecordDto,
  ApiResponse,
} from '../../shared/types.js';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const planApi = {
  async getAllPlans(options?: {
    status?: 'all' | 'active' | 'completed';
    sortBy?: 'startDate' | 'endDate' | 'name' | 'createdAt';
    search?: string;
  }): Promise<PlanWithStats[]> {
    const response = await apiClient.get<ApiResponse<PlanWithStats[]>>('/plans', {
      params: options,
    });
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async getPlanById(id: number): Promise<PlanWithStats> {
    const response = await apiClient.get<ApiResponse<PlanWithStats>>(`/plans/${id}`);
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async createPlan(data: CreatePlanDto): Promise<PlanWithStats> {
    const response = await apiClient.post<ApiResponse<PlanWithStats>>('/plans', data);
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async updatePlan(id: number, data: UpdatePlanDto): Promise<PlanWithStats> {
    const response = await apiClient.put<ApiResponse<PlanWithStats>>(`/plans/${id}`, data);
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async deletePlan(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/plans/${id}`);
    if (!response.data.success) throw new Error(response.data.error);
  },
};

export const recordApi = {
  async getRecords(planId: number): Promise<Record[]> {
    const response = await apiClient.get<ApiResponse<Record[]>>(`/plans/${planId}/records`);
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async addRecord(planId: number, data: CreateRecordDto): Promise<{ record: Record; isUpdate: boolean }> {
    const response = await apiClient.post<ApiResponse<Record>>(`/plans/${planId}/records`, data);
    if (!response.data.success) throw new Error(response.data.error);
    return {
      record: response.data.data!,
      isUpdate: response.data.message === '今日记录已更新',
    };
  },

  async updateRecord(planId: number, recordId: number, data: UpdateRecordDto): Promise<Record> {
    const response = await apiClient.put<ApiResponse<Record>>(
      `/plans/${planId}/records/${recordId}`,
      data
    );
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async deleteRecord(planId: number, recordId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/plans/${planId}/records/${recordId}`
    );
    if (!response.data.success) throw new Error(response.data.error);
  },

  async getTrendData(planId: number, days: number = 30): Promise<TrendDataPoint[]> {
    const response = await apiClient.get<ApiResponse<TrendDataPoint[]>>(
      `/plans/${planId}/trend`,
      { params: { days } }
    );
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async checkTodayRecord(planId: number): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<{ exists: boolean }>>(
      `/plans/${planId}/records/today/exists`
    );
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!.exists;
  },

  async exportCSV(planId: number): Promise<void> {
    const response = await apiClient.get(`/plans/${planId}/export`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `学习记录_${planId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const statsApi = {
  async getOverview(): Promise<StatsOverview> {
    const response = await apiClient.get<ApiResponse<StatsOverview>>('/stats/overview');
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },

  async getAlerts(): Promise<Alert[]> {
    const response = await apiClient.get<ApiResponse<Alert[]>>('/stats/alerts');
    if (!response.data.success) throw new Error(response.data.error);
    return response.data.data!;
  },
};

export const api = {
  plans: {
    getAll: planApi.getAllPlans,
    getById: planApi.getPlanById,
    create: planApi.createPlan,
    update: planApi.updatePlan,
    delete: planApi.deletePlan,
  },
  records: {
    getAll: recordApi.getRecords,
    create: async (planId: number, data: CreateRecordDto) => {
      const result = await recordApi.addRecord(planId, data);
      return result;
    },
    update: recordApi.updateRecord,
    delete: recordApi.deleteRecord,
    getTrend: recordApi.getTrendData,
    checkTodayExists: recordApi.checkTodayRecord,
    exportCSV: async (planId: number): Promise<string> => {
      const response = await apiClient.get(`/plans/${planId}/export`, {
        responseType: 'text',
      });
      return response.data;
    },
  },
  stats: {
    getOverview: statsApi.getOverview,
    getAlerts: statsApi.getAlerts,
  },
};
