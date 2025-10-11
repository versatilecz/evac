import { inject, type App } from 'vue'

type Auth = {
  isAuthenticated: boolean
  isAdmin: boolean
  isUser: boolean
  isExternal: boolean
}

// Augment Vue's component instance type
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: Auth
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: Auth
  }
}

const AUTH_KEY = Symbol('auth')

export function createAuth() {
  return function authPlugin(app: App) {
    // TODO: implement real authentication logic
    app.config.globalProperties.$auth = {
      isAuthenticated: true,
      isAdmin: true,
      isUser: true,
      isExternal: false,
    }

    app.provide(AUTH_KEY, app.config.globalProperties.$auth)
  }
}

export function useAuth() {
  return inject<Auth>(AUTH_KEY, initAuth, true)
}

function initAuth(): Auth {
  return {
    isAuthenticated: false,
    isAdmin: false,
    isUser: false,
    isExternal: false,
  }
}
