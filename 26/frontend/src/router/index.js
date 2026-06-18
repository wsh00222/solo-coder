import { createRouter, createWebHistory } from 'vue-router'
import MemberList from '../views/MemberList.vue'
import MemberDetail from '../views/MemberDetail.vue'

const routes = [
  { path: '/', name: 'MemberList', component: MemberList },
  { path: '/member/:id', name: 'MemberDetail', component: MemberDetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
