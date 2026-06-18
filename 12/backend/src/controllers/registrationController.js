const RegistrationService = require('../services/registrationService');

class RegistrationController {
  static register(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, email } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ success: false, message: '请填写姓名和手机号' });
      }

      const registration = RegistrationService.register(id, { name, phone, email });
      res.json({ success: true, data: registration });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static cancel(req, res) {
    try {
      const { id } = req.params;
      RegistrationService.cancel(id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static checkIn(req, res) {
    try {
      const { id } = req.params;
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ success: false, message: '请输入手机号' });
      }

      const registration = RegistrationService.checkInByPhone(id, phone);
      res.json({ success: true, data: registration });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = RegistrationController;
