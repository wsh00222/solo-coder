const borrowService = require('../services/borrowService');
const { isValidDate, isDateAfter, getToday } = require('../utils/helpers');

function listRecords(req, res) {
  try {
    const { equipmentId } = req.query;
    let eid = null;
    if (equipmentId) {
      const parsed = parseInt(equipmentId, 10);
      if (!isNaN(parsed)) eid = parsed;
    }
    const records = borrowService.getAllRecords({ equipmentId: eid });
    res.json({ success: true, data: records });
  } catch (err) {
    console.error('listRecords error:', err);
    res.status(500).json({ success: false, message: err.message || '获取借用记录失败' });
  }
}

function borrowEquipment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的设备ID' });
    }
    const { borrower, reason, expectedReturnDate } = req.body || {};
    if (!borrower || !borrower.trim()) {
      return res.status(400).json({ success: false, message: '借用人姓名不能为空' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: '借用事由不能为空' });
    }
    if (!expectedReturnDate) {
      return res.status(400).json({ success: false, message: '预计归还日期不能为空' });
    }
    if (!isValidDate(expectedReturnDate)) {
      return res.status(400).json({ success: false, message: '预计归还日期格式无效，应为 YYYY-MM-DD' });
    }
    const record = borrowService.borrowEquipment(id, {
      borrower: borrower.trim(),
      reason: reason.trim(),
      expectedReturnDate
    });
    res.status(201).json({ success: true, data: record, message: '借用成功' });
  } catch (err) {
    console.error('borrowEquipment error:', err);
    const msg = err.message || '借用失败';
    const code = msg.includes('不存在') || msg.includes('不可') || msg.includes('必须') ? 400 : 500;
    res.status(code).json({ success: false, message: msg });
  }
}

function returnEquipment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的设备ID' });
    }
    const { actualReturnDate, toMaintenance } = req.body || {};
    let validReturnDate = null;
    if (actualReturnDate) {
      if (!isValidDate(actualReturnDate)) {
        return res.status(400).json({ success: false, message: '实际归还日期格式无效，应为 YYYY-MM-DD' });
      }
      validReturnDate = actualReturnDate;
    }
    const record = borrowService.returnEquipment(id, {
      actualReturnDate: validReturnDate,
      toMaintenance: !!toMaintenance
    });
    res.json({ success: true, data: record, message: '归还成功' });
  } catch (err) {
    console.error('returnEquipment error:', err);
    const msg = err.message || '归还失败';
    const code = msg.includes('不存在') || msg.includes('未') || msg.includes('找到') ? 400 : 500;
    res.status(code).json({ success: false, message: msg });
  }
}

function getEquipmentStats(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的设备ID' });
    }
    const stats = borrowService.getEquipmentBorrowStats(id);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('getEquipmentStats error:', err);
    res.status(500).json({ success: false, message: err.message || '获取统计数据失败' });
  }
}

module.exports = {
  listRecords,
  borrowEquipment,
  returnEquipment,
  getEquipmentStats
};
