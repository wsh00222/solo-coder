import { Router } from 'express';
import * as voteController from '../controllers/voteController';

const router = Router();

router.get('/:proposalId', voteController.getUserVote);
router.post('/:proposalId', voteController.createVote);
router.get('/:proposalId/all', voteController.getVotesByProposal);

export default router;
