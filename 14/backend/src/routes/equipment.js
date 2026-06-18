const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

router.get('/', equipmentController.listEquipment);
router.get('/statistics', equipmentController.getStatistics);
router.get('/refresh-overdue', equipmentController.refreshOverdue);
router.get('/export', equipmentController.exportCSV);
router.get('/:id', equipmentController.getEquipment);
router.post('/', equipmentController.createEquipment);
router.put('/:id', equipmentController.updateEquipment);
router.delete('/:id', equipmentController.deleteEquipment);

module.exports = router;
