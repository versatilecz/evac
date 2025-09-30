import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('./views/Dashboard.vue'),
    },
    {
      path: '/config',
      name: 'config',
      component: () => import('./views/Config.vue'),
    },
    {
      path: '/locations',
      name: 'locations',
      component: () => import('./views/Locations.vue'),
    },

    {
      path: '/rooms',
      name: 'rooms',
      component: () => import('./views/Rooms.vue'),
    },
    {
      path: '/scanners',
      name: 'scanners',
      component: () => import('./views/Scanners.vue'),
    },
    {
      path: '/alarms',
      name: 'alarms',
      component: () => import('./views/Alarms.vue'),
    },
    {
      path: '/emails',
      name: 'emails',
      component: () => import('./views/Emails.vue'),
    },
    {
      path: '/devices',
      name: 'devices',
      component: () => import('./views/Devices.vue'),
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('./views/Tools.vue'),
    },
  ],
})

export default router
