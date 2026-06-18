import fs from 'fs';
import path from 'path';
import { Activity, Registration } from './types';

interface DBData {
  activities: Activity[];
  registrations: Registration[];
  nextActivityId: number;
  nextRegistrationId: number;
}

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'db.json');

function loadData(): DBData {
  if (!fs.existsSync(dbPath)) {
    const initial: DBData = {
      activities: [],
      registrations: [],
      nextActivityId: 1,
      nextRegistrationId: 1,
    };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw) as DBData;
}

function saveData(data: DBData): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function isDatabaseEmpty(): boolean {
  const data = loadData();
  return data.activities.length === 0;
}

export function getAllActivities(): Activity[] {
  return loadData().activities;
}

export function getActivityById(id: number): Activity | undefined {
  return loadData().activities.find((a) => a.id === id);
}

export function createActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const data = loadData();
  const newActivity: Activity = {
    ...activity,
    id: data.nextActivityId,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  data.activities.push(newActivity);
  data.nextActivityId += 1;
  saveData(data);
  return newActivity;
}

export function updateActivity(id: number, updates: Partial<Activity>): Activity | undefined {
  const data = loadData();
  const idx = data.activities.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  data.activities[idx] = { ...data.activities[idx], ...updates, id };
  saveData(data);
  return data.activities[idx];
}

export function deleteActivity(id: number): boolean {
  const data = loadData();
  const before = data.activities.length;
  data.activities = data.activities.filter((a) => a.id !== id);
  data.registrations = data.registrations.filter((r) => r.activityId !== id);
  saveData(data);
  return data.activities.length < before;
}

export function getRegistrationsByActivityId(activityId: number): Registration[] {
  return loadData()
    .registrations.filter((r) => r.activityId === activityId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function countRegistrations(activityId: number): number {
  return loadData().registrations.filter((r) => r.activityId === activityId).length;
}

export function findRegistration(activityId: number, phone: string): Registration | undefined {
  return loadData().registrations.find(
    (r) => r.activityId === activityId && r.phone === phone
  );
}

export function createRegistration(
  reg: Omit<Registration, 'id' | 'checkedIn' | 'createdAt'>
): Registration {
  const data = loadData();
  const newReg: Registration = {
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

export function deleteRegistration(id: number): boolean {
  const data = loadData();
  const before = data.registrations.length;
  data.registrations = data.registrations.filter((r) => r.id !== id);
  saveData(data);
  return data.registrations.length < before;
}

export function checkinRegistration(id: number): boolean {
  const data = loadData();
  const idx = data.registrations.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  if (data.registrations[idx].checkedIn) return false;
  data.registrations[idx].checkedIn = 1;
  saveData(data);
  return true;
}

export function countAllRegistrations(): number {
  return loadData().registrations.length;
}

export function seedActivitiesAndRegistrations(
  activities: Array<Omit<Activity, 'id' | 'createdAt'>>,
  registrations: Array<{ activityIndex: number; name: string; phone: string; email: string | null; checkedIn: number }>
): void {
  const data = loadData();
  if (data.activities.length > 0) return;

  activities.forEach((act) => {
    const newActivity: Activity = {
      ...act,
      id: data.nextActivityId,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    data.activities.push(newActivity);
    data.nextActivityId += 1;
  });

  registrations.forEach((r) => {
    const activity = data.activities[r.activityIndex];
    if (!activity) return;
    const newReg: Registration = {
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
