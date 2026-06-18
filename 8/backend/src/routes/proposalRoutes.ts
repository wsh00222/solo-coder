import { Router } from 'express';
import * as proposalController from '../controllers/proposalController';

const router = Router();

router.get('/', proposalController.getProposals);
router.get('/proposers', proposalController.getProposers);
router.get('/:id', proposalController.getProposalById);
router.post('/', proposalController.createProposal);
router.put('/:id', proposalController.updateProposal);
router.delete('/:id', proposalController.deleteProposal);

export default router;
