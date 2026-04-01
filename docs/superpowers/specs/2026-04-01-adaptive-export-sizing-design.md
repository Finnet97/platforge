# Adaptive Export Sizing & Pattern Fix

**Date:** 2026-04-01
**File:** `src/app/services/canvasExport.ts`
**Scope:** Canvas export renderer only — no UI/component changes

## Problem

1. Export uses fixed 128px tiles. Small grids (2x2) produce tiny images (~656px wide at 2x); large grids (10x10) produce oversized images (~2816px at 2x).
2. Pattern background draws solid `arc()` circles that look different from the CSS `radial-gradient` used in the preview.
3. Exported image doesn't visually match the on-screen preview proportions.

## Solution

### 1. Dynamic tile sizing targeting ~1080px logical width

Replace the fixed `TILE_SIZE = 128` constant with a computed tile size:

```
TARGET_WIDTH = 1080
tileSize = floor((TARGET_WIDTH - 2 * BASE_PADDING - (cols - 1) * spacing) / cols)
tileSize = clamp(tileSize, MIN_TILE = 64, MAX_TILE = 256)
```

The canvas width adjusts to the actual tile size (does not force 1080px if clamping changes the tile size).

**Expected results by grid size (spacing=8):**

| Grid | Raw tile | Clamped | Canvas width | Output @2x |
|------|----------|---------|--------------|------------|
| 2x2  | 504px    | 256px   | 584px        | 1168px     |
| 3x3  | 333px    | 256px   | 848px        | 1696px     |
| 4x4  | 248px    | 248px   | 1080px       | 2160px     |
| 5x5  | 197px    | 197px   | 1081px       | 2162px     |
| 6x6  | 163px    | 163px   | 1078px       | 2156px     |
| 10x10| 93px     | 93px    | 1066px       | 2132px     |

### 2. Proportional padding, spacing, and profile card

All spatial dimensions scale with the tile size to maintain preview proportions:

```
scale = tileSize / 128
exportPadding = round(32 * scale)
exportSpacing = round(spacing * scale)
```

Profile card dimensions also scale:
- Avatar size: `round(48 * scale)`
- Card height: `round(80 * scale)`
- Font sizes: scaled proportionally (e.g., `round(18 * scale)` for username)
- Section gaps and padding: all scaled by `scale`

Overlay badges already scale via the existing `ov` object — no change needed.

### 3. Pattern background matching CSS preview

Replace the current solid `arc()` loop with an OffscreenCanvas-based pattern that replicates the CSS `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)` at `16px 16px`:

```js
const patSize = Math.round(16 * scale);
const pat = new OffscreenCanvas(patSize, patSize);
const pctx = pat.getContext('2d');
const grad = pctx.createRadialGradient(center, center, 0, center, center, dotRadius);
grad.addColorStop(0, 'rgba(255,255,255,0.1)');
grad.addColorStop(1, 'transparent');
// Use ctx.createPattern(pat, 'repeat') to fill the background
```

The pattern tile scales with `scale` so dot density stays visually consistent across grid sizes.

### 4. Platform agnostic

`exportMosaicAsBlob()` receives identical params from `buildExportParams()` on both desktop and mobile. All changes are internal to `canvasExport.ts`. No changes to App.tsx, CenterCanvas.tsx, or any mobile components.

## Files Modified

| File | Change |
|------|--------|
| `src/app/services/canvasExport.ts` | Dynamic tile sizing, proportional scaling, pattern fix |

## Out of Scope

- No UI changes to export/share buttons or settings
- No changes to the preview renderer (CenterCanvas.tsx)
- No changes to image caching pipeline
- No changes to mobile drawer or desktop panel components
