function getActivityStatus(activity) {
  const now = new Date();
  const deadline = new Date(activity.registration_deadline);
  const activityTime = new Date(activity.activity_time);

  if (now > activityTime) {
    return 'ended';
  }
  if (now > deadline) {
    return 'closed';
  }
  return 'open';
}

function getServerTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

module.exports = {
  getActivityStatus,
  getServerTime,
  escapeCsv
};
