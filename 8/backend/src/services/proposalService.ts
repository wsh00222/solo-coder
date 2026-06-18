import { run, get, all } from '../models/database';
import { Proposal, ProposalWithVotes, CreateProposalRequest, UpdateProposalRequest, PaginatedResponse } from '../types';

export async function updateExpiredProposals() {
  const now = new Date().toISOString();
  await run(`
    UPDATE proposals 
    SET status = 'closed', updatedAt = ?
    WHERE status = 'open' AND deadline <= ?
  `, [now, now]);
}

export async function getProposals(
  page: number = 1,
  pageSize: number = 4,
  status?: 'open' | 'closed',
  proposer?: string
): Promise<PaginatedResponse<ProposalWithVotes>> {
  await updateExpiredProposals();

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (status) {
    whereClauses.push('p.status = ?');
    params.push(status);
  }

  if (proposer) {
    whereClauses.push('p.proposer = ?');
    params.push(proposer);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await get<{ count: number }>(`
    SELECT COUNT(*) as count FROM proposals p ${whereSql}
  `, params);

  const total = countResult?.count || 0;
  const offset = (page - 1) * pageSize;

  const proposals = await all<ProposalWithVotes>(`
    SELECT 
      p.*,
      COALESCE(SUM(CASE WHEN v.voteType = 'approve' THEN 1 ELSE 0 END), 0) as approveCount,
      COALESCE(SUM(CASE WHEN v.voteType = 'reject' THEN 1 ELSE 0 END), 0) as rejectCount,
      COUNT(v.id) as totalVotes
    FROM proposals p
    LEFT JOIN votes v ON p.id = v.proposalId
    ${whereSql}
    GROUP BY p.id
    ORDER BY p.createdAt DESC
    LIMIT ? OFFSET ?
  `, [...params, pageSize, offset]);

  return {
    data: proposals,
    total,
    page,
    pageSize
  };
}

export async function getProposalById(id: number): Promise<ProposalWithVotes | null> {
  await updateExpiredProposals();

  const proposal = await get<ProposalWithVotes>(`
    SELECT 
      p.*,
      COALESCE(SUM(CASE WHEN v.voteType = 'approve' THEN 1 ELSE 0 END), 0) as approveCount,
      COALESCE(SUM(CASE WHEN v.voteType = 'reject' THEN 1 ELSE 0 END), 0) as rejectCount,
      COUNT(v.id) as totalVotes
    FROM proposals p
    LEFT JOIN votes v ON p.id = v.proposalId
    WHERE p.id = ?
    GROUP BY p.id
  `, [id]);

  return proposal || null;
}

export async function createProposal(data: CreateProposalRequest): Promise<Proposal> {
  const now = new Date();
  const deadline = data.deadline 
    ? new Date(data.deadline).toISOString()
    : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const status = new Date(deadline) <= now ? 'closed' : 'open';

  const result = await run(`
    INSERT INTO proposals (title, description, proposer, deadline, attachmentUrl, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.title,
    data.description,
    data.proposer,
    deadline,
    data.attachmentUrl || null,
    status,
    now.toISOString(),
    now.toISOString(),
  ]);

  const proposal = await get<Proposal>('SELECT * FROM proposals WHERE id = ?', [result.lastID]);
  return proposal!;
}

export async function updateProposal(id: number, data: UpdateProposalRequest): Promise<Proposal | null> {
  const existing = await getProposalById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.deadline !== undefined) {
    updates.push('deadline = ?');
    params.push(new Date(data.deadline).toISOString());
  }

  if (updates.length === 0) return existing as Proposal;

  updates.push('updatedAt = ?');
  params.push(now, id);

  await run(`
    UPDATE proposals 
    SET ${updates.join(', ')}
    WHERE id = ?
  `, params);

  await updateExpiredProposals();

  const updated = await get<Proposal>('SELECT * FROM proposals WHERE id = ?', [id]);
  return updated || null;
}

export async function deleteProposal(id: number): Promise<boolean> {
  const result = await run('DELETE FROM proposals WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function getAllProposers(): Promise<string[]> {
  const rows = await all<{ proposer: string }>(`
    SELECT DISTINCT proposer FROM proposals ORDER BY proposer
  `);
  
  return rows.map(r => r.proposer);
}
