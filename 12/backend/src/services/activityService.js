const db = require('../models/database');
const { getActivityStatus } = require('../utils/helpers');

class ActivityService {
  static getList({ status, sortOrder, keyword }) {
    let sql = `
      SELECT a.*,
             (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id) as registered_count
      FROM activities a
      WHERE 1=1
    `;
    const params = [];

    if (keyword) {
      sql += ' AND a.title LIKE ?';
      params.push(`%${keyword}%`);
    }

    if (sortOrder === 'asc') {
      sql += ' ORDER BY a.activity_time ASC';
    } else {
      sql += ' ORDER BY a.activity_time DESC';
    }

    let activities = db.queryAll(sql, params);

    activities = activities.map(a => ({
      ...a,
      status: getActivityStatus(a)
    }));

    if (status) {
      activities = activities.filter(a => a.status === status);
    }

    return activities;
  }

  static getById(id) {
    const activity = db.queryOne(`
      SELECT a.*,
             (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id) as registered_count
      FROM activities a WHERE a.id = ?
    `, [id]);

    if (!activity) return null;

    activity.status = getActivityStatus(activity);

    const registrations = db.queryAll(`
      SELECT * FROM registrations WHERE activity_id = ? ORDER BY created_at DESC
    `, [id]);

    activity.registrations = registrations;

    return activity;
  }

  static create(data) {
    const n = db.nowStr();
    const id = db.runAndGetLastId(`
      INSERT INTO activities (title, activity_time, location, registration_deadline, max_participants, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.title,
      data.activity_time,
      data.location,
      data.registration_deadline,
      data.max_participants,
      data.description,
      n, n
    ]);

    return this.getById(id);
  }

  static update(id, data) {
    const activity = this.getById(id);
    if (!activity) return null;
    if (activity.status !== 'open') {
      throw new Error('仅报名中状态的活动允许编辑');
    }

    db.runAndGetChanges(`
      UPDATE activities
      SET title = ?, activity_time = ?, location = ?, registration_deadline = ?,
          max_participants = ?, description = ?, updated_at = ?
      WHERE id = ?
    `, [
      data.title,
      data.activity_time,
      data.location,
      data.registration_deadline,
      data.max_participants,
      data.description,
      db.nowStr(),
      id
    ]);

    return this.getById(id);
  }

  static delete(id) {
    db.runAndGetChanges('DELETE FROM registrations WHERE activity_id = ?', [id]);
    db.runAndGetChanges('DELETE FROM activities WHERE id = ?', [id]);
    return true;
  }
}

module.exports = ActivityService;
