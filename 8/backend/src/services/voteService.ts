import { run, get, all } from '../models/database';
import { Vote, CreateVoteRequest } from '../types';
import { getProposalById } from './proposalService';

export async function getUserVote(proposalId: number, voterIp: string): Promise<Vote | null> {
  const vote = await get<Vote>(`
    SELECT * FROM votes WHERE proposalId = ? AND voterIp = ?
  `, [proposalId, voterIp]);

  return vote || null;
}

export async function createVote(
  proposalId: number,
  data: CreateVoteRequest,
  voterIp: string
): Promise<Vote | { error: string }> {
  const proposal = await getProposalById(proposalId);
  
  if (!proposal) {
    return { error: '提案不存在' };
  }

  if (proposal.status === 'closed') {
    return { error: '提案已截止，无法投票' };
  }

  const existingVote = await getUserVote(proposalId, voterIp);
  if (existingVote) {
    return { error: '您已经对此提案投过票了' };
  }

  const result = await run(`
    INSERT INTO votes (proposalId, voteType, nickname, voterIp)
    VALUES (?, ?, ?, ?)
  `, [
    proposalId,
    data.voteType,
    data.nickname || null,
    voterIp,
  ]);

  const vote = await get<Vote>('SELECT * FROM votes WHERE id = ?', [result.lastID]);
  return vote!;
}

export async function getVotesByProposal(proposalId: number): Promise<Vote[]> {
  return await all<Vote>(`
    SELECT * FROM votes WHERE proposalId = ? ORDER BY createdAt DESC
  `, [proposalId]);
}
