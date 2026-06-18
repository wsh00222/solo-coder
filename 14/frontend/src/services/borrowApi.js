import request from './request'

export function getBorrowRecords(params) {
  return request({
    url: '/borrow',
    method: 'get',
    params
  })
}

export function borrowEquipment(id, data) {
  return request({
    url: `/borrow/${id}/borrow`,
    method: 'post',
    data
  })
}

export function returnEquipment(id, data) {
  return request({
    url: `/borrow/${id}/return`,
    method: 'post',
    data
  })
}

export function getEquipmentBorrowStats(id) {
  return request({
    url: `/borrow/stats/${id}`,
    method: 'get'
  })
}
