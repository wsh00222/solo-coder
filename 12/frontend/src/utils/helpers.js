import dayjs from 'dayjs';

export function getActivityStatus(activity) {
  const now = dayjs();
  const deadline = dayjs(activity.registration_deadline);
  const activityTime = dayjs(activity.activity_time);

  if (now.isAfter(activityTime)) {
    return 'ended';
  }
  if (now.isAfter(deadline)) {
    return 'closed';
  }
  return 'open';
}

export function getStatusText(status) {
  const map = {
    open: '报名中',
    closed: '已截止',
    ended: '已结束'
  };
  return map[status] || status;
}

export function isUrgent(deadline) {
  const diff = dayjs(deadline).diff(dayjs(), 'minute');
  return diff > 0 && diff <= 120;
}

export function isDeadlineSoon(deadline) {
  const diff = dayjs(deadline).diff(dayjs(), 'minute');
  return diff > 0 && diff <= 60;
}

export function formatDateTime(dateStr) {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
}

export function formatDate(dateStr) {
  return dayjs(dateStr).format('YYYY-MM-DD');
}

export function formatTime(dateStr) {
  return dayjs(dateStr).format('HH:mm');
}

export function getProgressColor(percent) {
  if (percent < 60) return 'blue';
  if (percent < 80) return 'orange';
  return 'red';
}

export function getCountdownTime(deadline) {
  const diff = dayjs(deadline).diff(dayjs(), 'second');
  if (diff <= 0) return { minutes: 0, seconds: 0, expired: true };
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return { minutes, seconds, expired: false };
}

export function padZero(num) {
  return String(num).padStart(2, '0');
}
