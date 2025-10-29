import { Views as Alarms } from '@evac/alarms'
import { Views as Config } from '@evac/config'
import { Views as Devices } from '@evac/devices'
import { Views as Emails } from '@evac/emails'
import { Views as Locations } from '@evac/locations'
import { Views as Rooms } from '@evac/rooms'
import { Views as Scanners } from '@evac/scanners'
import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'locations',
    name: 'config.locations',
    component: Locations.Config,
  },
  {
    path: 'rooms',
    name: 'config.rooms',
    component: Rooms.Config,
  },
  {
    path: 'scanners',
    name: 'config.scanners',
    component: Scanners.Config,
  },
  {
    path: 'devices',
    name: 'config.devices',
    component: Devices.Config,
  },
  {
    path: 'alarms',
    name: 'config.alarms',
    component: Alarms.Config,
  },
  {
    path: 'emails',
    name: 'config.emails',
    component: Emails.Config,
  },
  {
    path: 'tools',
    name: 'config.tools',
    component: Config.Tools,
  },
  {
    path: 'config',
    name: 'config.config',
    component: Config.Config,
  },
  {
    path: '',
    name: 'config.index',
    redirect: { name: 'config.locations' },
  },
] satisfies RouteRecordRaw[]
