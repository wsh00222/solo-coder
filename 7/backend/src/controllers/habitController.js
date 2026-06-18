const habitService = require('../services/habitService');

const getAllHabits = (req, res) => {
  try {
    const habits = habitService.getAllHabits(req.user.id);
    res.json(habits);
  } catch (error) {
    console.error('获取习惯列表失败:', error);
    res.status(500).json({ error: '获取习惯列表失败' });
  }
};

const getHabitById = (req, res) => {
  try {
    const habit = habitService.getHabitById(parseInt(req.params.id), req.user.id);
    if (!habit) {
      return res.status(404).json({ error: '习惯不存在' });
    }
    res.json(habit);
  } catch (error) {
    console.error('获取习惯详情失败:', error);
    res.status(500).json({ error: '获取习惯详情失败' });
  }
};

const createHabit = (req, res) => {
  try {
    const { name, frequency_type, frequency_count, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '习惯名称不能为空' });
    }

    if (!['daily', 'weekly', 'monthly'].includes(frequency_type)) {
      return res.status(400).json({ error: '无效的频率类型' });
    }

    if (frequency_count !== undefined && frequency_count < 1) {
      return res.status(400).json({ error: '频率次数必须大于0' });
    }

    const habit = habitService.createHabit(
      {
        name: name.trim(),
        frequency_type,
        frequency_count: frequency_count || 1,
        color: color || '#3B82F6',
      },
      req.user.id
    );

    res.status(201).json({
      success: true,
      habit,
      message: '习惯创建成功',
    });
  } catch (error) {
    console.error('创建习惯失败:', error);
    res.status(500).json({ error: '创建习惯失败' });
  }
};

const updateHabit = (req, res) => {
  try {
    const { name, frequency_type, frequency_count, color } = req.body;
    const id = parseInt(req.params.id);

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: '习惯名称不能为空' });
    }

    if (frequency_type !== undefined && !['daily', 'weekly', 'monthly'].includes(frequency_type)) {
      return res.status(400).json({ error: '无效的频率类型' });
    }

    if (frequency_count !== undefined && frequency_count < 1) {
      return res.status(400).json({ error: '频率次数必须大于0' });
    }

    const habit = habitService.updateHabit(
      id,
      {
        name: name !== undefined ? name.trim() : undefined,
        frequency_type,
        frequency_count,
        color,
      },
      req.user.id
    );

    if (!habit) {
      return res.status(404).json({ error: '习惯不存在' });
    }

    res.json({
      success: true,
      habit,
      message: '习惯更新成功',
    });
  } catch (error) {
    console.error('更新习惯失败:', error);
    res.status(500).json({ error: '更新习惯失败' });
  }
};

const deleteHabit = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = habitService.deleteHabit(id, req.user.id);

    if (!success) {
      return res.status(404).json({ error: '习惯不存在' });
    }

    const stats = habitService.getGlobalStats(req.user.id);

    res.json({
      success: true,
      stats,
      message: '习惯删除成功',
    });
  } catch (error) {
    console.error('删除习惯失败:', error);
    res.status(500).json({ error: '删除习惯失败' });
  }
};

const addCheckin = (req, res) => {
  try {
    const { date } = req.body;
    const habitId = parseInt(req.params.id);

    const result = habitService.addCheckin(habitId, date, req.user.id);

    if (!result.success) {
      if (result.alreadyChecked) {
        return res.json({
          success: false,
          alreadyChecked: true,
          message: result.error,
        });
      }
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.error,
      });
    }

    res.json({
      success: true,
      habit: result.habit,
      date: result.date,
      isBackfill: !date || date === new Date().toISOString().split('T')[0] ? false : true,
      message: date && date !== new Date().toISOString().split('T')[0] ? '补打卡成功' : '打卡成功',
    });
  } catch (error) {
    console.error('打卡失败:', error);
    res.status(500).json({ error: '打卡失败' });
  }
};

const removeCheckin = (req, res) => {
  try {
    const { date } = req.body;
    const habitId = parseInt(req.params.id);

    const result = habitService.removeCheckin(habitId, date, req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.error,
      });
    }

    res.json({
      success: true,
      habit: result.habit,
      date: result.date,
      message: '已取消打卡',
    });
  } catch (error) {
    console.error('取消打卡失败:', error);
    res.status(500).json({ error: '取消打卡失败' });
  }
};

const getHeatmapData = (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const habit = habitService.getHabitById(habitId, req.user.id);

    if (!habit) {
      return res.status(404).json({ error: '习惯不存在' });
    }

    const heatmapData = habitService.getHabitHeatmapData(habitId, req.user.id);

    res.json({
      habit,
      heatmapData,
    });
  } catch (error) {
    console.error('获取热力图数据失败:', error);
    res.status(500).json({ error: '获取热力图数据失败' });
  }
};

const getGlobalStats = (req, res) => {
  try {
    const stats = habitService.getGlobalStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
};

const checkinAllToday = (req, res) => {
  try {
    const result = habitService.checkinAllToday(req.user.id);

    res.json({
      ...result,
      message: `一键打卡完成：成功 ${result.successCount} 个，已打卡 ${result.alreadyCount} 个`,
    });
  } catch (error) {
    console.error('一键打卡失败:', error);
    res.status(500).json({ error: '一键打卡失败' });
  }
};

module.exports = {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  addCheckin,
  removeCheckin,
  getHeatmapData,
  getGlobalStats,
  checkinAllToday,
};
