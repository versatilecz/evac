# EVAC Frontend Monorepo

An Nx-powered monorepo for the Emergency Evacuation Management System (EVAC) frontend applications and shared libraries.

## 🏗️ Architecture

This monorepo uses Nx to manage multiple Vue.js applications and shared packages:

### Applications (`apps/`)

- **mvp** - Minimum Viable Product application with full feature set
- **pow** - Production/Proof of Work application (legacy, preserved for reference)

### Packages (`packages/`)

- **shared** - Shared types, constants, and configuration
- **ui** - Reusable UI components built with Reka UI and Tailwind CSS
- **utils** - Common utilities and helper functions

## 🚀 Technology Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Monorepo**: Nx
- **Styling**: Tailwind CSS
- **Components**: Reka UI
- **Router**: Vue Router
- **State**: Unstorage
- **Reactive**: RxJS
- **Utils**: VueUse
- **Testing**: Vitest
- **Linting**: ESLint

## 📦 Package Management

This workspace uses npm workspaces with the following structure:

```
frontend/
├── apps/
│   ├── mvp/           # MVP application
│   └── pow/           # Legacy application
├── packages/
│   ├── shared/        # Shared types and constants
│   ├── ui/            # UI component library
│   └── utils/         # Utility functions
├── nx.json           # Nx configuration
├── package.json      # Root package configuration
└── tsconfig.json     # TypeScript project references
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or later)
- npm

### Getting Started

1. Install dependencies:

```bash
npm ci
```

2. Start the MVP development server:

```bash
npm run dev mvp
```

3. Start the POW development server:

```bash
npm run dev pow
```

### Available Scripts

```bash
# Development
npm start mvp             # Start MVP app
npm start pow             # Start POW app

# Building
npm run build:all         # Build all applications
npm run build mvp         # Build MVP app
npm run build pow         # Build POW app

# Testing
npm run test:all          # Test all applications
npm test mvp              # Test MVP app
npm test shared           # Test shared package

# Linting & formatting
npm run lint              # Lint all projects
npm run format            # Format all projects
```

## 🤝 Contributing

1. Follow the established project structure
2. Use TypeScript for type safety
3. Write tests for new features
4. Follow the existing code style
5. Update documentation as needed

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Run End-to-End Tests with [Nightwatch](https://nightwatchjs.org/)

```sh
# When using CI, the project must be built first.
yarn build

# Runs the end-to-end tests
yarn test:e2e
# Runs the tests only on Chrome
yarn test:e2e -- --env chrome
# Runs the tests of a specific file
yarn test:e2e -- tests/e2e/example.js
# Runs the tests in debug mode
yarn test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
