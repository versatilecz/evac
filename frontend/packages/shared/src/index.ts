// Types
export * from './types/index.js'

// Constants
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000'

export const APP_CONFIG = {
  name: 'EVAC',
  version: '1.0.0',
  description: 'Emergency Evacuation Management System',
} as const
