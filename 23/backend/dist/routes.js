"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("./db");
const utils_1 = require("./utils");
const router = (0, express_1.Router)();
function attachStats(activity) {
    const count = (0, db_1.countRegistrations)(activity.id);
    return {
        ...activity,
        currentCount: count,
        status: (0, utils_1.getActivityStatus)(activity),
    };
}
router.get('/activities', (req, res) => {
    const { status, sort, keyword } = req.query;
    let rows = (0, db_1.getAllActivities)();
    if (keyword) {
        const kw = keyword.toLowerCase();
        rows = rows.filter((a) => a.title.toLowerCase().includes(kw));
    }
    if (sort === 'asc') {
        rows.sort((a, b) => (0, utils_1.parseDateTime)(a.activityTime).getTime() - (0, utils_1.parseDateTime)(b.activityTime).getTime());
    }
    else {
        rows.sort((a, b) => (0, utils_1.parseDateTime)(b.activityTime).getTime() - (0, utils_1.parseDateTime)(a.activityTime).getTime());
    }
    let withStats = rows.map(attachStats);
    if (status && status !== 'all') {
        withStats = withStats.filter((a) => a.status === status);
    }
    res.json(withStats);
});
router.get('/activities/stats', (_req, res) => {
    const all = (0, db_1.getAllActivities)();
    const withStats = all.map(attachStats);
    const total = withStats.length;
    const registering = withStats.filter((a) => a.status === 'registering').length;
    const totalRegs = (0, db_1.countAllRegistrations)();
    res.json({
        totalActivities: total,
        registeringActivities: registering,
        totalRegistrations: totalRegs,
    });
});
router.get('/activities/:id', (req, res) => {
    const id = Number(req.params.id);
    const activity = (0, db_1.getActivityById)(id);
    if (!activity) {
        res.status(404).json({ error: '活动不存在' });
        return;
    }
    const registrations = (0, db_1.getRegistrationsByActivityId)(id);
    res.json({
        activity: attachStats(activity),
        registrations,
    });
});
router.post('/activities', (req, res) => {
    const { title, activityTime, location, deadline, maxParticipants, description } = req.body;
    if (!title || !activityTime || !location || !deadline || !maxParticipants || !description) {
        res.status(400).json({ error: '所有字段均为必填项' });
        return;
    }
    if (maxParticipants < 1) {
        res.status(400).json({ error: '最大人数必须大于 0' });
        return;
    }
    const newActivity = (0, db_1.createActivity)({
        title,
        activityTime,
        location,
        deadline,
        maxParticipants: Number(maxParticipants),
        description,
    });
    res.json(attachStats(newActivity));
});
router.put('/activities/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = (0, db_1.getActivityById)(id);
    if (!existing) {
        res.status(404).json({ error: '活动不存在' });
        return;
    }
    const status = (0, utils_1.getActivityStatus)(existing);
    if (status !== 'registering') {
        res.status(400).json({ error: '仅"报名中"状态的活动可以编辑' });
        return;
    }
    const { title, activityTime, location, deadline, maxParticipants, description } = req.body;
    if (title === undefined ||
        activityTime === undefined ||
        location === undefined ||
        deadline === undefined ||
        maxParticipants === undefined ||
        description === undefined) {
        res.status(400).json({ error: '所有字段均为必填项' });
        return;
    }
    const currentCount = (0, db_1.countRegistrations)(id);
    if (Number(maxParticipants) < currentCount) {
        res.status(400).json({ error: `最大人数不能少于当前报名人数 (${currentCount})` });
        return;
    }
    const updated = (0, db_1.updateActivity)(id, {
        title,
        activityTime,
        location,
        deadline,
        maxParticipants: Number(maxParticipants),
        description,
    });
    if (updated) {
        res.json(attachStats(updated));
    }
    else {
        res.status(500).json({ error: '更新失败' });
    }
});
router.delete('/activities/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = (0, db_1.getActivityById)(id);
    if (!existing) {
        res.status(404).json({ error: '活动不存在' });
        return;
    }
    const ok = (0, db_1.deleteActivity)(id);
    res.json({ success: ok });
});
router.post('/activities/:id/register', (req, res) => {
    const id = Number(req.params.id);
    const activity = (0, db_1.getActivityById)(id);
    if (!activity) {
        res.status(404).json({ error: '活动不存在' });
        return;
    }
    const status = (0, utils_1.getActivityStatus)(activity);
    if (status !== 'registering') {
        res.status(400).json({ error: '活动不在报名中' });
        return;
    }
    const { name, phone, email } = req.body;
    if (!name || !phone) {
        res.status(400).json({ error: '姓名和手机号为必填项' });
        return;
    }
    if (!(0, utils_1.isValidPhone)(phone)) {
        res.status(400).json({ error: '请输入有效的手机号' });
        return;
    }
    if (email && !(0, utils_1.isValidEmail)(email)) {
        res.status(400).json({ error: '请输入有效的邮箱' });
        return;
    }
    const count = (0, db_1.countRegistrations)(id);
    if (count >= activity.maxParticipants) {
        res.status(400).json({ error: '活动报名人数已满' });
        return;
    }
    const existing = (0, db_1.findRegistration)(id, phone);
    if (existing) {
        res.status(400).json({ error: '该手机号已报名此活动' });
        return;
    }
    const registration = (0, db_1.createRegistration)({
        activityId: id,
        name,
        phone,
        email: email || null,
    });
    res.json(registration);
});
router.post('/activities/:id/cancel', (req, res) => {
    const id = Number(req.params.id);
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ error: '请输入手机号' });
        return;
    }
    const registration = (0, db_1.findRegistration)(id, phone);
    if (!registration) {
        res.status(404).json({ error: '未找到该手机号的报名记录' });
        return;
    }
    const ok = (0, db_1.deleteRegistration)(registration.id);
    res.json({ success: ok });
});
router.post('/activities/:id/checkin', (req, res) => {
    const id = Number(req.params.id);
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ error: '请输入手机号' });
        return;
    }
    const activity = (0, db_1.getActivityById)(id);
    if (!activity) {
        res.status(404).json({ error: '活动不存在' });
        return;
    }
    const status = (0, utils_1.getActivityStatus)(activity);
    if (status !== 'ended') {
        res.status(400).json({ error: '仅已结束的活动可以签到' });
        return;
    }
    const registration = (0, db_1.findRegistration)(id, phone);
    if (!registration) {
        res.status(404).json({ error: '未找到该手机号的报名记录' });
        return;
    }
    if (registration.checkedIn) {
        res.status(400).json({ error: '该报名已签到' });
        return;
    }
    const ok = (0, db_1.checkinRegistration)(registration.id);
    res.json({ success: ok });
});
exports.default = router;
