import * as z from 'zod'

export type $BaseConfig = z.output<typeof $BaseConfig>

export const $BaseConfig = z.object({
  activityDiff: z.number().min(0).default(15),
  authPath: z.string().default('data/server.json'),
  configPath: z.string().default('data/server.json'),
  dataPath: z.string().default('data/database.json'),
  frontendPath: z.string().default('./frontend/dist'),
  portBroadcast: z.string().default('192.168.1.255:4242'),
  portScanner: z.string().default('0.0.0.0:4242'),
  portWeb: z.string().default('0.0.0.0:3030'),
  querySize: z.number().min(1).max(1000).default(16),
  routine: z.number().min(0).default(5),
  salt: z.string().min(5).default('change-me!'),
})
