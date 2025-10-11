# EVAC Copilot Instructions

Emergency Evacuation Management System (EVAC) - A hybrid Rust/TypeScript system with real-time WebSocket communication.

## Architecture Overview

### Three-Tier System

- **Rust Backend**: Server (`server/`) + shared types (`shared/`) + demo/embedded (`demo/`)
- **Vue.js Frontend**: Nx monorepo (`frontend/`) with apps and packages
- **Real-time Communication**: WebSocket-based service orchestration with MessagePack serialization

### Key Components

- **Server**: Warp-based web server with WebSocket endpoints (`/api/operator`, `/api/scanner`)
- **Frontend Apps**: MVP (main app) and POW (legacy/reference)
- **Shared Packages**: Type-safe services, UI components, utilities
- **Data Flow**: Rust messages → WebSocket → Vue services → Reactive UI

## Development Workflows

### Essential Commands

```bash
# Backend development
cargo demo          # Start embedded demo
cargo server        # Start development server
cargo build --release -p server  # Production build

# Frontend development (from /frontend)
nvm use             # Set Node version
npm ci              # Install dependencies
npm start mvp       # Start MVP app dev server
npm start pow       # Start POW app dev server
npm run build mvp   # Build MVP for production
nx graph           # Visualize dependency graph
```

### Configuration Setup

Create `data/server.json` for backend configuration:

```json
{
  "base": {
    "configPath": "data/server.json",
    "dataPath": "data/database.json",
    "frontendPath": "./frontend/dist",
    "portWeb": "0.0.0.0:3030",
    "portScanner": "0.0.0.0:4242"
  }
}
```

## Frontend Architecture Patterns

### Service-Oriented Architecture

- **Services as EventTargets**: Each domain (config, devices, locations, rooms, scanners) has a service that extends EventTarget
- **Reactive State**: Services use `unstorage` for persistence and RxJS for reactivity
- **WebSocket Orchestration**: `orchestrateWebSocketAndServices()` handles connection lifecycle

### Nx Monorepo Structure

- **Apps**: Independent Vue applications (`@evac/mvp`, `@evac/pow`)
- **Packages**: Scoped libraries (`@evac/shared`, `@evac/ui`, `@evac/utils`)
- **Dependency Graph**: Apps depend on packages; packages can depend on each other

### Component Patterns

- **Reka UI**: Primary component library (namespaced exports)
- **Tailwind CSS v4**: Utility-first styling with Vite plugin
- **Vue Composition API**: Preferred over Options API
- **TypeScript**: Strict type checking across all packages

## Key Integration Points

### Rust ↔ Frontend Communication

- **Message Types**: Defined in `shared/src/messages/` (Rust) and mirrored in TypeScript
- **Serialization**: MessagePack for binary efficiency
- **Type Safety**: Zod schemas validate incoming messages

### WebSocket Service Pattern

```typescript
// Service definition pattern
export const service = defineService({
  name: "serviceName",
  identity: SomeZodSchema,
  storage: (storage) => prefixStorage(storage, "namespace"),
});

// Message parsing pattern
export const parseMessages = (message: unknown) => {
  // Transform raw WebSocket data to service format
};
```

### Package Dependencies

- All apps depend on `@evac/shared` for core types and services
- UI components in `@evac/ui` use Reka UI + custom components
- Utils in `@evac/utils` provide reactive helpers and async utilities

## Critical Development Notes

### Build System

- **Nx + Vite**: Nx orchestrates builds, Vite handles bundling
- **Path Resolution**: Use absolute imports with `@/` alias in apps
- **Asset Handling**: Icons via custom Vite plugin, fonts via `@evac/fonts`

### State Management

- **No Vuex/Pinia**: Services + unstorage + reactive primitives
- **Persistence**: IndexedDB via unstorage drivers
- **Reactivity**: AsyncIterables + EventTarget + RxJS for service communication

### Testing Strategy

- **Vitest**: Unit testing for packages and apps
- **Component Testing**: Vue Test Utils integration
- **E2E**: Nightwatch configuration present but minimal usage

### Common Pitfalls

- **Service Lifecycle**: Always dispose services properly to prevent memory leaks
- **WebSocket Reconnection**: Services handle reconnection automatically
- **Type Imports**: Use `type` imports for TypeScript-only imports to avoid bundle bloat
