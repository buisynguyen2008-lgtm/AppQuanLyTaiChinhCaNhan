# MoneyLover App Architecture

This document gives you a mental model of the codebase: how it is structured, how state flows, and where to add features safely.

## Overview

- Cross-platform React Native app (Android/iOS)
- Navigation: Bottom Tabs + Native Stack
- State management: Zustand with AsyncStorage persistence
- Theming and UI primitives under `styles/` and `components/`
- Charts with robust fallbacks to avoid runtime crashes
- Settings with PIN (deferred enabling) and data backup/restore (JSON)
- Onboarding walkthrough (shown once via settings.seenOnboarding)

```
src/
  components/        # Reusable UI (buttons, cards, icons, charts wrappers)
  hooks/             # Shared hooks (animations, selectors, debounce, stats)
  models/            # Typescript models/types
  navigation/        # Root and stack/tab navigators
  screens/           # Feature screens; feature folders for complex screens
    settings/        # SettingsScreen + sections (Security, Categories, Data)
    onboarding/      # WalkthroughScreen
  services/          # Backup service (export/import JSON)
  store/             # Zustand store (single source of truth)
  styles/            # Theme tokens (colors, typography, shadows)
  types/             # Additional TS types
  utils/             # Formatting and helpers
```

## State management (Zustand)

File: `src/store/index.ts`

- Shape: `FinanceState` contains transactions, categories, budgets, goals, settings, and a few UI flags.
- Persistence: `persist` middleware with `AsyncStorage`. Only a subset is saved (see `partialize`).
- Category rules:
  - Default categories (`custom=false`) cannot be edited or removed.
  - Custom categories (`custom=true`) can be edited/removed.
  - When a category is removed/reset, transactions referencing it are remapped to `cat_other`.
- Settings:
  - `seenOnboarding`: gate for onboarding walkthrough (true → skip Onboarding on subsequent launches)
  - `pinEnabled`, `pinCode`
- Selectors: see `selectors` export for helpers like grouping expenses by category.

## Navigation

File: `src/navigation/RootNavigator.tsx`

- Root Stack:
  - `Onboarding` (Walkthrough) → `Tabs` → `Budget`, `Goals`
  - Initial route decided by `settings.seenOnboarding` from the store
- Tabs:
  - Dashboard, Transactions (stack), Statistics, Settings
  - Transactions tab shows a badge with today’s count; active tab has an indicator

## UI and Theming

- Tokens under `styles/theme` (colors, typography, shadows, border radius)
- Common primitives in `components/` (e.g., `layout/AppHeader.tsx`, `ui/Button.tsx`, `ui/Card.tsx`)
- Keep feature-specific mini-components next to their screen; share reusable ones via `components/`

## Charts

- Pie/Donut and Bar charts are wrapped to prefer the composable API when available and fall back to SVG to avoid crashes.
- Legends are built using basic React Native views for reliability.

## Settings

- `screens/settings/` is broken into sections:
  - `SecuritySection`: PIN with deferred enabling flow
    - Toggle ON shows inputs first; only on Save do we set `{ pinCode, pinEnabled: true }`.
    - Toggle OFF clears both `pinEnabled` and `pinCode`.
  - `CategoryManagementSection`: Default categories locked; custom categories only; reset to defaults available.
  - `DataManagementSection`: CSV export (basic) and JSON backup/restore.

## Backup/Restore (JSON)

File: `src/services/backup.ts`

- `exportToJson()`: serializes `{ version, date, data }` where `data` includes transactions, categories, budgets, goals, and settings.
- `copyJsonToClipboard()`: convenience wrapper to copy JSON to the clipboard.
- `importFromJson(json)`: validates payload and safely restores:
  - If backup has no categories: use default categories
  - Transactions referencing missing categories → remap to `cat_other`

## Onboarding

File: `src/screens/onboarding/WalkthroughScreen.tsx`

- A simple 3-slide FlatList with paging.
- `Skip`/`Done` sets `settings.seenOnboarding = true` and navigates to `Tabs`.
- Controlled by `initialRouteName` in RootNavigator.

## Running locally

- Use the existing scripts in `package.json` (Metro, Android, iOS) via your package manager.
- Ensure pods are installed for iOS.

## Adding a new screen quickly

1. Create your screen under `src/screens/<feature>/YourScreen.tsx`.
2. Export with `index.ts` for cleaner imports (optional).
3. Register it in the navigator (stack or tabs) inside `src/navigation`.
4. If it needs state, add actions/selectors to `src/store/index.ts`; only persist what you need.

## Conventions

- Keep feature-specific components close to the screen; move reusable ones to `components/`.
- Avoid inline styles if linting prohibits; prefer `StyleSheet.create`.
- Keep actions pure and safe: remap foreign references (`cat_other`) when deleting entities.
- Prefer defensive rendering for third-party charts/components to avoid runtime crashes.
