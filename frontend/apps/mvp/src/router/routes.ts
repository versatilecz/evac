import { Views as Dashboard } from '@evac/dashboard'
import type { RouteRecordRaw } from 'vue-router'
import { routes as configRoutes, Views as Config } from '@/config'

export default [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard.Basic,
  },
  {
    path: '/config',
    name: 'config',
    component: Config.Config,
    children: configRoutes,
  },
] satisfies RouteRecordRaw[]
