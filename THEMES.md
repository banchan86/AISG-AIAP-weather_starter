# Weather Starter — Theme Reference

Themes are selected at runtime via the theme selector in the top-right corner of the app. The chosen theme is persisted to `localStorage`. Each theme is defined as a set of CSS custom properties on `[data-theme="<id>"]` in `frontend/src/index.css` and registered in `frontend/src/state/theme.tsx`.

## Theme system

All visual tokens are CSS custom properties. Components use Tailwind utility aliases (`bg-surface`, `text-theme-muted`, `border-theme`, etc.) that resolve through the active theme's variables — no component code changes when switching themes.

| Token | Purpose |
|---|---|
| `--bg` | Full-page background (stacked CSS gradients) |
| `--sidebar-bg` / `--sidebar-border` | Sidebar panel fill and divider |
| `--surface` / `--surface-hover` / `--surface-active` | Card and interactive element fills |
| `--surface-subtle` / `--surface-faint` | Empty-state and background-fill variants |
| `--border` / `--border-soft` / `--border-active` | Card borders, dividers, focus rings |
| `--text` / `--text-secondary` / `--text-muted` / `--text-faint` | Typography hierarchy |
| `--text-placeholder` | Form input placeholder text |
| `--scrollbar-thumb` | Custom scrollbar fill |
| `--map-bg` | Leaflet tile layer fallback background |
| `--map-control-bg` / `--map-control-bg-hover` | Zoom button fills |
| `--map-control-color` / `--map-control-border` | Zoom button text and border |
| `--map-attr-bg` / `--map-attr-color` / `--map-attr-link` | Attribution overlay |

---

## Implemented themes

### 1. Apple `apple` ✅
**The default.** Saved from the original design.

Clean glassmorphic interface over a muted blue-gray gradient. Translucent white-tinted cards with heavy backdrop blur. Light typography hierarchy using white at descending opacities.

| Attribute | Value |
|---|---|
| Background | `#6f8aa8 → #3c5066` with radial white and blue-gray highlights |
| Surfaces | White at 8–20% opacity |
| Borders | White at 10–30% opacity |
| Text | White at 55–100% opacity |
| Map | Dark navy `#1a2535` |

---

### 2. Arctic Glass `arctic-glass` ✅
**Light, icy, frosted.**

Clean frosted-glass panels over an icy blue gradient. Light-blue background with bright white radial highlights gives a cold, crisp atmosphere. Dark navy text for legibility on the pale surface. Surfaces are heavily white-tinted (38–64% opacity) so the blur effect reads strongly.

| Attribute | Value |
|---|---|
| Background | `#ddeeff → #98c0e8` with white and ice-blue radial highlights |
| Surfaces | White at 38–64% opacity |
| Borders | Ice-blue `rgba(140,185,230,…)` |
| Text | Dark navy `rgba(10,30,60,…)` — dark on light |
| Map | Pale `#b8d4ec` with white-on-navy controls |

Design notes: The light text-on-dark inversion is the main distinction from Apple. The map tile uses a light CartoDB base rather than dark to match the overall brightness.

---

### 3. Botanical `botanical` ✅
**Deep forest, warm cream.**

Dark forest-green base with warm cream-tinted glass surfaces. Inspired by dense canopy light filtering through leaves. Sage-green secondary text and leaf-green borders give organic warmth without going earthy/brown.

| Attribute | Value |
|---|---|
| Background | `#2d4a2d → #152615` with lime and moss radial highlights |
| Surfaces | Warm cream `rgba(240,230,200,…)` at 7–18% opacity |
| Borders | Leaf green `rgba(140,200,100,…)` |
| Text | Warm cream primary, sage-green secondary/muted |
| Map | Near-black `#0f1e0f` with sage-green controls |

---

### 4. Midnight Navy `midnight-navy` ✅
**Dark, formal, gold-accented.**

Deep navy-to-near-black base with gold accent highlights throughout. The darkest theme — surfaces are nearly invisible (5% white) so the gradient shows through almost entirely. Gold is used sparingly for borders, active states, and secondary text to evoke luxury without going garish.

| Attribute | Value |
|---|---|
| Background | `#1a2340 → #090e1e` with faint gold radial top-right |
| Surfaces | White at 5–12%, gold-tinted at active state |
| Borders | Gold `rgba(212,175,55,…)` primary, soft white for dividers |
| Text | Warm cream primary, gold secondary, cool slate muted |
| Map | Almost-black `#080c18` with gold-tinted controls |

---

### 5. Neon Storm `neon-storm` ✅
**Cyberpunk, electric cyan on black.**

Near-black background with vivid cyan accents on every surface, border, and text element. High contrast, high energy. Surfaces are cyan-tinted at very low opacity so the black background dominates. Best suited for dark environments.

