import { Router } from 'express';
import { StatsController } from '../controllers/statsController';

const router = Router();

router.get('/global', StatsController.getGlobal);
router.get('/reminder', StatsController.getReminder);
router.get('/last7days', StatsController.getLast7DaysChart);

export default router;
