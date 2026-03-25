Design a high-fidelity UI mockup for a web app called "PlatForge" — 
a PlayStation platinum trophy mosaic generator and customization tool. 
The app is a creative canvas tool for trophy hunters to build, 
customize, and export beautiful mosaic images of their platinum trophies.

---

VISUAL IDENTITY
- Style: Dark luxury / gamer premium. Think PS5 UI meets Figma canvas 
  meets Spotify Wrapped.
- Primary color: Deep navy #0A0E1A
- Accent: Electric gold #FFD700 with a warm glow/halo effect
- Secondary accent: Platinum silver #C0C0C0
- Surface cards: #12172A with subtle border #1E2740
- Text: White primary, #8A9BB8 muted
- Font: "Inter" for UI, "Rajdhani" or "Orbitron" for display/headings
- Vibe: Premium, smooth, modern — not "gamer RGB" cheap, but 
  sophisticated collector aesthetic

---

LAYOUT — 3-PANEL EDITOR (full viewport, no scroll)

LEFT PANEL — Controls sidebar (320px wide, dark #0D1221)
CENTER — Canvas / Preview (flexible, takes remaining space)
RIGHT PANEL — Layers / tile inspector (280px, same dark tone)

TOP BAR — App header with logo, PSN ID input, action buttons

---

TOP BAR DETAILS
- Left: "PlatForge" logo with small platinum trophy icon, glowing gold
- Center: PSN ID input field with search icon + "Load Profile" button 
  (gold CTA)
- Right: Export button (dropdown arrow, shows PNG/GIF/4K options), 
  Share button (chain link icon), Save Preset button
- Under the bar: thin gold progress bar showing "Loading trophies... 
  142/238"

---

LEFT PANEL — CONTROL SECTIONS (collapsible accordion style)

Section 1: LAYOUT
- Grid size selector: visual buttons showing 3×3, 4×4, 5×5, 6×6, 
  custom (N×M)
- Layout style: icon toggles for Grid / Hexagonal / Masonry / Spiral / 
  Timeline
- Spacing/Gap slider: 0px → 20px
- Tile border radius slider: 0% (square) → 50% (circle)
- Show a small live preview thumbnail of the layout

Section 2: TILES
- Tile border: toggle + color swatch + thickness slider
- Tile shadow: toggle + blur/spread sliders
- Tile glow: toggle + color swatch (default gold)
- Overlay tint: color swatch + blend mode dropdown + opacity slider
- Rarity heatmap: toggle (colors tiles green→red by rarity %)
- Glassmorphism effect: toggle
- Hover/spotlight tile: dropdown to select which tile is "featured" 
  (larger, centered)

Section 3: BACKGROUND
- Type: segmented control → Solid / Gradient / Pattern / Custom Image / 
  Game Art / Transparent
- Color picker (or gradient builder when gradient is selected)
- Pattern picker: visual swatches (grid dots, diagonal lines, circuit, 
  noise)
- Opacity slider

Section 4: FRAME & BORDER
- Frame style: None / Thin / Thick / Double / Ornamental
- Frame color swatch + gradient option
- Corner decoration: None / Trophies / Stars / Crowns
- Outer glow toggle + color

Section 5: OVERLAYS (per-tile info)
- Toggles list:
  • Show platinum order number (#1, #2...)
  • Show game name
  • Show platinum date
  • Show rarity %
  • Show platform icon (PS4/PS5/Vita badge)
  • Milestone badges (50th, 100th auto-detected, crown icon)
  • "Rarest platinum" star badge

Section 6: PROFILE HEADER
- Toggle to show/hide header above mosaic
- Elements: PSN Avatar, Username, PSN Level badge, 
  Total platinums count, First/Last platinum dates, 
  Rarest platinum highlight card

Section 7: SORTING & FILTER
- Sort by: dropdown (Date earned / Alphabetical / Rarity / Platform / 
  Speed)
- Sort order: Asc/Desc toggle
- Filter by platform: pill toggles (ALL / PS3 / PS4 / PS5 / Vita / PSVR)
- Filter by year: horizontal year chip selector
- "Drag & drop reorder" mode toggle button

Section 8: EXPORT FORMAT PRESETS
- Format pills: Custom / Twitter Card (1200×675) / Instagram Post / 
  Instagram Story / Discord Banner / 4K Wallpaper / Phone Wallpaper
- File type: PNG / JPEG / GIF / Transparent PNG
- Resolution multiplier: 1× / 2× / 4×

---

CENTER CANVAS DETAILS

The canvas shows the live mosaic preview, centered, with a subtle 
drop shadow. Surrounding it is a dark grid/dot pattern background 
(like Figma's own canvas).

Example mosaic: 5×5 grid of platinum trophy images, each tile with:
- Rounded corners (12px)
- Subtle gold border
- Soft drop shadow
- Small PS5 badge icon bottom-right
- Platinum order number top-left (small, frosted pill: "#47")
- On hover: tile lifts with stronger glow, shows game name tooltip

At the bottom of the canvas, show the Profile Header strip:
- PSN avatar (circle, gold ring border)
- Username "CHIPO_97" in bold white
- PSN Level icon (level 500 example)
- "142 Platinums" with the platinum trophy icon
- Rarest: [game image thumbnail] "0.1% of players"

Floating above the canvas top-right corner: 
A semi-transparent "Canvas Controls" pill with zoom %, 
fit-to-screen button, and a toggle for "Preview Mode" 
(hides all UI, full-screen canvas).

---

RIGHT PANEL — TILE INSPECTOR

Top section: Selected tile details card
- Large game cover art thumbnail
- Game title
- Platform badge (PS5)
- Date earned: "March 14, 2024"
- Rarity: "3.42%" with a rarity bar (color coded)
- Time to platinum: "47h 32m"
- My order: "#47 of 142"

Below: "All Tiles" list — scrollable list of all loaded platinum tiles
- Thumbnail + name + date + drag handle
- Current selected tile highlighted in gold

Bottom: "Series Grouping" section — option to color-code tiles 
by franchise (e.g., all God of War tiles get a red tint)

---

ADDITIONAL SCREENS TO INCLUDE IN THE MOCKUP

Screen 2: TEMPLATES GALLERY modal
- Full-screen overlay with frosted glass backdrop
- Title "Choose a Template"
- Grid of template previews (6 cards, 2 rows of 3):
  • "Minimal Dark" — clean black grid, no borders
  • "Gold Collection" — gold frames, ornate corners, dark bg
  • "Cyberpunk" — neon purple/teal glow tiles, circuit pattern bg
  • "Retro PlayStation" — PS1 era aesthetic, grey tones, pixelated font
  • "Pastel Dream" — soft gradients, rounded tiles, light bg
  • "Dark Luxury" — glassmorphism tiles, deep navy, platinum silver
- Each card: preview image + template name + "Apply" button
- Bottom: "Save Current as Template" button (gold outlined)

Screen 3: YEAR IN REVIEW card (export preview)
- 1080×1920 vertical card (Spotify Wrapped style)
- Bold "2024 PLATINUM WRAPPED" heading
- Big number: "38 Platinums"
- Mosaic strip of that year's games (horizontal scroll row)
- Stats: Most active month / Fastest platinum / Rarest platinum / 
  Most played genre
- Bottom: PlatForge logo + PSN username
- Background: deep gradient with subtle particle/star effect

Screen 4: COMPARE MODE
- Split screen: two mosaics side by side
- Each side has a PSN ID input at the top
- Below the mosaics: stats comparison table 
  (Total platinums / Rarest / Avg rarity / Common platinums count)
- "Common Platinums" section: tiles both users share, 
  highlighted with a gold "shared" badge

---

INTERACTIONS TO SHOW (with arrows/annotations in the mockup)
- Hovering a tile → tooltip with game name + rarity
- Clicking a tile → right panel updates to show that tile's info
- Dragging a tile → ghost tile effect while dragging
- Clicking Export → dropdown menu appears
- Clicking a template → mosaic instantly re-renders with new style

---

TYPOGRAPHY HIERARCHY
- App name / big numbers: Orbitron Bold, 28-48px, gold
- Section headers in sidebar: Inter SemiBold, 11px, 
  uppercase tracked, muted #8A9BB8
- Body / labels: Inter Regular, 13px, white
- Game titles: Inter Medium, 12px, light gray
- Stats/numbers: Rajdhani Bold, 18-24px, white or gold

---

COMPONENT NOTES
- All sliders: custom styled, gold thumb, dark track
- All toggles: pill style, gold when active
- All buttons: rounded-full, gold fill for primary, 
  ghost/outline for secondary
- Tooltips: dark frosted glass with subtle border
- Scrollbars: thin, gold tinted, only visible on hover
- Icons: Lucide icon set style, 16-18px, consistent stroke

Make the design feel like a premium SaaS product that a 
PlayStation trophy hunter would be genuinely proud to use 
and share. Every detail should feel intentional and polished.