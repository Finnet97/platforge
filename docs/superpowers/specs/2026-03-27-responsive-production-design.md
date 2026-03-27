# PlatForge — Responsive + Production Ready

## Context

PlatForge is a desktop-only PlayStation trophy gallery visualizer. The app has a 3-column layout (LeftPanel + CenterCanvas + RightPanel) with fixed 128px tiles, no responsive breakpoints, and no mobile navigation. The goal is to make it fully usable on mobile phones and tablets while preparing the build for production deployment. The mobile components should be modular enough to reuse in a potential native app in the future.

## Decisions Made

| Question | Decision |
|----------|----------|
| Mobile layout strategy | **Canvas-First + Drawers** — grid always visible, settings/details as bottom drawers |
| Breakpoint | **Single at 768px** — mobile vs desktop, using existing `useIsMobile` hook |
| Drag-to-reorder on mobile | **TouchBackend** — install `react-dnd-touch-backend`, swap backend by device |
| Tile sizing on mobile | **Responsive** — calculate tile size from viewport width, cols, padding, gaps |
| TopBar on mobile | **Two rows** — row 1: logo + action icons, row 2: full-width search input with GO button |

## Design

### 1. Layout Detection

- Use existing `useIsMobile()` hook (768px breakpoint) from `src/app/components/ui/use-mobile.ts`
- In `App.tsx`, conditionally render mobile or desktop layout based on this hook
- Desktop layout remains unchanged

### 2. Mobile TopBar (2 rows)

**Row 1:** Trophy icon + "PlatForge" text (left) | Share button + Settings button (⚙️, opens settings drawer) + Overflow menu (⋮, contains Export + Auth) (right)

**Row 2:** Full-width search input with integrated GO button. Submit via Enter key or GO tap.

**Progress bar:** Renders below TopBar, same as desktop.

### 3. Mobile CenterCanvas

**Responsive tile sizing:**
- Formula: `tileSize = Math.floor((viewportWidth - 2*padding - (cols-1)*spacing) / cols)`
- Minimum tile size: 48px
- Auto-fit algorithm should factor in mobile viewport width when choosing columns
- Grid uses `gridTemplateColumns: repeat(cols, ${tileSize}px)` dynamically

**Interactions:**
- Tap on tile → opens Details drawer (RightPanel content)
- Zoom controls simplified or hidden on mobile (grid auto-fits)
- Tooltips disabled on mobile (no hover)

**ProfileCard:** Responsive width, smaller avatar (8x8 instead of 12x12), reduced font sizes.

### 4. Settings Drawer (LeftPanel → vaul Drawer)

- New component: `MobileSettingsDrawer.tsx`
- Uses `vaul` (Drawer component, already installed)
- Opens from bottom via ⚙️ button in TopBar
- Content: Extract LeftPanel's control sections into a shared `SettingsContent` component used by both LeftPanel (desktop) and MobileSettingsDrawer (mobile)
- Snap points: `[0.5, 0.9]` (50% and 90% of screen height)
- Drag handle visible at top for swipe-to-close

### 5. Details Drawer (RightPanel → vaul Drawer)

- New component: `MobileDetailsDrawer.tsx`
- Opens automatically when a tile is tapped
- Content: Extract RightPanel's detail view and mosaic tile list into shared components
- Snap points: `[0.4, 0.85]` (40% preview, 85% full with reorder list)
- At 40% snap: shows trophy image + title + platform + rarity + bar
- At 85% snap: adds mosaic tiles list with drag-to-reorder

### 6. Touch Drag-to-Reorder

- Install `react-dnd-touch-backend`
- Create a backend selector utility:
  ```
  const getDndBackend = () => isMobile ? TouchBackend : HTML5Backend
  const getDndOptions = () => isMobile ? { delay: 200 } : undefined
  ```
- `DndProvider` uses the selected backend
- Touch delay of 200ms prevents conflict with scroll
- Grip handle tap target: 44px minimum on mobile (WCAG touch target)

### 7. Production Build Optimizations

**Code splitting:**
- Lazy load modals: `TemplatesModal`, `YearInReviewCard`, `CompareMode`, `AuthSettingsModal`
- Use `React.lazy()` + `Suspense`

**Compression:**
- Add `vite-plugin-compression` for gzip and brotli pre-compression

**Meta tags (index.html):**
- `<meta name="description">` for SEO
- Open Graph tags: `og:title`, `og:description`, `og:image`
- `<meta name="theme-color" content="#0A0E1A">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`

**PWA manifest:**
- New `manifest.json` with app name, icons, theme color, display standalone
- Link from `index.html`
- Enables "Add to Home Screen" on mobile browsers

**Image optimization:**
- Add explicit `width` and `height` attributes to images to prevent CLS
- Already using image proxy for cross-origin

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/App.tsx` | Import `useIsMobile`, conditional layout rendering, lazy load modals, pass drawer state |
| `src/app/components/TopBar.tsx` | Accept `isMobile` prop, render 2-row layout on mobile, overflow menu |
| `src/app/components/CenterCanvas.tsx` | Accept `isMobile` + `tileSize` props, responsive grid, tap handler, disable tooltips on mobile |
| `src/app/components/LeftPanel.tsx` | Extract settings content into `SettingsContent` sub-component |
| `src/app/components/RightPanel.tsx` | Extract detail/reorder content into shared sub-components |
| **New:** `src/app/components/MobileSettingsDrawer.tsx` | Vaul drawer wrapping SettingsContent |
| **New:** `src/app/components/MobileDetailsDrawer.tsx` | Vaul drawer wrapping detail + reorder content |
| **New:** `src/app/utils/dndBackend.ts` | Backend selector utility for react-dnd |
| `vite.config.ts` | Add compression plugin, build optimizations |
| `index.html` | Meta tags, manifest link, theme-color |
| **New:** `public/manifest.json` | PWA manifest |
| `package.json` | Add `react-dnd-touch-backend`, `vite-plugin-compression` |
| `.gitignore` | Add `.superpowers/` |

## Verification

1. **Mobile layout:** Open dev tools, toggle device toolbar to iPhone 14 (390px) and iPad (768px). Verify:
   - < 768px: TopBar 2 rows, canvas full width, no side panels visible
   - ≥ 768px: Original 3-column layout intact
2. **Settings drawer:** Tap ⚙️ → drawer opens from bottom. All controls functional. Swipe down to close.
3. **Details drawer:** Tap a tile → drawer opens with trophy details. Swipe up to expand to reorder list.
4. **Drag-to-reorder (mobile):** Long-press (200ms) on grip handle → drag to reorder. Scroll should not conflict.
5. **Responsive tiles:** Change grid size (3×3 through 10×10). Tiles should resize to fit viewport width.
6. **Export/Share:** Both should work identically on mobile (export captures at full quality regardless of display size).
7. **Production build:** Run `npm run build`. Check dist output for gzip/brotli files. Verify lazy-loaded chunks exist.
8. **PWA:** Open on mobile Safari/Chrome. "Add to Home Screen" should be available. App opens in standalone mode.
9. **Desktop regression:** Full test of desktop layout — all panels, drag-to-reorder, zoom, export, share still work.
