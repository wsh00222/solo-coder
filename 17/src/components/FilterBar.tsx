import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { usePlanStore } from '../store/usePlanStore';

interface FilterBarProps {
  onNewPlan: () => void;
}

export default function FilterBar({ onNewPlan }: FilterBarProps) {
  const { filters, setFilters } = usePlanStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索计划名称或目标..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">筛选</span>
          </button>
          <button
            onClick={onNewPlan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>新建计划</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">状态：</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  status: e.target.value as 'all' | 'active' | 'completed',
                })
              }
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="active">进行中</option>
              <option value="completed">已结束</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">排序：</label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({
                  sortBy: e.target.value as
                    | 'startDate'
                    | 'endDate'
                    | 'name'
                    | 'createdAt',
                })
              }
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">创建时间</option>
              <option value="startDate">开始日期</option>
              <option value="endDate">结束日期</option>
              <option value="name">计划名称</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
