const StatsModel = require('../models/StatsModel');

class StatsService {
  static getGlobalStats() {
    return StatsModel.getGlobalStats();
  }
}

module.exports = StatsService;
