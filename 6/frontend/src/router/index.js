import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'NoteList',
    component: () => import('../views/NoteList.vue'),
    meta: { title: '笔记列表' }
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: () => import('../views/NoteDetail.vue'),
    meta: { title: '笔记详情' }
  },
  {
    path: '/new',
    name: 'NoteCreate',
    component: () => import('../views/NoteEditor.vue'),
    meta: { title: '新建笔记' }
  },
  {
    path: '/notes/:id/edit',
    name: 'NoteEdit',
    component: () => import('../views/NoteEditor.vue'),
    meta: { title: '编辑笔记' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const baseTitle = '知识笔记'
  document.title = to.meta.title ? `${to.meta.title} - ${baseTitle}` : baseTitle
})

export default router
