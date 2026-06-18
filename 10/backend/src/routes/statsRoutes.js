const express = require('express');
const StatsController = require('../controllers/StatsController');

const router = express.Router();

router.get('/', StatsController.getGlobalStats);

module.exports = router;
