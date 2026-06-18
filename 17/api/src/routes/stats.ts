import { Router } from 'express';
import { StatsController } from '../controllers/StatsController.js';

const router = Router();

router.get('/overview', StatsController.getOverview);
router.get('/alerts', StatsController.getAlerts);

export default router;
