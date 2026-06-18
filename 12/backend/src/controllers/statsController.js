const StatsService = require('../services/statsService');

class StatsController {
  static getGlobalStats(req, res) {
    try {
      const stats = StatsService.getGlobalStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = StatsController;
