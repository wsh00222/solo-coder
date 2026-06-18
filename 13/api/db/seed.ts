import { PlanModel } from '../models/Plan';
import { RecordModel } from '../models/Record';
import { addDays, getServerDate, formatDate } from '../utils/date';

const MUSCLE_CONTENTS = [
  '卧推 4组x10次',
  '深蹲 5组x8次',
  '硬拉 4组x8次',
  '哑铃弯举 3组x12次',
  '引体向上 4组x8次',
  '杠铃划船 4组x10次',
  '肩推 4组x10次',
  '腿举 3组x15次',
];

const FATLOSS_CONTENTS = [
  '跑步机 45分钟',
  '动感单车 40分钟',
  'HIIT训练 30分钟',
  '跳绳 2000次',
  '椭圆机 40分钟',
  '游泳 60分钟',
  '开合跳+波比跳 30分钟',
  '爬坡走 60分钟',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function seedSampleDataIfEmpty() {
  if (PlanModel.count() > 0) return;

  const today = getServerDate();
  const twoWeeksAgo = addDays(today, -14);

  const musclePlan = PlanModel.create({
    name: '夏季增肌计划',
    goal: '增肌',
    weekly_frequency: 4,
    start_date: twoWeeksAgo,
    end_date: addDays(today, 60),
  });

  const fatlossPlan = PlanModel.create({
    name: '减脂塑形计划',
    goal: '减脂',
    weekly_frequency: 5,
    start_date: twoWeeksAgo,
    end_date: addDays(today, 45),
  });

  const muscleDates = pickRandomDates(addDays(twoWeeksAgo, 1), today, 5);
  for (const d of muscleDates) {
    RecordModel.create({
      plan_id: musclePlan.id,
      date: d,
      duration: randomInt(50, 90),
      content: randomPick(MUSCLE_CONTENTS),
      feeling: randomInt(3, 5),
    });
  }

  const fatlossDates = pickRandomDates(twoWeeksAgo, today, 4);
  for (const d of fatlossDates) {
    RecordModel.create({
      plan_id: fatlossPlan.id,
      date: d,
      duration: randomInt(30, 60),
      content: randomPick(FATLOSS_CONTENTS),
      feeling: randomInt(2, 5),
    });
  }
}

function pickRandomDates(start: string, end: string, count: number): string[] {
  const allDates: string[] = [];
  let d = start;
  while (d <= end) {
    allDates.push(d);
    d = addDays(d, 1);
  }
  const shuffled = [...allDates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).sort();
}
