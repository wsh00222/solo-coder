const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

router.get('/', borrowController.listRecords);
router.get('/stats/:id', borrowController.getEquipmentStats);
router.post('/:id/borrow', borrowController.borrowEquipment);
router.post('/:id/return', borrowController.returnEquipment);

module.exports = router;
