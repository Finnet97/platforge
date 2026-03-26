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

**App.tsx** is the root component managing UI state via `useState` and props drilling. It renders a 7-panel layout:
- **TopBar** — Header with PSN ID search input, logo, action buttons. Progress bar only renders during active loading.
- **LeftPanel** — Settings controls (grid size, layout, spacing, visual effects). Collapsible via chevron toggle button on right edge.
- **CenterCanvas** — Main trophy grid display with zoom and profile header
- **RightPanel** — Selected trophy detail view and tile list. Collapsible via chevron toggle button on left edge.
- **TemplatesModal, YearInReviewCard, CompareMode** — Modal overlays

Both side panels support collapse/expand with `isOpen`/`onToggle` props (state managed in App.tsx). Panels animate width between `w-80` and `w-0` with CSS transitions. CenterCanvas auto-expands via `flex-1`.

**`src/app/components/ui/`** contains ~54 shadcn/ui components (Radix UI primitives + Tailwind). The `cn()` utility in `ui/utils.ts` merges classnames via clsx + tailwind-merge.

**`src/app/data/mockData.ts`** — Mock trophy and profile data used as initial state and fallback when not authenticated.

**`src/app/components/figma/ImageWithFallback.tsx`** — Image loading with SVG placeholder fallback.

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
