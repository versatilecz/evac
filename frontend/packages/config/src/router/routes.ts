import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'locations',
    name: 'config.locations',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: 'rooms',
    name: 'config.rooms',
    component: () => import('../views/Rooms.vue').then((m) => m.default),
  },
  {
    path: 'scanners',
    name: 'config.scanners',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: 'devices',
    name: 'config.devices',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: 'alarms',
    name: 'config.alarms',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: 'emails',
    name: 'config.emails',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: 'tools',
    name: 'config.tools',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: 'config',
    name: 'config.config',
    component: () => import('../views/Locations.vue').then((m) => m.default),
  },
  {
    path: '',
    name: 'config.index',
    redirect: { name: 'config.locations' },
  },
] satisfies RouteRecordRaw[]
