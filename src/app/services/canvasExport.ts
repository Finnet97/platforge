/**
 * Canvas 2D mosaic renderer — replaces html-to-image for reliable export
 * on all platforms including mobile Safari/WebKit.
 */

import type { Trophy } from '../data/mockData';
import type { Profile } from '../context/PsnDataContext';
import { imageCache } from './imageCache';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverlaySettings {
  showOrder: boolean;
  showGameName: boolean;
  showDate: boolean;
  showRarity: boolean;
  showPlatformIcon: boolean;
  showMilestones: boolean;
  showRarestBadge: boolean;
}

export interface CanvasExportParams {
  trophies: Trophy[];
  gridSize: { rows: number; cols: number };
  spacing: number;
  borderRadius: number;
  showBorders: boolean;
  showGlow: boolean;
  showProfile: boolean;
  profileStat: 'none' | 'rarest' | 'topPlatform' | 'avgRarity';
  overlays: OverlaySettings;
  bgType: 'solid' | 'gradient' | 'pattern' | 'transparent';
  bgColor: string;
  showGlassmorphism: boolean;
  showRarityHeatmap: boolean;
  useTrophyImage: boolean;
  profile: Profile;
  pixelRatio: number;
  format: 'png' | 'jpeg';
  quality?: number;
}

interface TilePos { x: number; y: number; }

interface Layout {
  tileSize: number;
  padding: number;
  gridOriginX: number;
  gridOriginY: number;
  tiles: TilePos[];
  profileCardY: number;
  canvasWidth: number;
  canvasHeight: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TILE_SIZE = 128;
const PADDING = 32;
const PROFILE_CARD_HEIGHT_DESKTOP = 80;
const PROFILE_CARD_MARGIN_TOP = 32;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const srcAspect = img.naturalWidth / img.naturalHeight;
  const dstAspect = w / h;
  let sx: number, sy: number, sw: number, sh: number;
  if (srcAspect > dstAspect) {
    sh = img.naturalHeight;
    sw = sh * dstAspect;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / dstAspect;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function getRarityColor(rarity: number): string {
  if (rarity < 1) return '#FF4444';
  if (rarity < 5) return '#FF8844';
  if (rarity < 15) return '#FFD700';
  if (rarity < 30) return '#88DD88';
  return '#8A9BB8';
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    return img;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Icon drawing helpers (approximate Lucide shapes)
// ---------------------------------------------------------------------------

function drawGamepadIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size / 8);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Body — rounded rect
  roundRectPath(ctx, cx - s * 0.8, cy - s * 0.45, s * 1.6, s * 0.9, s * 0.25);
  ctx.stroke();
  // Left stick
  ctx.beginPath();
  ctx.arc(cx - s * 0.35, cy, s * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  // Right stick
  ctx.beginPath();
  ctx.arc(cx + s * 0.35, cy, s * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const s = size / 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const outerX = cx + s * Math.cos(angle);
    const outerY = cy + s * Math.sin(angle);
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    const innerAngle = angle + Math.PI / 5;
    ctx.lineTo(cx + s * 0.4 * Math.cos(innerAngle), cy + s * 0.4 * Math.sin(innerAngle));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrownIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const s = size / 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.7, cy + s * 0.5);
  ctx.lineTo(cx - s * 0.7, cy - s * 0.1);
  ctx.lineTo(cx - s * 0.35, cy + s * 0.15);
  ctx.lineTo(cx, cy - s * 0.5);
  ctx.lineTo(cx + s * 0.35, cy + s * 0.15);
  ctx.lineTo(cx + s * 0.7, cy - s * 0.1);
  ctx.lineTo(cx + s * 0.7, cy + s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCalendarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size / 8);
  ctx.lineCap = 'round';
  roundRectPath(ctx, cx - s * 0.7, cy - s * 0.5, s * 1.4, s * 1.2, s * 0.15);
  ctx.stroke();
  // Top pegs
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy - s * 0.7);
  ctx.lineTo(cx - s * 0.3, cy - s * 0.4);
  ctx.moveTo(cx + s * 0.3, cy - s * 0.7);
  ctx.lineTo(cx + s * 0.3, cy - s * 0.4);
  ctx.stroke();
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.7, cy - s * 0.15);
  ctx.lineTo(cx + s * 0.7, cy - s * 0.15);
  ctx.stroke();
  ctx.restore();
}

function drawTrophyIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, size / 8);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Cup body
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.4, cy - s * 0.6);
  ctx.lineTo(cx - s * 0.35, cy + s * 0.05);
  ctx.quadraticCurveTo(cx, cy + s * 0.3, cx + s * 0.35, cy + s * 0.05);
  ctx.lineTo(cx + s * 0.4, cy - s * 0.6);
  ctx.stroke();
  // Base
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy + s * 0.6);
  ctx.lineTo(cx + s * 0.3, cy + s * 0.6);
  ctx.stroke();
  // Stem
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.25);
  ctx.lineTo(cx, cy + s * 0.6);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Badge drawing
// ---------------------------------------------------------------------------

function drawBadgePill(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string,
  opts: {
    font: string;
    textColor: string;
    bgColor?: string;
    borderColor?: string;
    padX: number;
    padY: number;
    align: 'left' | 'right';
    icon?: (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) => void;
    iconSize?: number;
    iconColor?: string;
  },
) {
  ctx.save();
  ctx.font = opts.font;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const iconW = opts.icon ? (opts.iconSize ?? 10) + 3 : 0;
  const totalW = opts.padX * 2 + textW + iconW;
  const height = opts.padY * 2 + parseInt(opts.font) * 1.2;

  const bx = opts.align === 'left' ? x : x - totalW;
  const by = y;

  // Background
  if (opts.bgColor) {
    ctx.fillStyle = opts.bgColor;
    roundRectPath(ctx, bx, by, totalW, height, height / 2);
    ctx.fill();
  }

  // Border
  if (opts.borderColor) {
    ctx.strokeStyle = opts.borderColor;
    ctx.lineWidth = 1;
    roundRectPath(ctx, bx, by, totalW, height, height / 2);
    ctx.stroke();
  }

  // Icon
  let textX = bx + opts.padX;
  if (opts.icon) {
    const iconS = opts.iconSize ?? 10;
    opts.icon(ctx, textX + iconS / 2, by + height / 2, iconS, opts.iconColor ?? opts.textColor);
    textX += iconS + 3;
  }

  // Text
  ctx.fillStyle = opts.textColor;
  ctx.font = opts.font;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, textX, by + height / 2);

  ctx.restore();
  return { width: totalW, height };
}

// ---------------------------------------------------------------------------
// Layout computation
// ---------------------------------------------------------------------------

function computeLayout(params: CanvasExportParams): Layout {
  const { trophies, gridSize, spacing } = params;
  const tileSize = TILE_SIZE;
  const padding = PADDING;
  const cols = gridSize.cols;
  const count = trophies.length;

  const gridWidth = cols * tileSize + (cols - 1) * spacing;

  // Compute tile positions
  const tiles: TilePos[] = [];
  const fullRows = Math.floor(count / cols);
  const lastRowCount = count % cols;

  for (let i = 0; i < fullRows * cols; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    tiles.push({
      x: padding + col * (tileSize + spacing),
      y: padding + row * (tileSize + spacing),
    });
  }

  // Last incomplete row — centered
  if (lastRowCount > 0) {
    const lastRowWidth = lastRowCount * tileSize + (lastRowCount - 1) * spacing;
    const offsetX = padding + (gridWidth - lastRowWidth) / 2;
    const rowY = padding + fullRows * (tileSize + spacing);
    for (let i = 0; i < lastRowCount; i++) {
      tiles.push({
        x: offsetX + i * (tileSize + spacing),
        y: rowY,
      });
    }
  }

  const totalRows = lastRowCount > 0 ? fullRows + 1 : fullRows;
  const gridHeight = totalRows * tileSize + (totalRows - 1) * spacing;

  // Profile card
  let profileCardY = 0;
  let profileHeight = 0;
  if (params.showProfile) {
    profileCardY = padding + gridHeight + PROFILE_CARD_MARGIN_TOP;
    profileHeight = PROFILE_CARD_HEIGHT_DESKTOP + PROFILE_CARD_MARGIN_TOP;
  }

  const canvasWidth = padding * 2 + gridWidth;
  const canvasHeight = padding * 2 + gridHeight + profileHeight;

  return {
    tileSize, padding, gridOriginX: padding, gridOriginY: padding,
    tiles, profileCardY, canvasWidth, canvasHeight,
  };
}

