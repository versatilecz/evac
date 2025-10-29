import type { RouteRecordRaw } from 'vue-router'
import { Alarms, Config, Devices, Emails, Locations, Rooms, Scanners, Tools } from '@/views'

export default [
  {
    path: 'locations',
    name: 'config.locations',
    component: Locations,
  },
  {
    path: 'rooms',
    name: 'config.rooms',
    component: Rooms,
  },
  {
    path: 'scanners',
    name: 'config.scanners',
    component: Scanners,
  },
  {
    path: 'devices',
    name: 'config.devices',
    component: Devices,
  },
  {
    path: 'alarms',
    name: 'config.alarms',
    component: Alarms,
  },
  {
    path: 'emails',
    name: 'config.emails',
    component: Emails,
  },
  {
    path: 'tools',
    name: 'config.tools',
    component: Tools,
  },
  {
    path: 'config',
    name: 'config.config',
    component: Config,
  },
  {
    path: '',
    name: 'config.index',
    redirect: { name: 'config.locations' },
  },
] satisfies RouteRecordRaw[]
