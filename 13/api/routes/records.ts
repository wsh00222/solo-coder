import { Router } from 'express';
import { RecordController } from '../controllers/recordController';

const router = Router();

router.get('/plan/:planId', RecordController.getByPlanId);
router.get('/plan/:planId/check-today', RecordController.checkToday);
router.post('/', RecordController.create);
router.delete('/:id', RecordController.remove);

export default router;
