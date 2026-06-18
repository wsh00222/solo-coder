import React, { useState, useEffect } from 'react';
import type { Habit, HeatmapData as HeatmapDataItem } from '../types';
import { habitApi } from '../api/habitApi';
import { formatDisplayDate, getChineseWeekday } from '../utils/dateUtils';

interface HeatmapModalProps {
  isOpen: boolean;
  habit: Habit;
  onClose: () => void;
}

interface HoverInfo {
  date: string;
  checked: boolean;
  x: number;
  y: number;
}

const HeatmapModal: React.FC<HeatmapModalProps> = ({
  isOpen,
  habit,
  onClose,
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  useEffect(() => {
    if (isOpen && habit?.id) {
      fetchHeatmap();
    }
  }, [isOpen, habit?.id]);

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const data = await habitApi.getHeatmapData(habit.id);
      setHeatmapData(data.heatmapData);
    } catch (error) {
      console.error('获取热力图数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const generateWeeks = () => {
    if (heatmapData.length === 0) return [];

    const weeks: HeatmapDataItem[][] = [];
    const firstDate = new Date(heatmapData[0].date);
    const firstDayOfWeek = firstDate.getDay() || 7;
    const paddingDays = firstDayOfWeek - 1;

    let currentWeek: (HeatmapDataItem | null)[] = [];
    for (let i = 0; i < paddingDays; i++) {
      currentWeek.push(null);
    }

    for (const item of heatmapData) {
      currentWeek.push(item);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek.filter((d): d is HeatmapDataItem => d !== null));
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek.filter((d): d is HeatmapDataItem => d !== null));
    }

    return weeks;
  };

  const weeks = generateWeeks();
  const weekdayLabels = ['一', '三', '五'];
  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const firstItem = week[0];
      const month = new Date(firstItem.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: `${month + 1}月`,
          index: weekIndex,
        });
        lastMonth = month;
      }
    }
  });

  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getCheckedColor = (index: number, total: number): string => {
    if (total <= 1) return habit.color;
    const factor = index / (total - 1);
    const lightness = 1 - factor * 0.5;
    const hex = habit.color.replace('#', '');
    const r = Math.floor(parseInt(hex.substring(0, 2), 16) * lightness);
    const g = Math.floor(parseInt(hex.substring(2, 4), 16) * lightness);
    const b = Math.floor(parseInt(hex.substring(4, 6), 16) * lightness);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-fade-in max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                {habit.name} - 打卡热力图
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                过去三个月的打卡记录，共打卡 {heatmapData.filter(d => d.checked).length} 天
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto scrollbar-thin flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-1 mb-2 ml-8">
                {monthLabels.map((ml, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-gray-500 font-medium"
                    style={{
                      position: 'absolute',
                      left: `${ml.index * 18 + 32}px`,
                      top: '0',
                    }}
                  >
                    {ml.label}
                  </div>
                ))}
              </div>

              <div className="flex gap-1 mt-6">
                <div className="flex flex-col gap-1 mr-2 text-xs text-gray-400 pt-1">
                  {weekdayLabels.map((label, idx) => (
                    <div key={idx} className="h-3 flex items-center">
                      {idx === 0 && <span>一</span>}
                      {idx === 1 && <span>三</span>}
                      {idx === 2 && <span>五</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-2">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const item = week[dayIndex];
                        if (!item) {
                          return <div key={dayIndex} className="w-4 h-4 rounded-sm" />;
                        }

                        const checkedCount = heatmapData.filter(d => d.checked).length;
                        const bgColor = item.checked
                          ? habit.color
                          : '#e5e7eb';

                        return (
                          <div
                            key={dayIndex}
                            className="w-4 h-4 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-gray-400"
                            style={{
                              backgroundColor: bgColor,
                              opacity: item.checked ? 1 : 0.4,
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                              setHoverInfo({
                                date: item.date,
                                checked: item.checked,
                                x: rect.left - (containerRect?.left || 0) + rect.width / 2,
                                y: rect.top - (containerRect?.top || 0) - 10,
                              });
                            }}
                            onMouseLeave={() => setHoverInfo(null)}
                            title={`${formatDisplayDate(item.date)} ${getChineseWeekday(item.date)} - ${item.checked ? '已打卡' : '未打卡'}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {hoverInfo && (
                <div
                  className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: hoverInfo.x,
                    top: hoverInfo.y,
                  }}
                >
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-medium">
                      {formatDisplayDate(hoverInfo.date)} {getChineseWeekday(hoverInfo.date)}
                    </div>
                    <div className="mt-1">
                      {hoverInfo.checked ? (
                        <span className="text-green-400">✓ 已打卡</span>
                      ) : (
                        <span className="text-gray-400">未打卡</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-4 text-xs text-gray-500">
            <span>少</span>
            <div className="flex gap-1">
              {[0.3, 0.5, 0.7, 0.9, 1].map((opacity, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor: habit.color,
                    opacity,
                  }}
                />
              ))}
            </div>
            <span>多</span>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">连续打卡：</span>
                <span className="font-bold text-orange-500">{habit.streak}天</span>
              </div>
              <div>
                <span className="text-gray-500">本周进度：</span>
                <span className="font-bold" style={{ color: habit.color }}>
                  {habit.weekCount}/{habit.targetCount} ({habit.progressPercent}%)
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapModal;
