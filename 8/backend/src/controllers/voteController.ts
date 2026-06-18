import { Request, Response } from 'express';
import * as voteService from '../services/voteService';
import { CreateVoteRequest } from '../types';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
}

export async function getUserVote(req: Request, res: Response) {
  try {
    const proposalId = parseInt(req.params.proposalId);
    
    if (isNaN(proposalId)) {
      return res.status(400).json({ error: '无效的提案ID' });
    }

    const voterIp = getClientIp(req);
    const vote = await voteService.getUserVote(proposalId, voterIp);
    
    res.json(vote);
  } catch (error) {
    console.error('获取用户投票失败:', error);
    res.status(500).json({ error: '获取用户投票失败' });
  }
}

export async function createVote(req: Request, res: Response) {
  try {
    const proposalId = parseInt(req.params.proposalId);
    const data: CreateVoteRequest = req.body;

    if (isNaN(proposalId)) {
      return res.status(400).json({ error: '无效的提案ID' });
    }

    if (!data.voteType || !['approve', 'reject'].includes(data.voteType)) {
      return res.status(400).json({ error: '无效的投票类型' });
    }

    const voterIp = getClientIp(req);
    const result = await voteService.createVote(proposalId, data, voterIp);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('创建投票失败:', error);
    res.status(500).json({ error: '创建投票失败' });
  }
}

export async function getVotesByProposal(req: Request, res: Response) {
  try {
    const proposalId = parseInt(req.params.proposalId);
    
    if (isNaN(proposalId)) {
      return res.status(400).json({ error: '无效的提案ID' });
    }

    const votes = await voteService.getVotesByProposal(proposalId);
    res.json(votes);
  } catch (error) {
    console.error('获取投票列表失败:', error);
    res.status(500).json({ error: '获取投票列表失败' });
  }
}
