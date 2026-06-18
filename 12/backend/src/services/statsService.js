const db = require('../models/database');
const ActivityService = require('./activityService');
const { escapeCsv } = require('../utils/helpers');

class StatsService {
  static getGlobalStats() {
    const activities = ActivityService.getList({});

    const totalActivities = activities.length;
    const openActivities = activities.filter(a => a.status === 'open').length;

    const totalRegsResult = db.queryOne('SELECT COUNT(*) as count FROM registrations');
    const totalRegistrations = totalRegsResult ? totalRegsResult.count : 0;

    const checkedInResult = db.queryOne('SELECT COUNT(*) as count FROM registrations WHERE checked_in = 1');
    const checkedInCount = checkedInResult ? checkedInResult.count : 0;

    return {
      totalActivities,
      openActivities,
      totalRegistrations,
      checkedInCount
    };
  }

  static exportCsv(activityId) {
    const activity = ActivityService.getById(activityId);
    if (!activity) return null;

    const headers = ['姓名', '手机号', '邮箱', '签到状态'];
    const rows = activity.registrations.map(r => [
      r.name,
      r.phone,
      r.email || '',
      r.checked_in ? '已签到' : '未签到'
    ]);

    const csvLines = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    return {
      filename: `${activity.title}_报名名单.csv`,
      content: '\uFEFF' + csvLines
    };
  }
}

module.exports = StatsService;
