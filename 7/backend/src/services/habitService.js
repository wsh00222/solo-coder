const { getDb, writeDb, getNow } = require('../config/database');
const {
  getToday,
  getWeekRange,
  getMonthRange,
  isDateWithinNDays,
  isDateInFuture,
  calculateStreak,
  getPastThreeMonthsDates,
} = require('../utils/dateUtils');

const getAllHabits = (userId) => {
  const db = getDb();
  const habits = db.habits
    .filter(h => h.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return habits.map(h => enrichHabitWithStats(h, userId));
};

const getHabitById = (id, userId) => {
  const db = getDb();
  const habit = db.habits.find(h => h.id === id && h.user_id === userId);
  if (!habit) return null;
  return enrichHabitWithStats(habit, userId);
};

const createHabit = (data, userId) => {
  const db = getDb();
  const { name, frequency_type, frequency_count, color } = data;
  const now = getNow();

  const habit = {
    id: db.nextHabitId++,
    user_id: userId,
    name,
    frequency_type,
    frequency_count: frequency_count || 1,
    color: color || '#3B82F6',
    created_at: now,
    updated_at: now,
  };

  db.habits.push(habit);
  writeDb(db);

  return getHabitById(habit.id, userId);
};

const updateHabit = (id, data, userId) => {
  const db = getDb();
  const index = db.habits.findIndex(h => h.id === id && h.user_id === userId);
  if (index === -1) return null;

  const existing = db.habits[index];
  const now = getNow();

  db.habits[index] = {
    ...existing,
    name: data.name !== undefined ? data.name : existing.name,
    frequency_type: data.frequency_type !== undefined ? data.frequency_type : existing.frequency_type,
    frequency_count: data.frequency_count !== undefined ? data.frequency_count : existing.frequency_count,
    color: data.color !== undefined ? data.color : existing.color,
    updated_at: now,
  };

  writeDb(db);
  return getHabitById(id, userId);
};

const deleteHabit = (id, userId) => {
  const db = getDb();
  const index = db.habits.findIndex(h => h.id === id && h.user_id === userId);
  if (index === -1) return false;

  const habitId = db.habits[index].id;
  db.habits.splice(index, 1);
  db.checkins = db.checkins.filter(c => c.habit_id !== habitId);
  writeDb(db);

  return true;
};

const addCheckin = (habitId, dateStr, userId) => {
  const db = getDb();
  const habit = db.habits.find(h => h.id === habitId && h.user_id === userId);
  if (!habit) {
    return { success: false, error: '习惯不存在' };
  }

  const targetDate = dateStr || getToday();

  if (isDateInFuture(targetDate)) {
    return { success: false, error: '不能为未来日期打卡' };
  }

  if (dateStr && dateStr !== getToday()) {
    if (!isDateWithinNDays(targetDate, 7)) {
      return { success: false, error: '只能补打卡最近7天内的日期' };
    }
  }

  const existing = db.checkins.find(c => c.habit_id === habitId && c.checkin_date === targetDate);
  if (existing) {
    return { success: false, error: '该日期已打卡', alreadyChecked: true };
  }

  db.checkins.push({
    id: db.nextCheckinId++,
    habit_id: habitId,
    checkin_date: targetDate,
    created_at: getNow(),
  });

  writeDb(db);

  return { success: true, habit: getHabitById(habitId, userId), date: targetDate };
};

const removeCheckin = (habitId, dateStr, userId) => {
  const db = getDb();
  const habit = db.habits.find(h => h.id === habitId && h.user_id === userId);
  if (!habit) {
    return { success: false, error: '习惯不存在' };
  }

  const targetDate = dateStr || getToday();
  const index = db.checkins.findIndex(c => c.habit_id === habitId && c.checkin_date === targetDate);

  if (index === -1) {
    return { success: false, error: '该日期未打卡' };
  }

  db.checkins.splice(index, 1);
  writeDb(db);

  return { success: true, habit: getHabitById(habitId, userId), date: targetDate };
};

const getHabitCheckins = (habitId, userId, startDate, endDate) => {
  const db = getDb();
  const habit = db.habits.find(h => h.id === habitId && h.user_id === userId);
  if (!habit) return [];

  let checkins = db.checkins.filter(c => c.habit_id === habitId);

  if (startDate && endDate) {
    checkins = checkins.filter(c => c.checkin_date >= startDate && c.checkin_date <= endDate);
  }

  return checkins.map(c => c.checkin_date).sort();
};

const getHabitHeatmapData = (habitId, userId) => {
  const { start, end, dates } = getPastThreeMonthsDates();
  const checkins = getHabitCheckins(habitId, userId, start, end);
  const checkinSet = new Set(checkins);

  return dates.map(date => ({
    date,
    checked: checkinSet.has(date),
  }));
};

const getGlobalStats = (userId) => {
  const db = getDb();
  const habits = db.habits.filter(h => h.user_id === userId);
  const totalHabits = habits.length;
  const habitIds = habits.map(h => h.id);

  const { start: monthStart, end: monthEnd } = getMonthRange();
  const monthlyCheckins = db.checkins.filter(
    c => habitIds.includes(c.habit_id) && c.checkin_date >= monthStart && c.checkin_date <= monthEnd
  ).length;

  let maxStreak = 0;
  for (const habit of habits) {
    const checkinDates = db.checkins
      .filter(c => c.habit_id === habit.id)
      .map(c => c.checkin_date);
    const streak = calculateStreak(checkinDates);
    if (streak > maxStreak) maxStreak = streak;
  }

  return {
    totalHabits,
    monthlyCheckins,
    maxStreak,
  };
};

const checkinAllToday = (userId) => {
  const db = getDb();
  const today = getToday();
  const habits = db.habits.filter(h => h.user_id === userId);
  const results = [];
  const now = getNow();

  for (const habit of habits) {
    const existing = db.checkins.find(c => c.habit_id === habit.id && c.checkin_date === today);
    if (!existing) {
      db.checkins.push({
        id: db.nextCheckinId++,
        habit_id: habit.id,
        checkin_date: today,
        created_at: now,
      });
      results.push({ habitId: habit.id, success: true });
    } else {
      results.push({ habitId: habit.id, success: false, alreadyChecked: true });
    }
  }

  writeDb(db);

  const successCount = results.filter(r => r.success).length;
  const alreadyCount = results.filter(r => r.alreadyChecked).length;

  return {
    success: true,
    successCount,
    alreadyCount,
    totalCount: habits.length,
    stats: getGlobalStats(userId),
    habits: getAllHabits(userId),
  };
};

const enrichHabitWithStats = (habit, userId) => {
  const today = getToday();
  const db = getDb();

  const todayCheckin = db.checkins.find(c => c.habit_id === habit.id && c.checkin_date === today);
  const isCheckedToday = !!todayCheckin;

  const { start: weekStart, end: weekEnd } = getWeekRange();
  const weekCount = db.checkins.filter(
    c => c.habit_id === habit.id && c.checkin_date >= weekStart && c.checkin_date <= weekEnd
  ).length;

  let targetCount = 7;
  if (habit.frequency_type === 'weekly') {
    targetCount = habit.frequency_count;
  } else if (habit.frequency_type === 'monthly') {
    targetCount = habit.frequency_count;
  }

  const allCheckins = db.checkins
    .filter(c => c.habit_id === habit.id)
    .map(c => c.checkin_date)
    .sort();
  const streak = calculateStreak(allCheckins);

  const progressPercent = Math.min(100, Math.round((weekCount / targetCount) * 100));

  return {
    ...habit,
    isCheckedToday,
    weekCount,
    targetCount,
    streak,
    progressPercent,
  };
};

module.exports = {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  addCheckin,
  removeCheckin,
  getHabitCheckins,
  getHabitHeatmapData,
  getGlobalStats,
  checkinAllToday,
};
