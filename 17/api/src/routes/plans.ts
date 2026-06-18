import { Router } from 'express';
import { PlanController } from '../controllers/PlanController.js';
import { RecordController } from '../controllers/RecordController.js';

const router = Router();

router.get('/', PlanController.getAllPlans);
router.get('/:id', PlanController.getPlanById);
router.post('/', PlanController.createPlan);
router.put('/:id', PlanController.updatePlan);
router.delete('/:id', PlanController.deletePlan);

router.get('/:planId/records', RecordController.getRecords);
router.post('/:planId/records', RecordController.addRecord);
router.put('/:planId/records/:recordId', RecordController.updateRecord);
router.delete('/:planId/records/:recordId', RecordController.deleteRecord);
router.get('/:planId/records/today/exists', RecordController.checkTodayRecord);

router.get('/:planId/trend', RecordController.getTrendData);
router.get('/:planId/export', RecordController.exportCSV);

export default router;
