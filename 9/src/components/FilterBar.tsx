import type { FilterStatus, SortOrder } from '../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { getStatusLabel } from '../utils/planUtils';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
}

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'upcoming', label: getStatusLabel('upcoming') },
  { value: 'ongoing', label: getStatusLabel('ongoing') },
  { value: 'ended', label: getStatusLabel('ended') },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortOrder,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索目的地..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium transition-all',
                    filterStatus === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => onSortChange('asc')}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-all',
                  sortOrder === 'asc'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                title="出发日期升序"
              >
                升序
              </button>
              <button
                onClick={() => onSortChange('desc')}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-all',
                  sortOrder === 'desc'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                title="出发日期降序"
              >
                降序
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
