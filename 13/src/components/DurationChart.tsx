import type { ChartItem } from '../types';
import { shortDate, weekdayStr } from '../utils';

interface DurationChartProps {
  data: ChartItem[];
  height?: number;
}

export function DurationChart({ data, height = 180 }: DurationChartProps) {
  const maxDuration = Math.max(...data.map(d => d.duration), 1);
  const yMax = Math.ceil(maxDuration * 1.2);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1 sm:gap-2" style={{ height }}>
        {data.map(item => {
          const h = yMax > 0 ? (item.duration / yMax) * 100 : 0;
          const hasData = item.duration > 0;
          return (
            <div key={item.date} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <div className="w-full flex flex-col items-center justify-end h-full">
                {hasData && (
                  <span className="text-xs text-gray-500 mb-1 font-medium">{item.duration}m</span>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${hasData ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-100'}`}
                  style={{ height: `${Math.max(h, hasData ? 4 : 2)}%`, minHeight: hasData ? '8px' : '4px' }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1 sm:gap-2 mt-2 border-t pt-2">
        {data.map(item => (
          <div key={item.date} className="flex-1 flex flex-col items-center min-w-0">
            <span className="text-xs text-gray-600 font-medium">{shortDate(item.date)}</span>
            <span className="text-[10px] text-gray-400">{weekdayStr(item.date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
