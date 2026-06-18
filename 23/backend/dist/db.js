"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDatabaseEmpty = isDatabaseEmpty;
exports.getAllActivities = getAllActivities;
exports.getActivityById = getActivityById;
exports.createActivity = createActivity;
exports.updateActivity = updateActivity;
exports.deleteActivity = deleteActivity;
exports.getRegistrationsByActivityId = getRegistrationsByActivityId;
exports.countRegistrations = countRegistrations;
exports.findRegistration = findRegistration;
exports.createRegistration = createRegistration;
exports.deleteRegistration = deleteRegistration;
exports.checkinRegistration = checkinRegistration;
exports.countAllRegistrations = countAllRegistrations;
exports.seedActivitiesAndRegistrations = seedActivitiesAndRegistrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.join(__dirname, '..', 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path_1.default.join(dataDir, 'db.json');
function loadData() {
    if (!fs_1.default.existsSync(dbPath)) {
        const initial = {
            activities: [],
            registrations: [],
            nextActivityId: 1,
            nextRegistrationId: 1,
        };
        fs_1.default.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
        return initial;
    }
    const raw = fs_1.default.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
}
function saveData(data) {
    fs_1.default.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
function isDatabaseEmpty() {
    const data = loadData();
    return data.activities.length === 0;
}
function getAllActivities() {
    return loadData().activities;
}
function getActivityById(id) {
    return loadData().activities.find((a) => a.id === id);
}
function createActivity(activity) {
    const data = loadData();
    const newActivity = {
        ...activity,
        id: data.nextActivityId,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    data.activities.push(newActivity);
    data.nextActivityId += 1;
    saveData(data);
    return newActivity;
}
function updateActivity(id, updates) {
    const data = loadData();
    const idx = data.activities.findIndex((a) => a.id === id);
    if (idx === -1)
        return undefined;
    data.activities[idx] = { ...data.activities[idx], ...updates, id };
    saveData(data);
    return data.activities[idx];
}
function deleteActivity(id) {
    const data = loadData();
    const before = data.activities.length;
    data.activities = data.activities.filter((a) => a.id !== id);
    data.registrations = data.registrations.filter((r) => r.activityId !== id);
    saveData(data);
    return data.activities.length < before;
}
function getRegistrationsByActivityId(activityId) {
    return loadData()
        .registrations.filter((r) => r.activityId === activityId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
function countRegistrations(activityId) {
    return loadData().registrations.filter((r) => r.activityId === activityId).length;
}
function findRegistration(activityId, phone) {
    return loadData().registrations.find((r) => r.activityId === activityId && r.phone === phone);
}
function createRegistration(reg) {
    const data = loadData();
    const newReg = {
        ...reg,
        id: data.nextRegistrationId,
        checkedIn: 0,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    data.registrations.push(newReg);
    data.nextRegistrationId += 1;
    saveData(data);
    return newReg;
}
function deleteRegistration(id) {
    const data = loadData();
    const before = data.registrations.length;
    data.registrations = data.registrations.filter((r) => r.id !== id);
    saveData(data);
    return data.registrations.length < before;
}
function checkinRegistration(id) {
    const data = loadData();
    const idx = data.registrations.findIndex((r) => r.id === id);
    if (idx === -1)
        return false;
    if (data.registrations[idx].checkedIn)
        return false;
    data.registrations[idx].checkedIn = 1;
    saveData(data);
    return true;
}
function countAllRegistrations() {
    return loadData().registrations.length;
}
function seedActivitiesAndRegistrations(activities, registrations) {
    const data = loadData();
    if (data.activities.length > 0)
        return;
    activities.forEach((act) => {
        const newActivity = {
            ...act,
            id: data.nextActivityId,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
        data.activities.push(newActivity);
        data.nextActivityId += 1;
    });
    registrations.forEach((r) => {
        const activity = data.activities[r.activityIndex];
        if (!activity)
            return;
        const newReg = {
            id: data.nextRegistrationId,
            activityId: activity.id,
            name: r.name,
            phone: r.phone,
            email: r.email,
            checkedIn: r.checkedIn,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
        data.registrations.push(newReg);
        data.nextRegistrationId += 1;
    });
    saveData(data);
}
