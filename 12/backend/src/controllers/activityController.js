const ActivityService = require('../services/activityService');
const StatsService = require('../services/statsService');

class ActivityController {
  static list(req, res) {
    try {
      const { status, sortOrder = 'desc', keyword = '' } = req.query;
      const activities = ActivityService.getList({ status, sortOrder, keyword });
      res.json({ success: true, data: activities });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static detail(req, res) {
    try {
      const { id } = req.params;
      const activity = ActivityService.getById(id);
      if (!activity) {
        return res.status(404).json({ success: false, message: '活动不存在' });
      }
      res.json({ success: true, data: activity });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static create(req, res) {
    try {
      const { title, activity_time, location, registration_deadline, max_participants, description } = req.body;

      if (!title || !activity_time || !location || !registration_deadline || !max_participants) {
        return res.status(400).json({ success: false, message: '请填写所有必填项' });
      }

      const activity = ActivityService.create({
        title, activity_time, location, registration_deadline,
        max_participants: parseInt(max_participants), description
      });
      res.json({ success: true, data: activity });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static update(req, res) {
    try {
      const { id } = req.params;
      const { title, activity_time, location, registration_deadline, max_participants, description } = req.body;

      if (!title || !activity_time || !location || !registration_deadline || !max_participants) {
        return res.status(400).json({ success: false, message: '请填写所有必填项' });
      }

      const activity = ActivityService.update(id, {
        title, activity_time, location, registration_deadline,
        max_participants: parseInt(max_participants), description
      });

      if (!activity) {
        return res.status(404).json({ success: false, message: '活动不存在' });
      }

      res.json({ success: true, data: activity });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = ActivityService.delete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: '活动不存在' });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static exportCsv(req, res) {
    try {
      const { id } = req.params;
      const result = StatsService.exportCsv(id);
      if (!result) {
        return res.status(404).json({ success: false, message: '活动不存在' });
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"`);
      res.send(result.content);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = ActivityController;
