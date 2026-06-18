import { createRouter, createWebHistory } from 'vue-router'
import EquipmentList from '@/views/EquipmentList.vue'
import EquipmentDetail from '@/views/EquipmentDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/equipment'
  },
  {
    path: '/equipment',
    name: 'EquipmentList',
    component: EquipmentList,
    meta: { title: '设备列表' }
  },
  {
    path: '/equipment/:id',
    name: 'EquipmentDetail',
    component: EquipmentDetail,
    meta: { title: '设备详情' },
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const base = '设备借用登记系统'
  document.title = to.meta.title ? `${to.meta.title} - ${base}` : base
  next()
})

export default router
