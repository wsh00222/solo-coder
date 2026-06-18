import { db } from './database.js';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function getDaysBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(d));
  }
  return dates;
}

export function seedDatabase() {
  const countResult = db.prepare('SELECT COUNT(*) as count FROM plans').get() as { count: number };
  if (countResult.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  const today = new Date('2026-06-18T00:00:00');
  const todayStr = formatDate(today);

  const insertPlan = db.prepare(`
    INSERT INTO plans (name, goal, start_date, end_date, daily_goal_minutes)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertRecord = db.prepare(`
    INSERT INTO records (plan_id, date, duration_minutes, content)
    VALUES (?, ?, ?, ?)
  `);

  const plan1Start = addDays(today, -45);
  const plan1End = addDays(today, 45);

  const result1 = insertPlan.run(
    'Python 全栈开发',
    '掌握 Python 全栈开发技能',
    plan1Start,
    plan1End,
    90
  );
  const plan1Id = result1.lastInsertRowid as number;

  const plan1StudyDays = getDaysBetween(plan1Start, addDays(today, -4));
  const plan1Contents = [
    '学习 Python 基础语法和数据类型',
    '完成函数定义和模块导入',
    '学习面向对象编程',
    '异常处理和文件操作',
    '学习装饰器和生成器',
    '数据库操作 SQL 基础',
    '学习 Flask Web 框架',
    'RESTful API 设计',
    'Jinja2 模板引擎',
    'SQLAlchemy ORM',
    '用户认证和授权',
    '前端基础 HTML/CSS',
    'JavaScript 基础语法',
    'Vue.js 框架入门',
    '前后端联调实践',
    '项目架构设计',
    '部署到生产环境',
  ];

  plan1StudyDays.forEach((date, index) => {
    const contentIndex = index % plan1Contents.length;
    insertRecord.run(
      plan1Id,
      date,
      60 + Math.floor(Math.random() * 60),
      plan1Contents[contentIndex]
    );
  });

  const plan2Start = addDays(today, -90);
  const plan2End = addDays(today, -30);

  const result2 = insertPlan.run(
    '英语六级备考',
    '通过英语六级考试',
    plan2Start,
    plan2End,
    120
  );
  const plan2Id = result2.lastInsertRowid as number;

  const plan2StudyDays = getDaysBetween(plan2Start, plan2End);
  const plan2Contents = [
    '背诵 50 个新单词',
    '阅读理解练习 2 篇',
    '听力练习 30 分钟',
    '语法专项训练',
    '写作模板学习',
    '翻译练习',
    '真题模拟训练',
    '错题复习',
  ];

  plan2StudyDays.forEach((date, index) => {
    if (index % 3 !== 2) {
      const contentIndex = index % plan2Contents.length;
      insertRecord.run(
        plan2Id,
        date,
        90 + Math.floor(Math.random() * 60),
        plan2Contents[contentIndex]
      );
    }
  });

  console.log('Database seeded successfully!');
  console.log(`Created 2 plans with sample records.`);
  console.log(`Plan 1 (active): ${plan1Id} - 41 days of records`);
  console.log(`Plan 2 (completed): ${plan2Id} - ~40 days of records`);
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase();
}
