# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlatForge is a PlayStation trophy gallery visualizer. It connects to the real PSN API and displays trophy collections in customizable grid layouts with configurable visual effects. It supports two auth modes: a **service account** (users just enter a PSN ID) and optional **user NPSSO** (for private profiles).

## Commands

- `npm run dev` — Start frontend (Vite on :5173) and backend (Express on :3001) concurrently
- `npm run dev:client` — Start only the Vite dev server
- `npm run dev:server` — Start only the Express backend (via `tsx watch`)
- `npm run build` — Production build (Vite)

No test framework is configured.

## Architecture

**Stack:** React 18 + TypeScript + Tailwind CSS v4 + Vite (ES modules) + Express 5 backend

### Frontend

**Entry flow:** `index.html` → `src/main.tsx` → `src/app/App.tsx`

**App.tsx** is the root component managing UI state via `useState` and props drilling. Key state includes `gridSize` ({rows, cols}), `spacing`, `sortBy` ('date'|'alpha'|'rarity'|'platform'|'speed'|'custom'), `customOrder` (number[] of trophy IDs for manual ordering), `profileStat` ('none'|'rarest'|'topPlatform'|'avgRarity'), and many visual toggles. It uses `useIsMobile()` (768px breakpoint) to conditionally render **desktop** or **mobile** layouts:

**Desktop layout (≥768px):** 3-column layout — TopBar + LeftPanel + CenterCanvas + RightPanel
- **TopBar** — Header with PSN ID search input, logo, action buttons (Export, Share, PSN auth). Templates, Year Review, Compare, and Save buttons are hidden (logic preserved for future use). Share uses Web Share API → clipboard fallback → download fallback. Progress bar only renders during active loading.
- **LeftPanel** — Settings controls (grid size, spacing, visual effects, sorting/filtering, profile stat selector). Collapsible via chevron toggle button on right edge. Scrollable (hidden scrollbar via Radix ScrollArea). Exports `SettingsContent` sub-component (shared with mobile drawer).
- **CenterCanvas** — Main trophy grid display with zoom and profile header. Contains `ProfileCard` sub-component. Accepts optional `isMobile`, `tileSize`, `onTileTap` props.
- **RightPanel** — Selected trophy detail view and drag-to-reorder mosaic tile list. Collapsible via chevron toggle button on left edge. Uses native scroll with `.scrollbar-hide`. Exports `TrophyDetailContent` and `MosaicTileList` sub-components (shared with mobile drawer).

**Mobile layout (<768px):** Canvas-first with bottom drawers — TopBar (2 rows) + CenterCanvas (full width) + drawers
- **TopBar (mobile)** — Row 1: logo + share/settings/overflow menu icons. Row 2: full-width search input with GO button. Overflow menu (MoreVertical) contains Export and PSN Auth.
- **CenterCanvas (mobile)** — Responsive tile sizing (`tileSize` computed from viewport width). No tooltips, no hover effects, no zoom controls. Tap on tile opens details drawer.
- **MobileSettingsDrawer** — Bottom drawer (vaul) wrapping `SettingsContent`. Opens via ⚙️ button. Snap points: 50%, 90%.
- **MobileDetailsDrawer** — Bottom drawer (vaul) wrapping `TrophyDetailContent` + `MosaicTileList`. Opens on tile tap. Snap points: 40% (preview), 85% (full + reorder).

**Modals:** `TemplatesModal`, `YearInReviewCard`, `CompareMode`, `AuthSettingsModal` are lazy-loaded via `React.lazy()` (currently hidden except AuthSettingsModal, logic preserved).

Both side panels (desktop) support collapse/expand with `isOpen`/`onToggle` props (state managed in App.tsx). Panels animate width between `w-80` and `w-0` with `transition-all duration-300 ease-in-out`. LeftPanel uses Radix ScrollArea; RightPanel uses native overflow scroll with `.scrollbar-hide`. CenterCanvas auto-expands via `flex-1`.

### Custom Sort / Drag-to-Reorder

**Sorting:** 6 sort modes — `date`, `alpha`, `rarity`, `platform`, `speed`, `custom`. Managed via `sortBy` state in App.tsx. The `processedTrophies` useMemo applies platform filter then sort.

**Custom order:** When the user drags a tile in the RightPanel list, `sortBy` automatically switches to `'custom'` and `customOrder` (array of trophy IDs) is updated. Selecting any predefined sort clears `customOrder`. Custom order resets when a new profile is loaded.

**Drag-and-drop:** Uses `react-dnd` (v16) with backend selection via `src/app/utils/dndBackend.ts` — `HTML5Backend` on desktop, `TouchBackend` (with 200ms delay) on mobile. `DndProvider` wraps the RightPanel scroll content (desktop) or `MobileDetailsDrawer` content (mobile). Each tile in the "Mosaic Tiles" list is a `DraggableTile` component with `useDrag`/`useDrop` hooks. The `GripVertical` icon is the drag handle. On hover-swap, `onReorder(fromIndex, toIndex)` is called, which updates `customOrder` in App.tsx and triggers a re-render of both the grid and the list.

