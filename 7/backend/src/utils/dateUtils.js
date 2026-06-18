const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => formatDate(new Date());

const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
};

const getMonthRange = (date = new Date()) => {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay)
  };
};

const getDateNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

const isDateWithinNDays = (dateStr, n) => {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = today - target;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= n;
};

const isDateInFuture = (dateStr) => {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target > today;
};

const getDaysInRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const getPastThreeMonthsDates = () => {
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 3);
  startDate.setDate(startDate.getDate() + 1);
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
    dates: getDaysInRange(formatDate(startDate), formatDate(endDate))
  };
};

const calculateStreak = (checkinDates) => {
  if (!checkinDates || checkinDates.length === 0) return 0;
  
  const sortedDates = [...checkinDates].sort().reverse();
  const today = getToday();
  const yesterday = getDateNDaysAgo(1);
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 0;
  const dateSet = new Set(sortedDates);
  let currentDate = new Date();
  
  if (!dateSet.has(today)) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  while (true) {
    const dateStr = formatDate(currentDate);
    if (dateSet.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

module.exports = {
  formatDate,
  getToday,
  getWeekRange,
  getMonthRange,
  getDateNDaysAgo,
  isDateWithinNDays,
  isDateInFuture,
  getDaysInRange,
  getPastThreeMonthsDates,
  calculateStreak,
  dayNames,
  monthNames
};
