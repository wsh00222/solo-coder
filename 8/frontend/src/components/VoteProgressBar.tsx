import React from 'react';
import { calculateVotePercentages } from '../utils/vote';

interface VoteProgressBarProps {
  approveCount: number;
  rejectCount: number;
  totalVotes: number;
}

const VoteProgressBar: React.FC<VoteProgressBarProps> = ({
  approveCount,
  rejectCount,
  totalVotes,
}) => {
  const { approvePercent, rejectPercent } = calculateVotePercentages(approveCount, rejectCount);

  if (totalVotes === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>赞成 0</span>
          <span>反对 0</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
          <span className="text-xs text-gray-500">暂无投票</span>
        </div>
        <div className="text-center text-sm text-gray-500 mt-1">共 0 人投票</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-green-600 font-medium">赞成 {approveCount}</span>
        <span className="text-red-500 font-medium">反对 {rejectCount}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${approvePercent}%` }}
        />
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${rejectPercent}%` }}
        />
      </div>
      <div className="text-center text-sm text-gray-500 mt-1">共 {totalVotes} 人投票</div>
    </div>
  );
};

export default VoteProgressBar;
