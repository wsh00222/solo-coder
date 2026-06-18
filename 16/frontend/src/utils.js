export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

export function formatDateChinese(dateStr) {
  const d = new Date(dateStr);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const dateOnly = formatDate(dateStr);
  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);
  const dayAfterStr = formatDate(dayAfter);

  if (dateOnly === todayStr) return '今天';
  if (dateOnly === tomorrowStr) return '明天';
  if (dateOnly === dayAfterStr) return '后天';

  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
}

export function getCountdown(startTimeStr) {
  const now = new Date().getTime();
  const start = new Date(startTimeStr).getTime();
  const diff = start - now;

  if (diff < 0) {
    return { text: '已结束', isUpcoming: false, isPast: true };
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let text = '';
  if (days > 0) {
    text = `${days}天后`;
  } else if (hours > 0) {
    text = `${hours}小时后`;
  } else if (minutes > 0) {
    text = `${minutes}分钟后`;
  } else {
    text = '即将开始';
  }

  return { text, isUpcoming: diff <= 30 * 60000, isPast: false };
}

export function groupByDate(meetings) {
  const groups = {};
  meetings.forEach(m => {
    const date = formatDate(m.startTime);
    if (!groups[date]) groups[date] = [];
    groups[date].push(m);
  });
  return Object.entries(groups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, items]) => ({
      date,
      dateLabel: formatDateChinese(items[0].startTime),
      meetings: items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    }));
}

export function addHours(dateStr, hours) {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + hours);
  return d.toISOString().slice(0, 16);
}

export function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return {
    start: formatDate(start.toISOString()),
    end: formatDate(end.toISOString())
  };
}
