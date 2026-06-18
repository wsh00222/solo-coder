const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'meetings.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readData() {
  if (!fs.existsSync(dataFile)) {
    return { meetings: [], nextId: 1 };
  }
  try {
    const content = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return { meetings: [], nextId: 1 };
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatLocalDateTime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function generateSampleMeetings() {
  const data = readData();
  if (data.meetings.length > 0) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(9, 30, 0, 0);

  function fmt(d) {
    return formatLocalDateTime(d);
  }

  const sampleMeetings = [
    {
      id: 1,
      title: '产品需求评审',
      startTime: fmt(today),
      duration: 60,
      location: '会议室A',
      attendees: ['张三', '李四', '王五'],
      agenda: '讨论Q3产品规划和需求优先级排序',
      createdAt: fmt(new Date()),
      updatedAt: fmt(new Date())
    },
    {
      id: 2,
      title: '技术架构讨论',
      startTime: fmt(tomorrow),
      duration: 90,
      location: '会议室B',
      attendees: ['李四', '赵六', '孙七'],
      agenda: '微服务拆分方案讨论，包括数据库选型，以及性能优化方案评审。需要深入讨论各个模块的职责划分和接口设计规范，确保系统可扩展性和可维护性。',
      createdAt: fmt(new Date()),
      updatedAt: fmt(new Date())
    },
    {
      id: 3,
      title: '周例会',
      startTime: fmt(dayAfter),
      duration: 45,
      location: '会议室A',
      attendees: ['张三', '王五', '赵六'],
      agenda: '本周工作回顾和下周计划安排',
      createdAt: fmt(new Date()),
      updatedAt: fmt(new Date())
    }
  ];

  data.meetings = sampleMeetings;
  data.nextId = 4;
  writeData(data);
  console.log('已生成3条示例会议数据');
}

generateSampleMeetings();

module.exports = {
  readData,
  writeData
};
