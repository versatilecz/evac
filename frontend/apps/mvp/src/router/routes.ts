import type { RouteRecordRaw } from 'vue-router'
import { Config, routes as configRoutes } from '@evac/config'
import { Dashboard } from '@evac/dashboard'

export default [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
  },
  {
    path: '/config',
    name: 'config',
    component: Config,
    children: configRoutes,
  },
] satisfies RouteRecordRaw[]
