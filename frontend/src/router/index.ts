import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ============================================================
// 📌 路由配置规则（修改本文件时必须遵循）
// ------------------------------------------------------------
// 1. 顶层路由（不需要布局）：/login、/register 等独立页面，直接 component: Login
// 2. 布局子路由（需要布局）：放在 MainLayout 的 children 里
// 3. 默认跳转：用 { path: '', redirect: '/xxx' } 作为默认子路由
// 4. 懒加载：业务页面使用 () => import('@/views/xxx.vue')
// 5. 路径格式：不带前导斜杠，如 path: 'users' 而非 path: '/users'
// 6. 页面导航必须使用 useRouter()，禁止 window.location.href
// ============================================================

declare const __ROUTER_BASENAME__: string
const base = typeof __ROUTER_BASENAME__ !== 'undefined' ? __ROUTER_BASENAME__ : '/'

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/home' },
        { path: 'home', name: 'Home', component: () => import('@/views/home/index.vue'), meta: { title: '首页', showTab: true } },
        { path: 'search', name: 'Search', component: () => import('@/views/Search.vue'), meta: { title: '搜索', showBack: true } },
        { path: 'items', name: 'Items', component: () => import('@/views/items/index.vue'), meta: { title: '物品', showTab: true, showAdd: true } },
        { path: 'items/create', name: 'ItemCreate', component: () => import('@/views/items/form.vue'), meta: { title: '新增物品', showBack: true } },
        { path: 'items/:id', name: 'ItemDetail', component: () => import('@/views/items/detail.vue'), meta: { title: '物品详情', showBack: true } },
        { path: 'items/:id/edit', name: 'ItemEdit', component: () => import('@/views/items/form.vue'), meta: { title: '编辑物品', showBack: true } },
        { path: 'cabinets', name: 'Cabinets', component: () => import('@/views/cabinets/index.vue'), meta: { title: '储物柜', showTab: true, showAdd: true } },
        { path: 'cabinets/create', name: 'CabinetCreate', component: () => import('@/views/cabinets/form.vue'), meta: { title: '新增储物柜', showBack: true } },
        { path: 'cabinets/:id', name: 'CabinetDetail', component: () => import('@/views/cabinets/detail.vue'), meta: { title: '储物柜详情', showBack: true } },
        { path: 'cabinets/:id/edit', name: 'CabinetEdit', component: () => import('@/views/cabinets/form.vue'), meta: { title: '编辑储物柜', showBack: true } },
        { path: 'categories', name: 'Categories', component: () => import('@/views/Categories.vue'), meta: { title: '分类管理', showBack: true } },
        { path: 'backup', name: 'Backup', component: () => import('@/views/Backup.vue'), meta: { title: '数据备份', showBack: true } },
        { path: 'profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { title: '我的', showTab: true } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
