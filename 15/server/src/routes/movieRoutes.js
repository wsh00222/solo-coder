const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/', movieController.list);
router.get('/stats', movieController.stats);
router.get('/distribution', movieController.ratingDistribution);
router.get('/recommend', movieController.recommend);
router.get('/meta', movieController.meta);
router.get('/:id', movieController.getById);

router.post('/', movieController.create);
router.post('/batch/delete', movieController.batchDelete);
router.post('/batch/status', movieController.batchUpdateStatus);
router.post('/:id/watched', movieController.markAsWatched);

router.put('/:id', movieController.update);

router.delete('/:id', movieController.remove);

module.exports = router;
