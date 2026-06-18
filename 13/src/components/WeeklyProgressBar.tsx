import { GOAL_COLORS, GOAL_GOLD } from '../utils';

interface WeeklyProgressBarProps {
  goal: string;
  done: number;
  target: number;
  progress: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function WeeklyProgressBar({ goal, done, target, progress, showLabel = true, compact = false }: WeeklyProgressBarProps) {
  const reached = done >= target;
  const colors = GOAL_COLORS[goal] || GOAL_COLORS['保持'];
  const barColor = reached ? GOAL_GOLD : colors.bar;

  return (
    <div className={compact ? '' : 'space-y-1'}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 font-medium">本周进度</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{done} / {target} 次</span>
            {reached && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
                达标
              </span>
            )}
          </div>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full overflow-hidden h-2.5">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}
