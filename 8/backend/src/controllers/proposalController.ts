import { Request, Response } from 'express';
import * as proposalService from '../services/proposalService';
import { CreateProposalRequest, UpdateProposalRequest } from '../types';

export async function getProposals(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 4;
    const status = req.query.status as 'open' | 'closed' | undefined;
    const proposer = req.query.proposer as string | undefined;

    if (status && !['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' });
    }

    const result = await proposalService.getProposals(page, pageSize, status, proposer);
    res.json(result);
  } catch (error) {
    console.error('获取提案列表失败:', error);
    res.status(500).json({ error: '获取提案列表失败' });
  }
}

export async function getProposalById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的提案ID' });
    }

    const proposal = await proposalService.getProposalById(id);
    
    if (!proposal) {
      return res.status(404).json({ error: '提案不存在' });
    }

    res.json(proposal);
  } catch (error) {
    console.error('获取提案详情失败:', error);
    res.status(500).json({ error: '获取提案详情失败' });
  }
}

export async function createProposal(req: Request, res: Response) {
  try {
    const data: CreateProposalRequest = req.body;

    if (!data.title || !data.description || !data.proposer) {
      return res.status(400).json({ error: '标题、描述和提案人不能为空' });
    }

    const proposal = await proposalService.createProposal(data);
    res.status(201).json(proposal);
  } catch (error) {
    console.error('创建提案失败:', error);
    res.status(500).json({ error: '创建提案失败' });
  }
}

export async function updateProposal(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const data: UpdateProposalRequest = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的提案ID' });
    }

    const updated = await proposalService.updateProposal(id, data);
    
    if (!updated) {
      return res.status(404).json({ error: '提案不存在' });
    }

    res.json(updated);
  } catch (error) {
    console.error('更新提案失败:', error);
    res.status(500).json({ error: '更新提案失败' });
  }
}

export async function deleteProposal(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的提案ID' });
    }

    const deleted = await proposalService.deleteProposal(id);
    
    if (!deleted) {
      return res.status(404).json({ error: '提案不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除提案失败:', error);
    res.status(500).json({ error: '删除提案失败' });
  }
}

export async function getProposers(req: Request, res: Response) {
  try {
    const proposers = await proposalService.getAllProposers();
    res.json(proposers);
  } catch (error) {
    console.error('获取提案人列表失败:', error);
    res.status(500).json({ error: '获取提案人列表失败' });
  }
}
