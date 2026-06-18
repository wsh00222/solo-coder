import { get, all } from '../models/database';
import { Statistics, ProposalWithVotes } from '../types';
import { updateExpiredProposals } from './proposalService';

export async function getStatistics(): Promise<Statistics> {
  await updateExpiredProposals();

  const proposalStats = await get<{ totalProposals: number; openProposals: number }>(`
    SELECT 
      COUNT(*) as totalProposals,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as openProposals
    FROM proposals
  `);

  const voteStats = await get<{ totalVotes: number }>(`
    SELECT COUNT(*) as totalVotes FROM votes
  `);

  const topProposal = await get<ProposalWithVotes>(`
    SELECT 
      p.*,
      COALESCE(SUM(CASE WHEN v.voteType = 'approve' THEN 1 ELSE 0 END), 0) as approveCount,
      COALESCE(SUM(CASE WHEN v.voteType = 'reject' THEN 1 ELSE 0 END), 0) as rejectCount,
      COUNT(v.id) as totalVotes
    FROM proposals p
    LEFT JOIN votes v ON p.id = v.proposalId
    GROUP BY p.id
    ORDER BY totalVotes DESC, p.createdAt DESC
    LIMIT 1
  `);

  return {
    totalProposals: proposalStats?.totalProposals || 0,
    openProposals: proposalStats?.openProposals || 0,
    totalVotes: voteStats?.totalVotes || 0,
    topProposal: topProposal || null,
  };
}
