const { readAll, writeAll } = require('../models/recordModel')
const { v4: uuidv4 } = require('uuid')

function seedIfNeeded() {
  const records = readAll()
  if (records.length > 0) return

  const now = new Date()
  const seeds = [
    { amount: 8500.00, category: '工资', date: daysAgo(now, 0), note: '月薪' },
    { amount: -35.50, category: '餐饮', date: daysAgo(now, 1), note: '午餐' },
    { amount: -128.00, category: '交通', date: daysAgo(now, 2), note: '加油' },
    { amount: -299.90, category: '购物', date: daysAgo(now, 3), note: '日用品采购' },
    { amount: -50.00, category: '娱乐', date: daysAgo(now, 5), note: '电影票' }
  ]

  const newRecords = seeds.map(s => ({
    id: uuidv4(),
    ...s,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  writeAll(newRecords)
  console.log('已自动生成 5 条示例数据')
}

function daysAgo(base, n) {
  const d = new Date(base)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

module.exports = { seedIfNeeded }
