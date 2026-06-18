import { isDatabaseEmpty, seedActivitiesAndRegistrations } from './db';

export function seedData() {
  if (!isDatabaseEmpty()) return;

  const now = new Date();
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const futureDeadline = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const pastDeadline = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 16);

  const activities = [
    {
      title: '2026 前端技术分享会',
      activityTime: fmt(futureDate),
      location: '北京市朝阳区科技大厦 A 座 3 楼会议室',
      deadline: fmt(futureDeadline),
      maxParticipants: 50,
      description: '邀请多位前端领域专家，分享 React、Vue、TypeScript 最新实践，现场有问答和抽奖环节，提供茶歇。',
    },
    {
      title: '产品设计工作坊',
      activityTime: fmt(pastDate),
      location: '上海市浦东新区创新中心 B 栋',
      deadline: fmt(pastDeadline),
      maxParticipants: 30,
      description: '从用户需求到产品原型的全流程实战，适合产品经理、设计师和开发人员参加。',
    },
  ];

  const registrations = [
    { activityIndex: 0, name: '张三', phone: '13800138001', email: 'zhangsan@example.com', checkedIn: 0 },
    { activityIndex: 0, name: '李四', phone: '13800138002', email: 'lisi@example.com', checkedIn: 0 },
    { activityIndex: 0, name: '王五', phone: '13800138003', email: null, checkedIn: 0 },
    { activityIndex: 0, name: '赵六', phone: '13800138004', email: 'zhaoliu@example.com', checkedIn: 0 },
    { activityIndex: 1, name: '陈七', phone: '13900139001', email: 'chenqi@example.com', checkedIn: 1 },
    { activityIndex: 1, name: '周八', phone: '13900139002', email: null, checkedIn: 1 },
    { activityIndex: 1, name: '吴九', phone: '13900139003', email: 'wujiu@example.com', checkedIn: 0 },
  ];

  seedActivitiesAndRegistrations(activities, registrations);
}
