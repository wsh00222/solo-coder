import axios from 'axios';
import {
  Proposal,
  ProposalWithVotes,
  CreateProposalRequest,
  UpdateProposalRequest,
  CreateVoteRequest,
  Vote,
  Statistics,
  PaginatedResponse,
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const proposalApi = {
  getProposals: (
    page: number = 1,
    pageSize: number = 4,
    status?: 'open' | 'closed',
    proposer?: string
  ): Promise<PaginatedResponse<ProposalWithVotes>> => {
    const params: Record<string, any> = { page, pageSize };
    if (status) params.status = status;
    if (proposer) params.proposer = proposer;
    return api.get('/proposals', { params }).then((res) => res.data);
  },

  getProposalById: (id: number): Promise<ProposalWithVotes> =>
    api.get(`/proposals/${id}`).then((res) => res.data),

  createProposal: (data: CreateProposalRequest): Promise<Proposal> =>
    api.post('/proposals', data).then((res) => res.data),

  updateProposal: (id: number, data: UpdateProposalRequest): Promise<Proposal> =>
    api.put(`/proposals/${id}`, data).then((res) => res.data),

  deleteProposal: (id: number): Promise<void> =>
    api.delete(`/proposals/${id}`).then((res) => res.data),

  getProposers: (): Promise<string[]> =>
    api.get('/proposals/proposers').then((res) => res.data),
};

export const voteApi = {
  getUserVote: (proposalId: number): Promise<Vote | null> =>
    api.get(`/votes/${proposalId}`).then((res) => res.data),

  createVote: (proposalId: number, data: CreateVoteRequest): Promise<Vote> =>
    api.post(`/votes/${proposalId}`, data).then((res) => res.data),

  getVotesByProposal: (proposalId: number): Promise<Vote[]> =>
    api.get(`/votes/${proposalId}/all`).then((res) => res.data),
};

export const statisticsApi = {
  getStatistics: (): Promise<Statistics> =>
    api.get('/statistics').then((res) => res.data),
};