| Attribute | Value |
|---|---|
| Background | `#0a0a1a → #080818` (near-black) |
| Surfaces | Cyan `rgba(0,255,255,…)` at 6–18% opacity |
| Borders | Cyan at 12–55% opacity |
| Text | White primary, cyan secondary/muted |
| Map | Near-black `#050510` with cyan-tinted controls |

---

### 6. Desert Sand `desert-sand` ✅
**Warm terracotta, sandy ochre.**

Warm amber-to-brown gradient evoking sun-baked sandstone. Cream-tinted surfaces and warm sandy borders. All text is warm cream rather than pure white, blending naturally with the heated palette.

| Attribute | Value |
|---|---|
| Background | `#c8a97a → #6b4e2a` with cream and deep brown radials |
| Surfaces | Sandy cream `rgba(255,220,160,…)` at 12–28% opacity |
| Borders | Sandy cream at 12–45% opacity |
| Text | Warm cream `rgba(255,245,220,…)` through amber tones |
| Map | Dark brown `#3d2810` with sandy controls |

---

### 7. Nordic Frost `nordic-frost` ✅
**Light, Scandinavian minimalism.**

Pale blue-white gradient with high-opacity white surfaces — the lightest and most minimal of the light themes. Cool slate-blue borders and near-black text keep it crisp without feeling cold. Closest to a traditional light-mode design.

| Attribute | Value |
|---|---|
| Background | `#e8eef4 → #a0bcd0` with white and slate radials |
| Surfaces | White at 45–72% opacity |
| Borders | Cool slate-blue `rgba(80,120,160,…)` |
| Text | Dark navy `rgba(20,40,70,…)` — dark on light |
| Map | Pale `#c8d8e8` with white-on-navy controls |

---

### 8. Paper Map `paper-map` ✅
**Vintage cartography, parchment and ink.**

Warm parchment gradient with ivory glass surfaces evoking aged paper. Ink-brown borders suggest hand-drawn map inset lines. Deep sepia text on cream reads like printed cartographic labels. The map tile background is warm parchment to match.

| Attribute | Value |
|---|---|
| Background | `#e8d8b0 → #b8986a` with cream highlight and aged brown radials |
| Surfaces | Ivory/cream `rgba(255,248,225,…)` at 50–80% opacity |
| Borders | Ink brown `rgba(100,70,30,…)` |
| Text | Deep sepia `rgba(40,22,5,…)` — dark on light |
| Map | Parchment `#c8ae82` with ivory controls |

---

## Planned themes (not yet implemented)

Listed in original proposal order. Each can be added by defining a `[data-theme="<id>"]` block in `index.css` and registering the id/name in `theme.tsx` and a swatch gradient in `ThemeSelector.tsx`.

| # | Name | ID | Description |
|---|---|---|---|
| 9 | Minimal Mono | `minimal-mono` | Black-and-white with one user-selectable accent. System monospace font, razor-thin borders, ultra-dense data table layout. |
| 10 | Aurora Borealis | `aurora-borealis` | Deep purple-black with shifting green, teal, and violet gradients. Thin light sans-serif, floating cards, dramatic negative space. |
| 11 | Cotton Cloud | `cotton-cloud` | Soft white, light sky blue, and lavender. Rounded cards with subtle drop shadows, friendly Nunito sans-serif, generous padding. |
| 12 | Volcanic | `volcanic` | Dark charcoal and slate with lava-red and amber accents. Bold condensed font, sharp-edged cards, high-density compact layout. |
| 13 | Ocean Depth | `ocean-depth` | Deep teal-to-navy gradient with seafoam and aqua highlights. Fluid rounded shapes, clean Poppins sans-serif, wave-inspired dividers. |
| 14 | Sakura | `sakura` | Soft pink, white, and pale green — Japanese cherry blossom palette. Airy low-density layout, translucent petal-toned cards. |
| 15 | Terminal Green | `terminal-green` | Green-on-black CRT terminal aesthetic. Pure monospace, no-border flat blocks, ultra-dense, scanline texture overlay. |
| 16 | Concrete City | `concrete-city` | Urban brutalist — raw grey, cement tones, stark white. Bold grotesque font, hard rectangular cards with thick borders. |
| 17 | Golden Hour | `golden-hour` | Honey, peach, and golden-yellow sunset tones. Oversized headline stats, sparse single-column layout. |
| 18 | Retro Dashboard | `retro-dashboard` | 1970s data-display — mustard, rust, and cream with woodgrain accents. Chunky slab-serif, dense instrument-panel layout. |
| 19 | Glassmorphic Dark | `glassmorphic-dark` | Pure dark mode with heavy glass blur, subtle gradients, neon-tinted card edges. Floating layered cards, depth through shadow stacking. |
| 20 | Pastel Pride | `pastel-pride` | Rotating soft pastel spectrum (lavender, mint, peach, sky). Rounded font, soft-glow cards, playful staggered layout. |
