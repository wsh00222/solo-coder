export function calculateVotePercentages(
  approveCount: number,
  rejectCount: number
): { approvePercent: number; rejectPercent: number } {
  const total = approveCount + rejectCount;
  if (total === 0) {
    return { approvePercent: 0, rejectPercent: 0 };
  }
  return {
    approvePercent: Math.round((approveCount / total) * 100),
    rejectPercent: Math.round((rejectCount / total) * 100),
  };
}

export function getStatusText(status: 'open' | 'closed'): string {
  return status === 'open' ? '进行中' : '已截止';
}

export function getVoteTypeText(voteType: 'approve' | 'reject'): string {
  return voteType === 'approve' ? '赞成' : '反对';
}
