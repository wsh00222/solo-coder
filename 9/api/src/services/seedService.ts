import { PlanModel } from '../models/Plan';
import { ItineraryModel } from '../models/Itinerary';
import type { CreatePlanRequest, CreateItineraryRequest, TimeSlot } from '@shared/types';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function seedDatabaseIfEmpty(): void {
  const count = PlanModel.count();
  if (count > 0) return;

  const today = new Date();

  const upcomingPlan: CreatePlanRequest = {
    destination: '京都',
    startDate: formatDate(addDays(today, 7)),
    endDate: formatDate(addDays(today, 14)),
    companions: '家人',
    budget: 15000,
    notes: '春季赏樱之旅',
  };

  const ongoingPlan: CreatePlanRequest = {
    destination: '三亚',
    startDate: formatDate(addDays(today, -3)),
    endDate: formatDate(addDays(today, 5)),
    companions: '朋友',
    budget: 8000,
    notes: '海边度假放松',
  };

  const upcoming = PlanModel.create(upcomingPlan);
  const ongoing = PlanModel.create(ongoingPlan);

  const upcomingItineraries: CreateItineraryRequest[] = [
    { date: formatDate(addDays(today, 7)), timeSlot: 'morning', activity: '抵达关西机场', location: '关西国际机场', transportation: '飞机' },
    { date: formatDate(addDays(today, 7)), timeSlot: 'afternoon', activity: '办理酒店入住', location: '京都站附近酒店', transportation: 'JR电车' },
    { date: formatDate(addDays(today, 7)), timeSlot: 'evening', activity: '逛锦市场', location: '锦市场', transportation: '步行' },
    { date: formatDate(addDays(today, 8)), timeSlot: 'morning', activity: '伏见稻荷大社', location: '伏见稻荷大社', transportation: '公交' },
    { date: formatDate(addDays(today, 8)), timeSlot: 'afternoon', activity: '清水寺', location: '清水寺', transportation: '公交' },
    { date: formatDate(addDays(today, 8)), timeSlot: 'afternoon', activity: '二年坂三年坂散步', location: '二年坂三年坂', transportation: '步行' },
    { date: formatDate(addDays(today, 9)), timeSlot: 'morning', activity: '岚山竹林', location: '岚山', transportation: 'JR嵯峨野线' },
    { date: formatDate(addDays(today, 9)), timeSlot: 'afternoon', activity: '天龙寺', location: '天龙寺', transportation: '步行' },
    { date: formatDate(addDays(today, 10)), timeSlot: 'morning', activity: '金阁寺', location: '金阁寺', transportation: '公交' },
  ];

  const ongoingItineraries: CreateItineraryRequest[] = [
    { date: formatDate(addDays(today, -3)), timeSlot: 'morning', activity: '抵达三亚凤凰机场', location: '凤凰国际机场', transportation: '飞机' },
    { date: formatDate(addDays(today, -3)), timeSlot: 'afternoon', activity: '办理酒店入住', location: '亚龙湾酒店', transportation: '出租车' },
    { date: formatDate(addDays(today, -2)), timeSlot: 'morning', activity: '海滩日光浴', location: '亚龙湾沙滩', transportation: '步行' },
    { date: formatDate(addDays(today, -2)), timeSlot: 'afternoon', activity: '浮潜体验', location: '蜈支洲岛', transportation: '轮船' },
    { date: formatDate(addDays(today, -1)), timeSlot: 'morning', activity: '热带雨林探索', location: '呀诺达热带雨林', transportation: '包车' },
    { date: formatDate(addDays(today, -1)), timeSlot: 'evening', activity: '海鲜大餐', location: '第一市场', transportation: '出租车' },
    { date: formatDate(today), timeSlot: 'morning', activity: '冲浪课程', location: '后海村', transportation: '包车' },
    { date: formatDate(addDays(today, 1)), timeSlot: 'morning', activity: '南山寺', location: '南山文化旅游区', transportation: '公交' },
    { date: formatDate(addDays(today, 2)), timeSlot: 'afternoon', activity: '免税店购物', location: '三亚国际免税城', transportation: '免费班车' },
  ];

  upcomingItineraries.forEach(item => ItineraryModel.create(upcoming.id, item));
  ongoingItineraries.forEach(item => ItineraryModel.create(ongoing.id, item));

  console.log('✅ 示例数据已生成：2个旅行计划，18个行程项');
}
