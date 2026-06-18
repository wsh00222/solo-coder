export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  deadline: string;
  attachmentUrl?: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: number;
  proposalId: number;
  voteType: 'approve' | 'reject';
  nickname?: string;
  voterIp: string;
  createdAt: string;
}

export interface ProposalWithVotes extends Proposal {
  approveCount: number;
  rejectCount: number;
  totalVotes: number;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  proposer: string;
  deadline?: string;
  attachmentUrl?: string;
}

export interface UpdateProposalRequest {
  title?: string;
  description?: string;
  deadline?: string;
}

export interface CreateVoteRequest {
  voteType: 'approve' | 'reject';
  nickname?: string;
}

export interface Statistics {
  totalProposals: number;
  openProposals: number;
  totalVotes: number;
  topProposal: ProposalWithVotes | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
