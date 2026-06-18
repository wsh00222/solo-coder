"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityStatus = getActivityStatus;
exports.parseDateTime = parseDateTime;
exports.isValidPhone = isValidPhone;
exports.isValidEmail = isValidEmail;
function getActivityStatus(activity) {
    const now = new Date();
    const activityTime = new Date(activity.activityTime.replace(' ', 'T'));
    const deadline = new Date(activity.deadline.replace(' ', 'T'));
    if (now > activityTime)
        return 'ended';
    if (now > deadline)
        return 'closed';
    return 'registering';
}
function parseDateTime(s) {
    return new Date(s.replace(' ', 'T'));
}
function isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}
function isValidEmail(email) {
    if (!email)
        return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
