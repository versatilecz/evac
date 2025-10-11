# EVAC Design System Rules

## Design System Structure

### 1. Token Definitions

**Location**: Tailwind CSS 4 configuration via `@theme` directive in CSS
**Format**: CSS custom properties with Tailwind utilities

#### Colors

```css
@theme {
  /* Brand Colors */
  --color-brand-primary: #000000;
  --color-brand-secondary: #ffffff;

  /* Status Colors */
  --color-success: #4ade80; /* green-400 */
  --color-success-bg: #86efac; /* green-300 */
  --color-info: #60a5fa; /* blue-400 */
  --color-warning: #fbbf24; /* amber-400 */
  --color-error: #f87171; /* red-400 */

  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

#### Typography

- **Font Family**: System font stack (default Tailwind)
- **Headings**:
  - Page title: `text-2xl font-bold` (24px)
  - Section title: `text-xl font-semibold` (20px)
  - Card title: `text-base font-medium` (16px)
- **Body**: `text-sm` (14px) for most content
- **Small text**: `text-xs` (12px) for badges and labels

#### Spacing

- **Container padding**: `p-6` (24px)
- **Section gaps**: `space-y-6` (24px)
- **Card padding**: `p-4` (16px)
- **Button padding**: `px-4 py-2` (16px/8px)
- **Badge padding**: `px-2 py-0.5` (8px/2px)

#### Border Radius

- **Cards**: `rounded-lg` (8px)
- **Buttons**: `rounded-md` (6px)
- **Badges**: `rounded-full`

### 2. Component Library

**Location**: `packages/ui/src/components/`

**Architecture**: Vue 3 Composition API with `<script setup>`

**Existing Components**:

- `PageHeader.vue` - Page header with title
- `EmptyState.vue` - Empty state placeholder
- `LoadingSpinner.vue` - Loading indicator

**New Components Needed**:

- `DashboardLayout.vue` - Main dashboard container
- `EventCard.vue` - Event status card
- `DeviceList.vue` - Device overview list
- `DeviceItem.vue` - Individual device row
- `StatusBadge.vue` - Status indicator badge
- `ActionButton.vue` - Action button with icon

### 3. Frameworks & Libraries

- **UI Framework**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS 4
- **Build System**: Vite 7
- **Package Manager**: npm workspaces
- **Monorepo Tool**: Nx

### 4. Asset Management

- **Icons**: `@evac/icons` package with custom Vite plugin
- **Format**: SVG icons from Google Material Symbols
- **Usage**: Via custom icon utility classes (e.g., `icon-check_circle`)
- **Storage**: `packages/icons/src/icons.json`

### 5. Icon System

**Location**: `packages/icons/`
**Format**: Material Design Icons SVG paths
**Usage Pattern**:

```vue
<span class="icon-settings text-xl"></span>
<span class="icon-check_circle text-green-500"></span>
```

**Icon Names from Design**:

- `settings` - Configuration
- `check_circle` - Success/OK status
- `warning` - Warning status
- `filter_list` - Filter
- `evacuation` - Evacuation
- `domain` - Building
- `school` - Training/Education
- `call` - Phone/Call
- `help` - Help
- Plus custom `badge` and `badge_alert` icons

### 6. Styling Approach

**Methodology**: Utility-first with Tailwind CSS 4
**Global Styles**: `apps/mvp/src/style.css`
**Responsive**: Mobile-first with Tailwind breakpoints
**Dark Mode**: Not currently implemented

**Pattern**:

```vue
<template>
  <div class="flex items-center gap-2 rounded-lg bg-white p-4 shadow-sm">
    <!-- Content -->
  </div>
</template>
```

### 7. Project Structure

```
frontend/
├── apps/
│   └── mvp/                 # Main application
│       └── src/
│           ├── views/       # Page components
│           ├── router/      # Route definitions
│           └── stores/      # State management (if needed)
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── icons/               # Icon system
│   ├── shared/              # Shared utilities
│   └── utils/               # Utility functions
```

## Component Patterns

### Dashboard Page Component

```vue
<script setup lang="ts">
// Composition imports
import { ref, computed } from 'vue'
// Component imports from packages
import { PageHeader } from '@evac/ui'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader title="Dashboard" />
    <main class="container mx-auto p-6">
      <!-- Content -->
    </main>
  </div>
</template>
```

### Card Component Pattern

```vue
<div class="rounded-lg bg-white p-4 shadow-sm">
  <h3 class="mb-4 text-xl font-semibold">{{ title }}</h3>
  <slot />
</div>
```

### Badge Component Pattern

```vue
<span
  class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
>
  {{ label }}
</span>
```

## Design Tokens Mapping

### From Figma to Tailwind

| Figma Token    | Tailwind Class    | Value   |
| -------------- | ----------------- | ------- |
| Success Green  | `bg-green-300`    | #86efac |
| Info Blue      | `bg-blue-400`     | #60a5fa |
| Text Primary   | `text-gray-900`   | #111827 |
| Text Secondary | `text-gray-600`   | #4b5563 |
| Border         | `border-gray-200` | #e5e7eb |
| Background     | `bg-gray-50`      | #f9fafb |

## Implementation Guidelines

1. **Always use Tailwind utilities** - Avoid custom CSS unless absolutely necessary
2. **Follow Vue 3 Composition API** - Use `<script setup>` syntax
3. **Type everything** - Use TypeScript for all components
4. **Extract reusable components** - Create shared components in `packages/ui`
5. **Mobile-first** - Start with mobile layout, add breakpoints as needed
6. **Accessibility** - Use semantic HTML and ARIA labels where needed
