import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('./views/Dashboard.vue')
    },
    {
      path: '/config',
      name: 'config',
      component: () => import('./views/Config.vue')
    },
    {
      path: '/area',
      name: 'area',
      component: () => import('./views/Area.vue')
    },
    {
      path: '/scanners',
      name: 'scanners',
      component: () => import('./views/Scanners.vue')
    },
    {
      path: '/Devices',
      name: 'devices',
      component: () => import('./views/Devices.vue')
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('./views/Tools.vue')
    },
  ]
})

export default router
