import { Router, Request, Response } from 'express';
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getRegistrationsByActivityId,
  countRegistrations,
  findRegistration,
  createRegistration,
  deleteRegistration,
  checkinRegistration,
  countAllRegistrations,
} from './db';
import { Activity, Registration, ActivityWithStats } from './types';
import { getActivityStatus, parseDateTime, isValidPhone, isValidEmail } from './utils';

const router = Router();

function attachStats(activity: Activity): ActivityWithStats {
  const count = countRegistrations(activity.id);
  return {
    ...activity,
    currentCount: count,
    status: getActivityStatus(activity),
  };
}

router.get('/activities', (req: Request, res: Response) => {
  const { status, sort, keyword } = req.query as {
    status?: string;
    sort?: string;
    keyword?: string;
  };

  let rows = getAllActivities();

  if (keyword) {
    const kw = keyword.toLowerCase();
    rows = rows.filter((a) => a.title.toLowerCase().includes(kw));
  }

  if (sort === 'asc') {
    rows.sort((a, b) => parseDateTime(a.activityTime).getTime() - parseDateTime(b.activityTime).getTime());
  } else {
    rows.sort((a, b) => parseDateTime(b.activityTime).getTime() - parseDateTime(a.activityTime).getTime());
  }

  let withStats = rows.map(attachStats);

  if (status && status !== 'all') {
    withStats = withStats.filter((a) => a.status === status);
  }

  res.json(withStats);
});

router.get('/activities/stats', (_req: Request, res: Response) => {
  const all = getAllActivities();
  const withStats = all.map(attachStats);
  const total = withStats.length;
  const registering = withStats.filter((a) => a.status === 'registering').length;
  const totalRegs = countAllRegistrations();

  res.json({
    totalActivities: total,
    registeringActivities: registering,
    totalRegistrations: totalRegs,
  });
});

router.get('/activities/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const activity = getActivityById(id);
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  const registrations = getRegistrationsByActivityId(id);
  res.json({
    activity: attachStats(activity),
    registrations,
  });
});

router.post('/activities', (req: Request, res: Response) => {
  const { title, activityTime, location, deadline, maxParticipants, description } = req.body;

  if (!title || !activityTime || !location || !deadline || !maxParticipants || !description) {
    res.status(400).json({ error: '所有字段均为必填项' });
    return;
  }
  if (maxParticipants < 1) {
    res.status(400).json({ error: '最大人数必须大于 0' });
    return;
  }

  const newActivity = createActivity({
    title,
    activityTime,
    location,
    deadline,
    maxParticipants: Number(maxParticipants),
    description,
  });
  res.json(attachStats(newActivity));
});

router.put('/activities/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = getActivityById(id);
  if (!existing) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }

  const status = getActivityStatus(existing);
  if (status !== 'registering') {
    res.status(400).json({ error: '仅"报名中"状态的活动可以编辑' });
    return;
  }

  const { title, activityTime, location, deadline, maxParticipants, description } = req.body;

  if (
    title === undefined ||
    activityTime === undefined ||
    location === undefined ||
    deadline === undefined ||
    maxParticipants === undefined ||
    description === undefined
  ) {
    res.status(400).json({ error: '所有字段均为必填项' });
    return;
  }

  const currentCount = countRegistrations(id);
  if (Number(maxParticipants) < currentCount) {
    res.status(400).json({ error: `最大人数不能少于当前报名人数 (${currentCount})` });
    return;
  }

  const updated = updateActivity(id, {
    title,
    activityTime,
    location,
    deadline,
    maxParticipants: Number(maxParticipants),
    description,
  });

  if (updated) {
    res.json(attachStats(updated));
  } else {
    res.status(500).json({ error: '更新失败' });
  }
});

router.delete('/activities/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = getActivityById(id);
  if (!existing) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  const ok = deleteActivity(id);
  res.json({ success: ok });
});

router.post('/activities/:id/register', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const activity = getActivityById(id);
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }

  const status = getActivityStatus(activity);
  if (status !== 'registering') {
    res.status(400).json({ error: '活动不在报名中' });
    return;
  }

  const { name, phone, email } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: '姓名和手机号为必填项' });
    return;
  }
  if (!isValidPhone(phone)) {
    res.status(400).json({ error: '请输入有效的手机号' });
    return;
  }
  if (email && !isValidEmail(email)) {
    res.status(400).json({ error: '请输入有效的邮箱' });
    return;
  }

  const count = countRegistrations(id);
  if (count >= activity.maxParticipants) {
    res.status(400).json({ error: '活动报名人数已满' });
    return;
  }

  const existing = findRegistration(id, phone);
  if (existing) {
    res.status(400).json({ error: '该手机号已报名此活动' });
    return;
  }

  const registration = createRegistration({
    activityId: id,
    name,
    phone,
    email: email || null,
  });
  res.json(registration);
});

router.post('/activities/:id/cancel', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: '请输入手机号' });
    return;
  }

  const registration = findRegistration(id, phone);
  if (!registration) {
    res.status(404).json({ error: '未找到该手机号的报名记录' });
    return;
  }

  const ok = deleteRegistration(registration.id);
  res.json({ success: ok });
});

router.post('/activities/:id/checkin', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: '请输入手机号' });
    return;
  }

  const activity = getActivityById(id);
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }

  const status = getActivityStatus(activity);
  if (status !== 'ended') {
    res.status(400).json({ error: '仅已结束的活动可以签到' });
    return;
  }

  const registration = findRegistration(id, phone);
  if (!registration) {
    res.status(404).json({ error: '未找到该手机号的报名记录' });
    return;
  }
  if (registration.checkedIn) {
    res.status(400).json({ error: '该报名已签到' });
    return;
  }

  const ok = checkinRegistration(registration.id);
  res.json({ success: ok });
});

export default router;
