const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', habitController.getAllHabits);
router.get('/stats/global', habitController.getGlobalStats);
router.post('/checkin-all', habitController.checkinAllToday);
router.get('/:id', habitController.getHabitById);
router.post('/', habitController.createHabit);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/checkin', habitController.addCheckin);
router.delete('/:id/checkin', habitController.removeCheckin);
router.get('/:id/heatmap', habitController.getHeatmapData);

module.exports = router;
