const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');

function pad(n) { return String(n).padStart(2, '0'); }

function formatLocalDateTime(d) {
  if (typeof d === 'string') d = new Date(d);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDateForSql(dateStr) {
  return formatLocalDateTime(new Date(dateStr));
}

function checkConflict(meetings, startTime, duration, excludeId = null) {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);

  return meetings.filter(m => {
    if (excludeId && m.id === excludeId) return false;
    const mStart = new Date(m.startTime);
    const mEnd = new Date(mStart.getTime() + m.duration * 60000);
    return (mStart < end && mEnd > start);
  });
}

router.get('/', (req, res) => {
  const { startDate, endDate, attendee, search } = req.query;
  const { meetings } = readData();

  let result = [...meetings];

  if (startDate) {
    const sd = new Date(startDate);
    sd.setHours(0, 0, 0, 0);
    result = result.filter(m => new Date(m.startTime) >= sd);
  }
  if (endDate) {
    const ed = new Date(endDate);
    ed.setHours(23, 59, 59, 999);
    result = result.filter(m => new Date(m.startTime) <= ed);
  }
  if (attendee) {
    const lower = attendee.toLowerCase();
    result = result.filter(m =>
      m.attendees.some(a => a.toLowerCase().includes(lower))
    );
  }
  if (search) {
    const lower = search.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(lower));
  }

  result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  res.json(result);
});

router.get('/stats', (req, res) => {
  const { meetings } = readData();

  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekMeetings = meetings.filter(m => {
    const t = new Date(m.startTime);
    return t >= startOfWeek && t <= endOfWeek;
  });

  const todayMeetings = meetings.filter(m => {
    const t = new Date(m.startTime);
    return t >= today && t < tomorrow;
  });

  const avgDuration = weekMeetings.length > 0
    ? Math.round(weekMeetings.reduce((sum, m) => sum + m.duration, 0) / weekMeetings.length)
    : 0;

  const attendeeCount = {};
  meetings.forEach(m => {
    m.attendees.forEach(a => {
      attendeeCount[a] = (attendeeCount[a] || 0) + 1;
    });
  });

  const attendeesList = Object.entries(attendeeCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    weekTotal: weekMeetings.length,
    todayTotal: todayMeetings.length,
    avgDuration,
    attendees: attendeesList
  });
});

router.get('/upcoming', (req, res) => {
  const { meetings } = readData();
  const now = new Date();
  const in30Min = new Date(now.getTime() + 30 * 60000);

  const result = meetings.filter(m => {
    const t = new Date(m.startTime);
    return t >= now && t <= in30Min;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  res.json(result);
});

router.get('/:id', (req, res) => {
  const { meetings } = readData();
  const id = parseInt(req.params.id);
  const meeting = meetings.find(m => m.id === id);

  if (!meeting) {
    return res.status(404).json({ error: '会议不存在' });
  }
  res.json(meeting);
});

router.post('/', (req, res) => {
  const { title, startTime, duration, location, attendees, agenda, force } = req.body;

  if (!title || !startTime || !duration) {
    return res.status(400).json({ error: '标题、开始时间和持续时间为必填项' });
  }

  const data = readData();
  const attendeesArr = Array.isArray(attendees) ? attendees : (attendees || '').split(',').map(s => s.trim()).filter(Boolean);
  const startStr = formatLocalDateTime(new Date(startTime));

  const conflicts = checkConflict(data.meetings, startTime, duration);

  if (conflicts.length > 0 && !force) {
    return res.json({ hasConflict: true, conflicts, meeting: null });
  }

  const newMeeting = {
    id: data.nextId,
    title,
    startTime: startStr,
    duration: parseInt(duration),
    location: location || '',
    attendees: attendeesArr,
    agenda: agenda || '',
    createdAt: formatLocalDateTime(new Date()),
    updatedAt: formatLocalDateTime(new Date())
  };

  data.meetings.push(newMeeting);
  data.nextId += 1;
  writeData(data);

  res.status(201).json({ hasConflict: false, meeting: newMeeting, conflicts: [] });
});

router.put('/:id', (req, res) => {
  const { title, startTime, duration, location, attendees, agenda, force } = req.body;
  const id = parseInt(req.params.id);

  const data = readData();
  const idx = data.meetings.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: '会议不存在' });
  }

  if (!title || !startTime || !duration) {
    return res.status(400).json({ error: '标题、开始时间和持续时间为必填项' });
  }

  const attendeesArr = Array.isArray(attendees)
    ? attendees
    : (attendees || '').split(',').map(s => s.trim()).filter(Boolean);
  const startStr = formatLocalDateTime(new Date(startTime));

  const conflicts = checkConflict(data.meetings, startTime, duration, id);

  if (conflicts.length > 0 && !force) {
    return res.json({ hasConflict: true, conflicts, meeting: null });
  }

  const updated = {
    ...data.meetings[idx],
    title,
    startTime: startStr,
    duration: parseInt(duration),
    location: location || '',
    attendees: attendeesArr,
    agenda: agenda || '',
    updatedAt: formatLocalDateTime(new Date())
  };

  data.meetings[idx] = updated;
  writeData(data);

  res.json({ hasConflict: false, meeting: updated, conflicts: [] });
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  const idx = data.meetings.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: '会议不存在' });
  }

  data.meetings.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

router.get('/conflict/check', (req, res) => {
  const { startTime, duration, excludeId } = req.query;
  if (!startTime || !duration) {
    return res.status(400).json({ error: '缺少参数' });
  }
  const { meetings } = readData();
  const conflicts = checkConflict(
    meetings,
    startTime,
    parseInt(duration),
    excludeId ? parseInt(excludeId) : null
  );
  res.json({ conflicts });
});

router.post('/export/csv', (req, res) => {
  const { startDate, endDate } = req.body;
  const { meetings } = readData();

  let result = [...meetings];

  if (startDate) {
    const sd = new Date(startDate);
    sd.setHours(0, 0, 0, 0);
    result = result.filter(m => new Date(m.startTime) >= sd);
  }
  if (endDate) {
    const ed = new Date(endDate);
    ed.setHours(23, 59, 59, 999);
    result = result.filter(m => new Date(m.startTime) <= ed);
  }

  result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const header = '标题,开始时间,持续时间(分钟),地点,参会人员,议程\n';
  const csvContent = header + result.map(m => {
    const attendees = (m.attendees || []).join('; ');
    const agenda = (m.agenda || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const title = m.title.replace(/"/g, '""');
    const loc = (m.location || '').replace(/"/g, '""');
    return `"${title}","${m.startTime}",${m.duration},"${loc}","${attendees}","${agenda}"`;
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="meetings.csv"');
  res.send('\uFEFF' + csvContent);
});

module.exports = router;
