const db = require('../models/database');
const ActivityService = require('./activityService');

class RegistrationService {
  static register(activityId, data) {
    const activity = ActivityService.getById(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }
    if (activity.status !== 'open') {
      throw new Error('活动不在报名中状态');
    }
    if (activity.registered_count >= activity.max_participants) {
      throw new Error('活动报名人数已满');
    }

    const existing = db.queryOne(
      'SELECT * FROM registrations WHERE activity_id = ? AND phone = ?',
      [activityId, data.phone]
    );

    if (existing) {
      throw new Error('该手机号已报名此活动');
    }

    const id = db.runAndGetLastId(
      'INSERT INTO registrations (activity_id, name, phone, email, checked_in, created_at) VALUES (?, ?, ?, ?, 0, ?)',
      [activityId, data.name, data.phone, data.email || null, db.nowStr()]
    );

    return db.queryOne('SELECT * FROM registrations WHERE id = ?', [id]);
  }

  static cancel(id) {
    const registration = db.queryOne('SELECT * FROM registrations WHERE id = ?', [id]);
    if (!registration) {
      throw new Error('报名记录不存在');
    }

    const activity = ActivityService.getById(registration.activity_id);
    if (activity && activity.status === 'ended') {
      throw new Error('活动已结束，无法取消报名');
    }

    db.runAndGetChanges('DELETE FROM registrations WHERE id = ?', [id]);
    return true;
  }

  static checkInByPhone(activityId, phone) {
    const activity = ActivityService.getById(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }
    if (activity.status !== 'ended') {
      throw new Error('活动未结束，暂不可签到');
    }

    const registration = db.queryOne(
      'SELECT * FROM registrations WHERE activity_id = ? AND phone = ?',
      [activityId, phone]
    );

    if (!registration) {
      throw new Error('未找到该手机号的报名记录');
    }
    if (registration.checked_in) {
      throw new Error('该报名记录已签到');
    }

    db.runAndGetChanges(
      'UPDATE registrations SET checked_in = 1, checked_in_at = ? WHERE id = ?',
      [db.nowStr(), registration.id]
    );

    return db.queryOne('SELECT * FROM registrations WHERE id = ?', [registration.id]);
  }
}

module.exports = RegistrationService;
