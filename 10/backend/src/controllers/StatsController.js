const StatsService = require('../services/StatsService');

class StatsController {
  static async getGlobalStats(req, res, next) {
    try {
      const stats = StatsService.getGlobalStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = StatsController;