// ---------------------------------------------------------------------------
// Drawing: background
// ---------------------------------------------------------------------------

function drawBackground(
  ctx: CanvasRenderingContext2D, w: number, h: number, params: CanvasExportParams,
) {
  ctx.save();
  roundRectPath(ctx, 0, 0, w, h, 16);
  ctx.clip();

  const { bgType, bgColor } = params;

  if (bgType === 'solid') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  } else if (bgType === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, bgColor + '00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (bgType === 'pattern') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let py = 0; py < h; py += 16) {
      for (let px = 0; px < w; px += 16) {
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bgType === 'transparent') {
    // For JPEG, fill with fallback; for PNG, leave transparent (handled at canvas level)
    if (params.format === 'jpeg') {
      ctx.fillStyle = '#0A0E1A';
      ctx.fillRect(0, 0, w, h);
    }
    // Otherwise leave transparent for PNG
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Drawing: single tile
// ---------------------------------------------------------------------------

function drawTile(
  ctx: CanvasRenderingContext2D,
  trophy: Trophy,
  x: number, y: number,
  tileSize: number,
  params: CanvasExportParams,
  imageMap: Map<string, HTMLImageElement>,
  rarestId: number | null,
) {
  const { borderRadius, showBorders, showGlassmorphism, showRarityHeatmap, overlays } = params;
  const radius = (borderRadius / 100) * tileSize;
  const imgSrc = params.useTrophyImage && trophy.trophyImageUrl ? trophy.trophyImageUrl : trophy.imageUrl;

  // --- Tile image ---
  ctx.save();
  roundRectPath(ctx, x, y, tileSize, tileSize, radius);
  ctx.clip();

  const img = imageMap.get(imgSrc);
  if (img) {
    drawImageCover(ctx, img, x, y, tileSize, tileSize);
  } else {
    ctx.fillStyle = '#12172A';
    ctx.fillRect(x, y, tileSize, tileSize);
  }

  // Glassmorphism overlay
  if (showGlassmorphism) {
    const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
    grad.addColorStop(0, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, tileSize, tileSize);
  }

  ctx.restore();

  // --- Borders ---
  if (showRarityHeatmap) {
    ctx.save();
    const c = getRarityColor(trophy.rarity);
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    roundRectPath(ctx, x + 1, y + 1, tileSize - 2, tileSize - 2, radius);
    ctx.stroke();
    // Glow
    ctx.shadowColor = c + '60';
    ctx.shadowBlur = 15;
    roundRectPath(ctx, x + 1, y + 1, tileSize - 2, tileSize - 2, radius);
    ctx.stroke();
    ctx.restore();
  } else if (showBorders) {
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    roundRectPath(ctx, x + 1, y + 1, tileSize - 2, tileSize - 2, radius);
    ctx.stroke();
    ctx.restore();
  }

  // --- Overlay scale (matches CenterCanvas.tsx ov object) ---
  const scale = tileSize / 128;
  const ov = {
    inset: Math.max(2, Math.round(8 * scale)),
    padX: Math.max(3, Math.round(8 * scale)),
    padY: Math.max(1, Math.round(4 * scale)),
    fontSize: Math.max(7, Math.round(12 * scale)),
    fontSizeSm: Math.max(6, Math.round(9 * scale)),
    badgeSize: Math.max(14, Math.round(28 * scale)),
    badgeSizeSm: Math.max(12, Math.round(24 * scale)),
    iconSize: Math.max(8, Math.round(16 * scale)),
    iconSizeSm: Math.max(7, Math.round(14 * scale)),
    calIcon: Math.max(6, Math.round(10 * scale)),
    stackOffset: Math.max(16, Math.round(32 * scale)),
  };

  // --- Order badge (top-left) ---
  if (overlays.showOrder) {
    drawBadgePill(ctx, x + ov.inset, y + ov.inset, `#${trophy.order}`, {
      font: `700 ${ov.fontSize}px Rajdhani, sans-serif`,
      textColor: '#FFD700',
      bgColor: 'rgba(0,0,0,0.75)',
      borderColor: 'rgba(255,215,0,0.3)',
      padX: ov.padX,
      padY: ov.padY,
      align: 'left',
    });
  }

  // --- Rarity badge (top-right) ---
  if (overlays.showRarity) {
    drawBadgePill(ctx, x + tileSize - ov.inset, y + ov.inset, `${trophy.rarity}%`, {
      font: `700 ${ov.fontSize}px Rajdhani, sans-serif`,
      textColor: '#FFD700',
      bgColor: 'rgba(0,0,0,0.75)',
      borderColor: 'rgba(255,215,0,0.3)',
      padX: ov.padX,
      padY: ov.padY,
      align: 'right',
    });
  }

  // --- Platform badge (bottom-right circle) ---
  if (overlays.showPlatformIcon) {
    const bx = x + tileSize - ov.inset - ov.badgeSize;
    const by = y + tileSize - ov.inset - ov.badgeSize;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    roundRectPath(ctx, bx, by, ov.badgeSize, ov.badgeSize, ov.badgeSize / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, bx, by, ov.badgeSize, ov.badgeSize, ov.badgeSize / 2);
    ctx.stroke();
    drawGamepadIcon(ctx, bx + ov.badgeSize / 2, by + ov.badgeSize / 2, ov.iconSize, '#FFD700');
    ctx.restore();
  }

  // --- Game name overlay (bottom) ---
  if (overlays.showGameName) {
    ctx.save();
    const gradH = tileSize * 0.35;
    const gy = y + tileSize - gradH;

    // Clip to bottom rounded corners
    roundRectPath(ctx, x, y, tileSize, tileSize, radius);
    ctx.clip();

    const grad = ctx.createLinearGradient(x, gy, x, y + tileSize);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, gy, tileSize, gradH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `500 ${ov.fontSizeSm + 1}px Inter, sans-serif`;
    ctx.textBaseline = 'bottom';
    // Truncate text to fit
    const maxW = tileSize - ov.padX * 2;
    let displayText = trophy.gameTitle;
    while (ctx.measureText(displayText).width > maxW && displayText.length > 1) {
      displayText = displayText.slice(0, -1);
    }
    if (displayText !== trophy.gameTitle) displayText += '…';
    ctx.fillText(displayText, x + ov.padX, y + tileSize - ov.padY - 2);
    ctx.restore();
  }

  // --- Date overlay (stacks below order if both shown) ---
  if (overlays.showDate) {
    const dateY = overlays.showOrder ? y + ov.stackOffset : y + ov.inset;
    const dateText = trophy.dateEarned.split(',')[0];
    drawBadgePill(ctx, x + ov.inset, dateY, dateText, {
      font: `500 ${ov.fontSizeSm}px Inter, sans-serif`,
      textColor: '#8A9BB8',
      bgColor: 'rgba(0,0,0,0.75)',
      borderColor: '#1E2740',
      padX: ov.padX,
      padY: ov.padY,
      align: 'left',
      icon: drawCalendarIcon,
      iconSize: ov.calIcon,
      iconColor: '#8A9BB8',
    });
  }

  // --- Milestone badge (stacks below rarity if both shown) ---
  if (overlays.showMilestones && (trophy.order % 25 === 0 || trophy.order % 10 === 0)) {
    const mY = overlays.showRarity ? y + ov.stackOffset : y + ov.inset;
    const mX = x + tileSize - ov.inset - ov.badgeSizeSm;
    const isGold = trophy.order % 25 === 0;

    ctx.save();
    ctx.fillStyle = isGold ? '#FFD700' : 'rgba(0,0,0,0.75)';
    roundRectPath(ctx, mX, mY, ov.badgeSizeSm, ov.badgeSizeSm, ov.badgeSizeSm / 2);
    ctx.fill();
    if (!isGold) {
      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 1;
      roundRectPath(ctx, mX, mY, ov.badgeSizeSm, ov.badgeSizeSm, ov.badgeSizeSm / 2);
      ctx.stroke();
    }
    drawStarIcon(ctx, mX + ov.badgeSizeSm / 2, mY + ov.badgeSizeSm / 2, ov.iconSizeSm, isGold ? '#000000' : '#FFD700');
    ctx.restore();
  }

  // --- Rarest badge (top-right, overflows tile) ---
  if (overlays.showRarestBadge && rarestId !== null && trophy.id === rarestId) {
    const offset = Math.round(4 * scale);
    const bx = x + tileSize - ov.badgeSize + offset;
    const by = y - offset;
    ctx.save();
    ctx.shadowColor = 'rgba(255,215,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bx + ov.badgeSize / 2, by + ov.badgeSize / 2, ov.badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawCrownIcon(ctx, bx + ov.badgeSize / 2, by + ov.badgeSize / 2, ov.iconSize, '#000000');
  }
}

// ---------------------------------------------------------------------------
// Drawing: profile card
// ---------------------------------------------------------------------------

function drawProfileCard(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  params: CanvasExportParams,
  avatarImg: HTMLImageElement | null,
) {
  const { profile, profileStat, trophies } = params;
  const cardY = layout.profileCardY;

  // --- Compute extra stat ---
  let extraStat: { value: string; label: string } | null = null;
  if (profileStat === 'rarest' && profile.rarestPlatinum) {
    extraStat = { value: `${profile.rarestPlatinum.rarity}%`, label: 'Rarest' };
  } else if (profileStat === 'topPlatform' && trophies.length > 0) {
    const counts: Record<string, number> = {};
    trophies.forEach(t => { counts[t.platform] = (counts[t.platform] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    extraStat = { value: top[0], label: 'Top Platform' };
  } else if (profileStat === 'avgRarity' && trophies.length > 0) {
    const avg = trophies.reduce((sum, t) => sum + t.rarity, 0) / trophies.length;
    extraStat = { value: `${avg.toFixed(1)}%`, label: 'Avg Rarity' };
  }

  // --- Measure text to compute card width ---
  ctx.font = '700 18px Rajdhani, sans-serif';
  const usernameW = ctx.measureText(profile.username).width;
  ctx.font = '500 12px Inter, sans-serif';
  const levelW = ctx.measureText(`Lv ${profile.psnLevel}`).width;
  const nameBlockW = Math.max(usernameW, levelW);

  ctx.font = '700 18px Rajdhani, sans-serif';
  const platNumW = ctx.measureText(String(profile.totalPlatinums)).width;
  ctx.font = '500 10px Inter, sans-serif';
  const platLabelW = ctx.measureText('Platinums').width;
  const platBlockW = Math.max(platNumW, platLabelW, 64);

  let extraBlockW = 0;
  if (extraStat) {
    ctx.font = '700 18px Rajdhani, sans-serif';
    const valW = ctx.measureText(extraStat.value).width;
    ctx.font = '500 10px Inter, sans-serif';
    const labW = ctx.measureText(extraStat.label).width;
    extraBlockW = Math.max(valW, labW, 64) + 24 + 1; // gap + separator
  }

  const avatarSize = 48;
  const avatarGap = 12;
  const sectionGap = 24;
  const padH = 20;
  const sepW = 1;

  const cardW = padH * 2 + avatarSize + avatarGap + nameBlockW + sectionGap + sepW + sectionGap + platBlockW + extraBlockW;
  const cardH = PROFILE_CARD_HEIGHT_DESKTOP;
  const cardX = (layout.canvasWidth - cardW) / 2;

  // --- Background ---
  ctx.save();
  ctx.fillStyle = '#12172A';
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.fill();
  ctx.strokeStyle = '#1E2740';
  ctx.lineWidth = 1;
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.stroke();
  ctx.restore();

  let curX = cardX + padH;
  const centerY = cardY + cardH / 2;

  // --- Avatar ---
  ctx.save();
  ctx.beginPath();
  ctx.arc(curX + avatarSize / 2, centerY, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  if (avatarImg) {
    drawImageCover(ctx, avatarImg, curX, centerY - avatarSize / 2, avatarSize, avatarSize);
  } else {
    ctx.fillStyle = '#1E2740';
    ctx.fillRect(curX, centerY - avatarSize / 2, avatarSize, avatarSize);
  }
  ctx.restore();
  // Avatar border
  ctx.save();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(curX + avatarSize / 2, centerY, avatarSize / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  curX += avatarSize + avatarGap;

  // --- Username + Level ---
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px Rajdhani, sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.fillText(profile.username, curX, centerY + 1);
  ctx.font = '500 12px Inter, sans-serif';
  ctx.fillStyle = '#8A9BB8';
  ctx.textBaseline = 'top';
  ctx.fillText('Lv ', curX, centerY + 3);
  const lvPrefixW = ctx.measureText('Lv ').width;
  ctx.fillStyle = '#FFD700';
  ctx.font = '700 12px Rajdhani, sans-serif';
  ctx.fillText(String(profile.psnLevel), curX + lvPrefixW, centerY + 3);
  ctx.restore();

  curX += nameBlockW + sectionGap;

  // --- Separator ---
  ctx.save();
  ctx.fillStyle = '#1E2740';
  ctx.fillRect(curX, cardY + 12, 1, cardH - 24);
  ctx.restore();
  curX += 1 + sectionGap;

  // --- Platinums section ---
  const platCenterX = curX + platBlockW / 2;

  // Trophy icon
  drawTrophyIcon(ctx, platCenterX, centerY - 20, 16, '#FFD700');

  // Number
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px Rajdhani, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(profile.totalPlatinums), platCenterX, centerY + 2);

  // Label
  ctx.fillStyle = '#8A9BB8';
  ctx.font = '500 10px Inter, sans-serif';
  ctx.fillText('Platinums', platCenterX, centerY + 22);
  ctx.restore();

  curX += platBlockW;

  // --- Extra stat section ---
  if (extraStat) {
    // Separator
    ctx.save();
    ctx.fillStyle = '#1E2740';
    ctx.fillRect(curX + 12, cardY + 12, 1, cardH - 24);
    ctx.restore();

    const extraCenterX = curX + 12 + 1 + 12 + (extraBlockW - 25) / 2;

    // Star icon
    drawStarIcon(ctx, extraCenterX, centerY - 20, 14, '#FFD700');

    // Value
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(extraStat.value, extraCenterX, centerY + 2);

    // Label
    ctx.fillStyle = '#8A9BB8';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillText(extraStat.label, extraCenterX, centerY + 22);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export async function renderMosaicToCanvas(params: CanvasExportParams): Promise<HTMLCanvasElement> {
  // 1. Ensure fonts are loaded
  await Promise.all([
    document.fonts.load('700 18px Rajdhani'),
    document.fonts.load('500 12px Inter'),
  ]);
  await document.fonts.ready;

  // 2. Compute layout
  const layout = computeLayout(params);

  // 3. Preload all images from the cache
  const imageMap = new Map<string, HTMLImageElement>();
  const imgUrls = new Set<string>();

  for (const trophy of params.trophies) {
    const src = params.useTrophyImage && trophy.trophyImageUrl ? trophy.trophyImageUrl : trophy.imageUrl;
    imgUrls.add(src);
  }
  if (params.showProfile && params.profile.avatar) {
    imgUrls.add(params.profile.avatar);
  }

  const loadPromises = [...imgUrls].map(async (url) => {
    const dataUrl = imageCache.get(url);
    if (dataUrl) {
      const img = await loadImage(dataUrl);
      if (img) imageMap.set(url, img);
    }
  });
  await Promise.all(loadPromises);

  // 4. Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(layout.canvasWidth * params.pixelRatio);
  canvas.height = Math.ceil(layout.canvasHeight * params.pixelRatio);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(params.pixelRatio, params.pixelRatio);

  // 5. Draw background
  drawBackground(ctx, layout.canvasWidth, layout.canvasHeight, params);

  // 6. Draw tiles
  const rarestId = params.profile.rarestPlatinum?.id ?? null;
  for (let i = 0; i < params.trophies.length; i++) {
    const trophy = params.trophies[i];
    const pos = layout.tiles[i];
    if (!pos) break;
    drawTile(ctx, trophy, pos.x, pos.y, layout.tileSize, params, imageMap, rarestId);
  }

  // 7. Draw profile card
  if (params.showProfile) {
    const avatarImg = imageMap.get(params.profile.avatar) ?? null;
    drawProfileCard(ctx, layout, params, avatarImg);
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

export async function exportMosaicAsBlob(params: CanvasExportParams): Promise<Blob> {
  const canvas = await renderMosaicToCanvas(params);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      params.format === 'jpeg' ? 'image/jpeg' : 'image/png',
      params.format === 'jpeg' ? (params.quality ?? 0.95) : undefined,
    );
  });
}
