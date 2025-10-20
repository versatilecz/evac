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
npm start mvp       # Start MVP app + all deps in watch mode
npm start pow       # Start POW app dev server
npm run build mvp   # Build MVP for production
npm run build:all   # Build all packages
nx graph            # Visualize dependency graph
```

### Development Server Setup

- **Library Watch Mode**: Running `npm start mvp` starts all dependent packages in watch mode (`vite build --watch`)
- **Hot Module Replacement**: Changes in packages automatically rebuild and trigger HMR in apps
- **Nx Caching**: Build outputs are cached; use `npx nx reset` to clear cache

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
- **Reactive State**: Services use `unstorage` for persistence (IndexedDB) and are AsyncIterable
- **WebSocket Orchestration**: `orchestrateWebSocketAndServices()` handles connection lifecycle
- **Fluent API**: Services use `.withSources()` and `.withActions()` for composition

### Nx Monorepo Structure

- **Apps**: Independent Vue applications (`@evac/mvp`, `@evac/pow`)
- **Packages**: Scoped libraries (`@evac/shared`, `@evac/ui`, `@evac/utils`, domain packages)
- **Dependency Graph**: Apps depend on packages; packages can depend on each other
- **Dev Target**: All packages have a `dev` target that runs `vite build --watch` for hot reloading

### Component Patterns

- **Reka UI**: Primary component library (namespaced exports from `reka-ui/namespaced`)
- **Tailwind CSS v4**: Utility-first styling with Vite plugin (`@tailwindcss/vite`)
- **Vue Composition API**: Preferred over Options API; use `<script setup>` syntax
- **TypeScript**: Strict type checking across all packages

## Key Integration Points

### Rust ↔ Frontend Communication

- **Message Types**: Defined in `shared/src/messages/` (Rust) and mirrored in TypeScript
- **Serialization**: JSON over WebSocket (Rust uses serde_json)
- **Type Safety**: Zod schemas validate incoming messages on frontend

### WebSocket Service Pattern

```typescript
// Modern service definition with fluent API
export const service = defineService({
  name: "serviceName",
  identity: SomeZodSchema,
  storage: (storage) => prefixStorage(storage, "namespace"),
})
  .withSources(async function* (source) {
    for await (const message of source) {
      const parsed = SomeMessageSchema.safeParse(message);
      if (!parsed.success) continue;
      yield parsed.data;
    }
  })
  .withActions({
    async someAction(source, param: string) {
      // `this` is typed as WebSocketService
      // `source` is typed as WebSocketConnection
      await source.send({ type: "action", param });
    },
  });

// Service lifecycle in app
service.start({
  connection,
  storage,
  signal: abortSignal,
});

// Consume service data
for await (const data of service) {
  console.log(data);
}
```

### Service API Methods

- **`defineService(config)`**: Create base service with name, identity (Zod), storage
- **`.withSources(...sources)`**: Add data sources that parse WebSocket messages
- **`.withActions(actions)`**: Add action methods with typed parameters
- **`.start(payload)`**: Start service with WebSocket connection and storage
- **`.stop()`**: Stop service and clean up resources
- **`.get()`**: Retrieve current state from storage
- **`.set(value, source?)`**: Update state with optional async source

### Package Dependencies

- All apps depend on `@evac/shared` for core types and services
- Domain packages (config, devices, locations, rooms, scanners) export services and types
- UI components in `@evac/ui` use Reka UI + custom components
- Utils in `@evac/utils` provide reactive helpers and async utilities
- Fonts in `@evac/fonts` provide custom Vite plugin for font handling

## Critical Development Notes

### Build System

- **Nx + Vite**: Nx orchestrates builds, Vite handles bundling
- **Vite Library Mode**: Packages use `defineConfig()` from `configs/vite/lib.ts`
- **Library Config**: Sets `root: dirname`, `outDir: 'dist'`, `emptyOutDir: true`
- **Path Resolution**: Use `@/` alias in apps (resolves to `src/`); packages use relative imports
- **Asset Handling**: Icons via custom Vite plugin, fonts via `@evac/fonts` custom plugin
- **External Dependencies**: All package deps/peerDeps are externalized in builds

### Custom Vite Plugins

- **Fonts Plugin** (`@evac/fonts/vite`): Serves fonts in dev, copies to dist in build, injects CSS
  - Middleware for `/fonts/*` paths in dev
  - Copies font files to output directory during build
  - Injects `<link rel="preload">` and `<style>` tags to HTML

### State Management

- **No Vuex/Pinia**: Services + unstorage + reactive primitives
- **Persistence**: IndexedDB via unstorage drivers (storage keys namespaced by service)
- **Reactivity**: AsyncIterables + EventTarget for service communication
- **Service Lifecycle**: Services are disposable; use `Symbol.dispose` or `.stop()`

### TypeScript Configuration

- **Base Config**: `configs/tsconfig/base.json` with strict mode
- **Library Config**: `configs/tsconfig/lib.json` for packages (no `skipTemplateCodegen`)
- **Vue Config**: `configs/tsconfig/lib.vue.json` for Vue component libraries
- **Project References**: Uses TypeScript project references for incremental builds
- **Vue Language Server**: Enable `vue.server.hybridMode` in VS Code settings

### Testing Strategy

- **Vitest**: Unit testing for packages and apps
- **Component Testing**: Vue Test Utils integration
- **E2E**: Nightwatch configuration present but minimal usage
- **Coverage**: Vitest coverage via `mode: "coverage"`

### Common Pitfalls

- **Service Lifecycle**: Always dispose services properly to prevent memory leaks
- **WebSocket Reconnection**: Services handle reconnection automatically via orchestrator
- **Type Imports**: Use `type` imports for TypeScript-only imports to avoid bundle bloat
- **Workspace Paths**: After moving workspace, ensure Vite `root` is set correctly in lib config
- **Nx Cache**: Clear with `npx nx reset` if seeing stale builds or path issues
- **Vue Template Types**: Don't manually type `this`/`source` in actions - types are inferred
- **Package Building**: Build packages before apps; Nx handles dependency order automatically
