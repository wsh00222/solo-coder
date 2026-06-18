const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

const sampleMembers = [
  { id: 1, name: '张伟', position: '前端工程师', phone: '13810001001', email: 'zhangwei@example.com', department: '研发' },
  { id: 2, name: '李娜', position: '产品经理', phone: '13920002002', email: 'lina@example.com', department: '市场' },
  { id: 3, name: '王强', position: '运营主管', phone: '13730003003', email: 'wangqiang@example.com', department: '运营' },
  { id: 4, name: '赵敏', position: '后端工程师', phone: '13640004004', email: 'zhaomin@example.com', department: '研发' },
  { id: 5, name: '刘洋', position: '行政助理', phone: '13550005005', email: 'liuyang@example.com', department: '其他' }
];

function loadData() {
  if (!fs.existsSync(dataPath)) {
    const initialData = { members: sampleMembers, nextId: 6 };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('已生成 5 个示例成员');
    return initialData;
  }
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

let data = loadData();

function getAllMembers({ department, keyword } = {}) {
  let result = [...data.members];

  if (department && department !== 'all') {
    result = result.filter(m => m.department === department);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(m =>
      m.name.toLowerCase().includes(kw) ||
      m.phone.includes(kw)
    );
  }

  return result.sort((a, b) => b.id - a.id);
}

function getMemberById(id) {
  return data.members.find(m => m.id === Number(id)) || null;
}

function getStats() {
  const departments = ['研发', '市场', '运营', '其他'];
  const byDepartment = {};
  departments.forEach(d => {
    byDepartment[d] = data.members.filter(m => m.department === d).length;
  });
  return { total: data.members.length, byDepartment };
}

function addMember(member) {
  const newMember = {
    id: data.nextId,
    ...member
  };
  data.members.push(newMember);
  data.nextId++;
  saveData(data);
  return newMember;
}

function updateMember(id, member) {
  const index = data.members.findIndex(m => m.id === Number(id));
  if (index === -1) return null;
  data.members[index] = { ...data.members[index], ...member, id: Number(id) };
  saveData(data);
  return data.members[index];
}

function deleteMember(id) {
  const index = data.members.findIndex(m => m.id === Number(id));
  if (index === -1) return null;
  const member = data.members[index];
  const deptCount = data.members.filter(m => m.department === member.department).length;
  const willBeEmpty = deptCount === 1;
  data.members.splice(index, 1);
  saveData(data);
  return { member, willBeEmpty, department: member.department };
}

module.exports = {
  getAllMembers,
  getMemberById,
  getStats,
  addMember,
  updateMember,
  deleteMember
};
