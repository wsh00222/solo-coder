import request from './request'

export function getEquipmentList(params) {
  return request({
    url: '/equipment',
    method: 'get',
    params
  })
}

export function getEquipmentDetail(id) {
  return request({
    url: `/equipment/${id}`,
    method: 'get'
  })
}

export function createEquipment(data) {
  return request({
    url: '/equipment',
    method: 'post',
    data
  })
}

export function updateEquipment(id, data) {
  return request({
    url: `/equipment/${id}`,
    method: 'put',
    data
  })
}

export function deleteEquipment(id) {
  return request({
    url: `/equipment/${id}`,
    method: 'delete'
  })
}

export function getStatistics() {
  return request({
    url: '/equipment/statistics',
    method: 'get'
  })
}

export function refreshOverdue() {
  return request({
    url: '/equipment/refresh-overdue',
    method: 'get'
  })
}

export function exportCSV(params) {
  return request({
    url: '/equipment/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
