const equipmentService = require('../services/equipmentService');
const borrowService = require('../services/borrowService');
const { isValidDate, isDateAfter, getToday } = require('../utils/helpers');

const EquipmentStatus = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  MAINTENANCE: 'maintenance'
};

const validStatuses = Object.values(EquipmentStatus);

function listEquipment(req, res) {
  try {
    const { status, keyword } = req.query;
    let validStatus = null;
    if (status && validStatuses.includes(status)) {
      validStatus = status;
    }
    const equipments = equipmentService.getAllEquipment({
      status: validStatus,
      keyword: keyword || ''
    });
    res.json({ success: true, data: equipments });
  } catch (err) {
    console.error('listEquipment error:', err);
    res.status(500).json({ success: false, message: err.message || '获取设备列表失败' });
  }
}

function getEquipment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的设备ID' });
    }
    const equipment = equipmentService.getEquipmentById(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: '设备不存在' });
    }
    const records = borrowService.getRecordsByEquipment(id);
    const stats = borrowService.getEquipmentBorrowStats(id);
    res.json({
      success: true,
      data: { ...equipment, borrowRecords: records, borrowStats: stats }
    });
  } catch (err) {
    console.error('getEquipment error:', err);
    res.status(500).json({ success: false, message: err.message || '获取设备详情失败' });
  }
}

function createEquipment(req, res) {
  try {
    const { name, code, model, location, status } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: '设备名称不能为空' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: '设备编号不能为空' });
    }
    const existing = equipmentService.getEquipmentByCode(code.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: '设备编号已存在' });
    }
    let validStatus = status;
    if (status && !validStatuses.includes(status)) {
      validStatus = EquipmentStatus.AVAILABLE;
    }
    const equipment = equipmentService.createEquipment({
      name: name.trim(),
      code: code.trim(),
      model: model ? model.trim() : null,
      location: location ? location.trim() : null,
      status: validStatus || EquipmentStatus.AVAILABLE
    });
    res.status(201).json({ success: true, data: equipment, message: '创建设备成功' });
  } catch (err) {
    console.error('createEquipment error:', err);
    res.status(500).json({ success: false, message: err.message || '创建设备失败' });
  }
}

function updateEquipment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的设备ID' });
    }
    const existing = equipmentService.getEquipmentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '设备不存在' });
    }
    const { name, model, location, status } = req.body || {};
    let validStatus = null;
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: '无效的设备状态' });
      }
      validStatus = status;
    }
    const equipment = equipmentService.updateEquipment(id, {
      name: name ? name.trim() : undefined,
      model: model !== undefined ? (model ? model.trim() : null) : undefined,
      location: location !== undefined ? (location ? location.trim() : null) : undefined,
      status: validStatus
    });
    res.json({ success: true, data: equipment, message: '更新设备成功' });
  } catch (err) {
    console.error('updateEquipment error:', err);
    res.status(500).json({ success: false, message: err.message || '更新设备失败' });
  }
}

function deleteEquipment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的设备ID' });
    }
    const existing = equipmentService.getEquipmentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '设备不存在' });
    }
    if (existing.status !== EquipmentStatus.AVAILABLE) {
      return res.status(400).json({ success: false, message: '设备当前无法删除，仅可用状态可删除' });
    }
    const success = equipmentService.deleteEquipment(id);
    if (success) {
      res.json({ success: true, message: '删除设备成功' });
    } else {
      res.status(500).json({ success: false, message: '删除设备失败' });
    }
  } catch (err) {
    console.error('deleteEquipment error:', err);
    res.status(500).json({ success: false, message: err.message || '删除设备失败' });
  }
}

function getStatistics(req, res) {
  try {
    const stats = equipmentService.getStatistics();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('getStatistics error:', err);
    res.status(500).json({ success: false, message: err.message || '获取统计数据失败' });
  }
}

function refreshOverdue(req, res) {
  try {
    const equipments = equipmentService.getAllEquipment({});
    const stats = equipmentService.getStatistics();
    res.json({ success: true, data: { equipments, stats }, message: '逾期状态已刷新' });
  } catch (err) {
    console.error('refreshOverdue error:', err);
    res.status(500).json({ success: false, message: err.message || '刷新状态失败' });
  }
}

function exportCSV(req, res) {
  try {
    const { status, keyword } = req.query;
    let validStatus = null;
    if (status && validStatuses.includes(status)) {
      validStatus = status;
    }
    const equipments = equipmentService.getAllEquipment({
      status: validStatus,
      keyword: keyword || ''
    });

    const statusLabel = {
      available: '可用',
      borrowed: '已借出',
      maintenance: '维修中'
    };

    const header = ['设备名称', '设备编号', '规格型号', '所在位置', '状态'];
    const rows = equipments.map(eq => [
      eq.name || '',
      eq.code || '',
      eq.model || '',
      eq.location || '',
      statusLabel[eq.status] || eq.status
    ]);

    const escapeCSV = val => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [header, ...rows]
      .map(row => row.map(escapeCSV).join(','))
      .join('\n');

    const today = getToday();
    const filename = `设备列表_${today}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.write('\ufeff');
    res.send(csvContent);
  } catch (err) {
    console.error('exportCSV error:', err);
    res.status(500).json({ success: false, message: err.message || '导出失败' });
  }
}

module.exports = {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getStatistics,
  refreshOverdue,
  exportCSV
};
