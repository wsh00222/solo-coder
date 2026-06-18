const express = require('express');
const ActivityController = require('../controllers/activityController');
const RegistrationController = require('../controllers/registrationController');

const router = express.Router();

router.get('/activities', ActivityController.list);
router.get('/activities/:id', ActivityController.detail);
router.post('/activities', ActivityController.create);
router.put('/activities/:id', ActivityController.update);
router.delete('/activities/:id', ActivityController.remove);
router.get('/activities/:id/export', ActivityController.exportCsv);

router.post('/activities/:id/register', RegistrationController.register);
router.delete('/registrations/:id', RegistrationController.cancel);
router.post('/activities/:id/checkin', RegistrationController.checkIn);

module.exports = router;