**`src/app/components/ui/`** contains ~54 shadcn/ui components (Radix UI primitives + Tailwind). The `cn()` utility in `ui/utils.ts` merges classnames via clsx + tailwind-merge.

**`src/app/data/mockData.ts`** — Mock trophy and profile data used as initial state and fallback when not authenticated.

**`src/app/components/figma/ImageWithFallback.tsx`** — Image loading with SVG placeholder fallback.

### Grid & Mosaic System

**Grid sizes:** Presets 3×3 through 10×10 (`[3,4,5,6,7,8,10]`) plus "Auto" button with best-fit algorithm that finds the most compact rectangular grid (not necessarily square) for the trophy count, preferring squarish shapes. Grid uses fixed-size columns (`gridTemplateColumns: repeat(cols, ${tileSize}px)`) — not `1fr` — so tiles are always perfectly aligned. Desktop tile size is 128px; on mobile, tile size is computed responsively: `Math.floor((viewportWidth - padding - gaps) / cols)` with a 48px minimum. When the last row has fewer tiles than columns, it renders as a centered flexbox row instead of left-aligned grid cells. The mosaic wrapper uses `inline-flex flex-col` to shrink-wrap its content.

**Image capture:** `captureMosaicBlob()` in App.tsx is a reusable function that captures the mosaic as a PNG Blob (handles cross-origin image proxying, scale reset, and source restoration). Used by both Export (download) and Share (Web Share API / clipboard). A simple toast notification system (`toastMessage` state + 3s auto-dismiss) provides feedback for clipboard copies.

**ProfileCard** (`CenterCanvas.tsx`): Compact, self-centering card (`self-center`) below the grid. Shows avatar + username/level + platinum count + optional configurable stat (rarest %, top platform, avg rarity, or none). The configurable stat is controlled by `profileStat` state in App.tsx and selectable via "Extra Stat" dropdown in LeftPanel (visible only when "Show Header" is on).

### Backend

**Entry point:** `server/index.ts` — Express app on port 3001 (configurable via `PORT` env var)

**Middleware:** `cors` (allows `localhost:5173`), `express.json()`

**File structure:**
- `server/routes/auth.ts` — Authentication endpoints
- `server/routes/profile.ts` — User profile + trophy data
- `server/routes/trophies.ts` — Individual trophy rarity
- `server/services/psn.ts` — PSN API wrapper (auth, search, data fetching)
- `server/services/browser-auth.ts` — Legacy stubs (disabled, throws errors)
- `server/utils/transform.ts` — PSN data → PlatForge data transformation

### Frontend ↔ Backend Communication

- Vite dev server proxies `/api` → `http://localhost:3001` (configured in `vite.config.ts`)
- `src/app/services/api.ts` exports `fetchJson<T>(path)` and `postJson<T>(path, body)` — all paths start with `/api`
- `src/app/context/PsnDataContext.tsx` is the React context that manages all PSN state and exposes: `submitNpsso`, `loadProfile`, `logout`, `checkAuth`, `canSearch`, `serviceAvailable`

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/npsso` | Submit user NPSSO token to authenticate |
| GET | `/api/auth/status` | Check if user is authenticated: `{ authenticated: boolean }` |
| GET | `/api/auth/service-status` | Check if service account is available: `{ available: boolean }` |
| POST | `/api/auth/logout` | Clear user auth tokens |
| GET | `/api/profile/:username` | Search user, fetch profile + platinum titles |
| GET | `/api/trophies/:accountId/:npCommunicationId/rarity` | Fetch platinum rarity for a specific title |
| GET | `/api/image-proxy?url=...` | Proxy external images to bypass CORS for export |

Legacy endpoints (`/api/auth/login`, `/api/auth/verify-2fa`, `/api/auth/cancel-2fa`) exist but throw errors — Sony's Akamai anti-bot blocks automated browser login.

## PSN API Integration

**Package:** `psn-api` (CJS — loaded via dynamic `import()` for ESM compatibility)

**Dual auth model (`server/services/psn.ts`):**

| Layer | Purpose | Token Source |
|-------|---------|-------------|
| **Service account** | Default — fetches public trophy data for any user | `SERVICE_NPSSO` env var |
| **User NPSSO** | Optional — accesses private profiles | User-provided via UI |

**Auth resolution:** `getAuth()` prefers user auth if available, falls back to service auth. All data functions (`searchUser`, `fetchProfile`, `fetchPlatinumTitles`, `fetchPlatinumRarity`) call `getAuth()` internally — no auth selection needed in routes.

**Service account flow:**
1. `SERVICE_NPSSO` env var is read on server startup via `initServiceAuth()` (non-blocking)
2. Token exchanged for access/refresh tokens, auto-refreshes with 30s expiry buffer
3. If not set or invalid, server starts with warning — public mode unavailable

**User auth flow (optional):**
1. User obtains NPSSO token from `https://ca.account.sony.com/api/v1/ssocookie`
2. Frontend sends token to `POST /api/auth/npsso`
3. Backend: `exchangeNpssoForAccessCode(npsso)` → `exchangeAccessCodeForAuthTokens(accessCode)`
4. Tokens stored in memory (lost on server restart)

