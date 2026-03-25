# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlatForge is a PlayStation trophy gallery visualizer built as a Figma Make file. It displays PSN trophy collections in customizable grid layouts with configurable visual effects.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build

No test framework is configured.

## Architecture

**Stack:** React 18 + TypeScript + Tailwind CSS v4 + Vite (ES modules)

**Entry flow:** `index.html` → `src/main.tsx` → `src/app/App.tsx`

**App.tsx** is the root component managing all application state via `useState` and props drilling. It renders a 7-panel layout:
- **TopBar** — Header with search, logo, action buttons
- **LeftPanel** — Settings controls (grid size, layout, spacing, visual effects)
- **CenterCanvas** — Main trophy grid display with zoom
- **RightPanel** — Selected trophy detail view
- **TemplatesModal, YearInReviewCard, CompareMode** — Modal overlays

**`src/app/components/ui/`** contains ~54 shadcn/ui components (Radix UI primitives + Tailwind). The `cn()` utility in `ui/utils.ts` merges classnames via clsx + tailwind-merge.

**`src/app/data/mockData.ts`** has all trophy and profile mock data (no backend).

**`src/app/components/figma/ImageWithFallback.tsx`** handles image loading with SVG placeholder fallback.

## Styling

- Tailwind CSS v4 via `@tailwindcss/vite` plugin (no separate PostCSS config needed)
- Design tokens as CSS custom properties in `src/styles/theme.css`
- Dark theme by default with oklch() color values
- Fonts: Inter (UI), Orbitron (logo/headings), Rajdhani (mono) — loaded from Google Fonts in `src/styles/fonts.css`
- Gold accent (#FFD700) for trophy-related elements

## Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

## Key Data Types

The main data model is `Trophy` with fields: id, gameTitle, platform (PS3/PS4/PS5/Vita/PSVR), dateEarned, rarity, timeToPlatinum, order, imageUrl. `Profile` contains user info and references a `rarestPlatinum` trophy.