**User search:** `searchUser()` first tries `getProfileFromUserName()` (legacy API, handles special chars like underscores), then falls back to `makeUniversalSearch()` with exact match validation.

**Data loading flow:**
1. `GET /api/profile/:username` → searches user, fetches profile + all platinum titles (paginated, limit 800)
2. Frontend progressively loads rarity and platinum trophy icon URLs in batches of 3 with 200ms delays to avoid PSN rate limiting. Each batch calls both `getUserTrophiesEarnedForTitle` (rarity) and `getTitleTrophies` (trophy icon) in parallel via `Promise.all`.
3. Uses `Promise.allSettled()` for graceful individual failures
4. `AbortController` enables cancellation of in-progress loads

**Important:** All auth tokens are in-memory only. Service account re-authenticates on restart from `SERVICE_NPSSO`. User auth requires re-submission after restart.

## Key Data Types

**`Trophy`** (frontend, defined in `src/app/data/mockData.ts`): id, gameTitle, platform (PS3/PS4/PS5/Vita/PSVR), dateEarned, rarity, timeToPlatinum, order, imageUrl, trophyImageUrl (optional — platinum trophy icon, loaded progressively).

**`Profile`** (frontend, defined in `src/app/context/PsnDataContext.tsx`): username, psnLevel, totalPlatinums, avatar, rarestPlatinum (`Trophy | null`).

**`PlatForgeTrophy`** (backend, defined in `server/utils/transform.ts`): extends Trophy with npCommunicationId, npServiceName ("trophy" | "trophy2"), rarityLoaded.

**`PlatForgeProfile`** (backend): username, psnLevel, totalPlatinums, avatar, rarestPlatinum (`PlatForgeTrophy | null`).

## Styling

- Tailwind CSS v4 via `@tailwindcss/vite` plugin (no separate PostCSS config needed)
- Design tokens as CSS custom properties in `src/styles/theme.css`
- Dark theme by default with oklch() color values
- Fonts: Inter (UI), Orbitron (logo/headings), Rajdhani (numbers/mono) — loaded from Google Fonts in `src/styles/fonts.css`
- Gold accent `#FFD700` for trophy-related elements
- Background colors: `#0A0E1A` (deep), `#0D1221` (panels), `#12172A` (cards)
- Border color: `#1E2740`
- Muted text: `#8A9BB8`

## Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

## TypeScript Configuration

- **Frontend** (`tsconfig.json`): target ES2020, module ESNext, jsx react-jsx, strict mode, no emit
- **Backend** (`tsconfig.server.json`): target ES2020, module ESNext, esModuleInterop, strict mode, rootDir `./server`, outDir `./dist-server`

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SERVICE_NPSSO` | No (but needed for public mode) | PSN service account NPSSO token — enables search without user auth |
| `PORT` | No (default: 3001) | Server port |

See `.env.example` for setup instructions.

## Responsive Design

**Breakpoint:** Single at 768px via `useIsMobile()` hook (`src/app/components/ui/use-mobile.ts`).

**Mobile components:**
- `src/app/components/MobileSettingsDrawer.tsx` — vaul drawer wrapping `SettingsContent`
- `src/app/components/MobileDetailsDrawer.tsx` — vaul drawer wrapping `TrophyDetailContent` + `MosaicTileList`
- `src/app/utils/dndBackend.ts` — Backend selector for react-dnd (HTML5 vs Touch)

**Shared sub-components** (used by both desktop panels and mobile drawers):
- `SettingsContent` (exported from `LeftPanel.tsx`) — all settings controls without scroll wrapper
- `TrophyDetailContent` (exported from `RightPanel.tsx`) — trophy detail card
- `MosaicTileList` (exported from `RightPanel.tsx`) — draggable tile list (expects `DndProvider` parent)

**PWA:** `public/manifest.json` enables "Add to Home Screen". Meta tags for SEO/social sharing in `index.html`.

## Production Build

- `vite-plugin-compression` generates gzip + brotli pre-compressed assets
- Modals are lazy-loaded via `React.lazy()` (code-split into separate chunks)
- Asset hashing enabled for cache busting

## Known Constraints

- `psn-api` is a CJS package — must use dynamic `import()` wrapper (`getPsnApi()` in `server/services/psn.ts`)
- Sony's Akamai WAF blocks all automated browser login attempts — only NPSSO manual token auth works
- Sony does not offer public OAuth for third-party apps — service account pattern is the industry workaround
- `makeUniversalSearch` doesn't find usernames with special characters (underscores) reliably — that's why `getProfileFromUserName` is tried first
- No persistent storage — auth tokens and user data exist only in server memory
- Service account can only access public trophy data — Sony's API enforces privacy settings server-side
- `timeToPlatinum` field is always `"--"` (placeholder) — PSN API doesn't provide this data
- Mock data is used as initial/fallback state; it's displayed when no profile is loaded
- `SERVICE_NPSSO` refresh token chain can break after extended downtime — requires manual renewal
- Export (`html-to-image`) requires the image proxy (`/api/image-proxy`) to convert cross-origin images to data URLs before canvas capture
