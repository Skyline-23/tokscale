# Frontend Theming Implementation Research

## Executive Summary

The token-tracker frontend implements a sophisticated theming system with:
- **9 color palettes** for contribution graphs (GitHub-style)
- **5-grade intensity system** (0-4) for data visualization
- **Per-source color mapping** for different AI providers
- **Light/Dark/System theme preference** with localStorage persistence
- **Dynamic palette switching** via UI controls

This document provides a comprehensive guide for adapting these patterns to the CLI TUI.

---

## 1. CONTRIBUTION GRAPH COLOR PALETTES

### Location
- **Frontend**: `/Users/junhoyeo/token-tracker/frontend/src/lib/themes.ts`
- **TUI**: `/Users/junhoyeo/token-tracker/packages/cli/src/tui/config/themes.ts` (already synced)

### Structure

All palettes follow a 5-grade intensity system:
- **grade0**: Empty/no activity color (`#1F1F20` - dark gray)
- **grade1**: Lightest activity
- **grade2**: Light activity
- **grade3**: Medium activity
- **grade4**: Darkest/most intense activity

### Available Palettes

```typescript
export interface GraphColorPalette {
  name: string;
  grade0: string;
  grade1: string;
  grade2: string;
  grade3: string;
  grade4: string;
}
```

#### 1. **Green** (Default)
```
grade0: #1F1F20 (empty)
grade1: #9be9a8 (light green)
grade2: #40c463 (medium green)
grade3: #30a14e (darker green)
grade4: #216e39 (darkest green)
```
*GitHub's default contribution color scheme*

#### 2. **Halloween**
```
grade0: #1F1F20
grade1: #FFEE4A (light yellow)
grade2: #FFC501 (orange-yellow)
grade3: #FE9600 (orange)
grade4: #03001C (dark purple/black)
```

#### 3. **Teal**
```
grade0: #1F1F20
grade1: #7ee5e5 (light teal)
grade2: #2dc5c5 (medium teal)
grade3: #0d9e9e (darker teal)
grade4: #0e6d6d (darkest teal)
```

#### 4. **Blue**
```
grade0: #1F1F20
grade1: #79b8ff (light blue)
grade2: #388bfd (medium blue)
grade3: #1f6feb (darker blue)
grade4: #0d419d (darkest blue)
```

#### 5. **Pink**
```
grade0: #1F1F20
grade1: #f0b5d2 (light pink)
grade2: #d961a0 (medium pink)
grade3: #bf4b8a (darker pink)
grade4: #99286e (darkest pink)
```

#### 6. **Purple**
```
grade0: #1F1F20
grade1: #cdb4ff (light purple)
grade2: #a371f7 (medium purple)
grade3: #8957e5 (darker purple)
grade4: #6e40c9 (darkest purple)
```

#### 7. **Orange**
```
grade0: #1F1F20
grade1: #ffd699 (light orange)
grade2: #ffb347 (medium orange)
grade3: #ff8c00 (darker orange)
grade4: #cc5500 (darkest orange)
```

#### 8. **Monochrome**
```
grade0: #1F1F20
grade1: #9e9e9e (light gray)
grade2: #757575 (medium gray)
grade3: #424242 (darker gray)
grade4: #212121 (darkest gray)
```

#### 9. **YlGnBu** (Yellow-Green-Blue)
```
grade0: #1F1F20
grade1: #a1dab4 (light yellow-green)
grade2: #41b6c4 (cyan)
grade3: #2c7fb8 (blue)
grade4: #253494 (dark blue)
```

### Helper Functions

```typescript
// Get palette by name
export const getPalette = (name: ColorPaletteName): GraphColorPalette =>
  colorPalettes[name] || colorPalettes[DEFAULT_PALETTE];

// Get specific grade color
export const getGradeColor = (
  palette: GraphColorPalette,
  intensity: 0 | 1 | 2 | 3 | 4
): string => {
  const grades = [
    palette.grade0,
    palette.grade1,
    palette.grade2,
    palette.grade3,
    palette.grade4
  ];
  return grades[intensity] || palette.grade0;
};

// Get all palette names
export const getPaletteNames = (): ColorPaletteName[] =>
  Object.keys(colorPalettes) as ColorPaletteName[];
```

---

## 2. PER-SOURCE/PROVIDER COLOR MAPPING

### Location
- **Frontend**: `/Users/junhoyeo/token-tracker/frontend/src/lib/constants.ts`
- **TUI**: `/Users/junhoyeo/token-tracker/packages/cli/src/tui/utils/colors.ts`

### Source Colors (Frontend)

```typescript
export const SOURCE_COLORS: Record<string, string> = {
  opencode: "#22c55e",    // Green
  claude: "#f97316",      // Orange
  codex: "#3b82f6",       // Blue
  gemini: "#8b5cf6",      // Purple
  cursor: "#000000",      // Black
};

export const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  opencode: "OpenCode",
  claude: "Claude Code",
  codex: "Codex CLI",
  gemini: "Gemini CLI",
  cursor: "Cursor",
};
```

### Provider Colors (TUI)

The TUI has a more sophisticated provider detection system:

```typescript
export const PROVIDER_COLORS = {
  anthropic: "#FF6B35",   // Orange-red
  openai: "#10B981",      // Green
  google: "#3B82F6",      // Blue
  cursor: "#8B5CF6",      // Purple
  opencode: "#6B7280",    // Gray
  deepseek: "#06B6D4",    // Cyan
  xai: "#EAB308",         // Yellow
  meta: "#6366F1",        // Indigo
  unknown: "#FFFFFF",     // White
} as const;
```

### Provider Detection Logic (TUI)

```typescript
export function getProviderFromModel(modelId: string): ProviderType {
  const lower = modelId.toLowerCase();
  if (/claude|sonnet|opus|haiku/.test(lower)) return "anthropic";
  if (/gpt|^o1|^o3|codex|text-embedding|dall-e|whisper|tts/.test(lower)) return "openai";
  if (/gemini/.test(lower)) return "google";
  if (/deepseek/.test(lower)) return "deepseek";
  if (/grok/.test(lower)) return "xai";
  if (/llama|mixtral/.test(lower)) return "meta";
  if (/^auto$|cursor/.test(lower)) return "cursor";
  return "unknown";
}

export function getModelColor(modelId: string): string {
  return PROVIDER_COLORS[getProviderFromModel(modelId)];
}
```

---

## 3. THEME PREFERENCE SYSTEM

### Location
- **Frontend**: `/Users/junhoyeo/token-tracker/frontend/src/lib/useSettings.ts`
- **TUI**: `/Users/junhoyeo/token-tracker/packages/cli/src/tui/config/settings.ts`

### Frontend Implementation

The frontend uses a React hook with localStorage persistence:

```typescript
export type ThemePreference = "light" | "dark" | "system";

export interface Settings {
  theme: ThemePreference;
  paletteName: ColorPaletteName;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  paletteName: DEFAULT_PALETTE,
};

const STORAGE_KEY = "token-tracker-settings";

// Persists to localStorage
function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage might be full or disabled
  }
}

// Respects system preference
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
```

### TUI Implementation

The TUI uses a simpler file-based approach:

```typescript
const CONFIG_DIR = join(homedir(), ".config", "token-tracker");
const CONFIG_FILE = join(CONFIG_DIR, "tui-settings.json");

interface TUISettings {
  colorPalette: string;
}

export function loadSettings(): TUISettings {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch {
  }
  return { colorPalette: "green" };
}

export function saveSettings(settings: TUISettings): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(settings, null, 2));
}
```

---

## 4. FRONTEND THEMING ARCHITECTURE

### Global CSS Variables

**Location**: `/Users/junhoyeo/token-tracker/frontend/src/app/globals.css`

```css
:root {
  /* Background Colors */
  --color-bg-darkest: #111113;
  --color-bg-default: #141415;
  --color-bg-elevated: #1F1F20;
  --color-bg-button: #212124;
  --color-bg-subtle: #262627;
  --color-bg-active: #2C2C2F;

  /* Text Colors */
  --color-text-primary: #FFFFFF;
  --color-text-muted: #696969;

  /* Primary Colors */
  --color-primary: #53d1f3;
  --color-primary-hover: #3bc4e8;
  --color-primary-active: #2ab8dc;

  /* Accent Colors */
  --color-accent-blue: #85CAFF;
  --color-accent-link: #169AFF;

  /* Graph Colors */
  --color-graph-empty: #1F1F20;
  --color-graph-canvas: #141415;

  /* Border Colors */
  --color-border-default: #262627;
  --color-border-muted: #262627;
  --color-border-subtle: rgba(255, 255, 255, 0.1);

  /* Card/Button Colors */
  --color-card-bg: #1F1F20;
  --color-card-border: #262627;
  --color-btn-bg: #212124;
  --color-btn-border: #262627;
  --color-btn-hover-bg: #2C2C2F;
}
```

### Provider Structure

**Location**: `/Users/junhoyeo/token-tracker/frontend/src/lib/providers/`

```typescript
// Providers.tsx - Root provider wrapper
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <PrimerProvider>
        {children}
      </PrimerProvider>
    </StyledComponentsRegistry>
  );
}
```

---

## 5. CONTRIBUTION GRAPH IMPLEMENTATION

### Frontend 2D Graph

**Location**: `/Users/junhoyeo/token-tracker/frontend/src/components/TokenGraph2D.tsx`

#### Key Features:
- Canvas-based rendering for performance
- 7 days × 53 weeks grid (GitHub-style)
- Dynamic DPI scaling for high-resolution displays
- Interactive hover/click detection
- Month labels and day labels

#### Color Application:
```typescript
const intensity = day?.intensity ?? 0;
const colorHex = getGradeColor(palette, intensity);
ctx.fillStyle = colorHex;
roundRect(ctx, x, y, BOX_WIDTH, BOX_WIDTH, 2);
ctx.fill();
```

#### Constants:
```typescript
export const BOX_WIDTH = 10;
export const BOX_MARGIN = 2;
export const CELL_SIZE = BOX_WIDTH + BOX_MARGIN; // 12
export const WEEKS_IN_YEAR = 53;
export const DAYS_IN_WEEK = 7;
export const CANVAS_MARGIN = 20;
export const HEADER_HEIGHT = 60;
```

### TUI Contribution Grid

**Location**: `/Users/junhoyeo/token-tracker/packages/cli/src/tui/components/StatsView.tsx`

The TUI renders a simplified 7×52 grid using text characters:

```typescript
// Uses Unicode block characters
// · for empty cells (level 0)
// █ for filled cells (level 1-4)

<text
  fg={cell.level === 0 ? "gray" : undefined}
  backgroundColor={cell.level > 0 ? getGradeColor(palette(), cell.level as 0 | 1 | 2 | 3 | 4) : undefined}
>
  {cell.level === 0 ? "·" : "█"}
</text>
```

---

## 6. PALETTE SWITCHING MECHANISM

### Frontend

**Location**: `/Users/junhoyeo/token-tracker/frontend/src/components/GraphControls.tsx`

```typescript
<select
  value={paletteName}
  onChange={(e) => onPaletteChange(e.target.value as ColorPaletteName)}
  className="text-xs py-1.5 px-2 rounded-lg border cursor-pointer font-medium"
  style={{
    borderColor: "#262627",
    color: "#FFFFFF",
    backgroundColor: "#212124",
  }}
>
  {paletteNames.map((name) => (
    <option key={name} value={name}>{colorPalettes[name].name}</option>
  ))}
</select>
```

### TUI

**Location**: `/Users/junhoyeo/token-tracker/packages/cli/src/tui/App.tsx`

Keyboard shortcut: **P** to cycle through palettes

```typescript
if (key.name === "p") {
  const palettes = getPaletteNames();
  const currentIdx = palettes.indexOf(colorPalette());
  const nextIdx = (currentIdx + 1) % palettes.length;
  const newPalette = palettes[nextIdx];
  saveSettings({ colorPalette: newPalette });
  setColorPalette(newPalette);
  return;
}
```

---

## 7. INTENSITY CALCULATION

### Data Structure

```typescript
export interface DailyContribution {
  date: string;
  totals: {
    tokens: number;
    cost: number;
    messages: number;
  };
  intensity: 0 | 1 | 2 | 3 | 4;  // Calculated based on cost
  tokenBreakdown: TokenBreakdown;
  sources: SourceContribution[];
}
```

### Intensity Mapping Logic

The intensity is calculated based on the cost relative to the maximum cost in the dataset:

```typescript
// From frontend utils
export function recalculateIntensity(contributions: DailyContribution[]): DailyContribution[] {
  const maxCost = Math.max(...contributions.map(c => c.totals.cost), 0);
  
  return contributions.map(c => ({
    ...c,
    intensity: maxCost === 0 
      ? 0 
      : Math.min(4, Math.ceil((c.totals.cost / maxCost) * 4)) as 0 | 1 | 2 | 3 | 4
  }));
}
```

---

## 8. THEME TOGGLE COMPONENT

### Location
`/Users/junhoyeo/token-tracker/frontend/src/components/ThemeToggle.tsx`

### Features:
- Light/Dark/System theme selection
- Animated toggle with Framer Motion
- Keyboard navigation (Arrow keys)
- Accessible radio group pattern

### Color Scheme:
```typescript
// Container background
background: "linear-gradient(to bottom, #212124, #1F1F20)"

// Indicator background
backgroundColor: "#1F1F20"

// Active icon color
color: "#FFFFFF"

// Inactive icon color
color: "#696969"
```

---

## 9. BREAKDOWN PANEL (Per-Model Colors)

### Location
`/Users/junhoyeo/token-tracker/frontend/src/components/BreakdownPanel.tsx`

### How It Uses Colors:

```typescript
// Source section uses SOURCE_COLORS
const sourceColor = SOURCE_COLORS[sourceType] || palette.grade3;

<span
  style={{ 
    backgroundColor: `${sourceColor}20`,  // 20% opacity
    color: sourceColor 
  }}
>
  {SOURCE_DISPLAY_NAMES[sourceType]}
</span>

// Model cost uses palette's darkest grade
<span style={{ color: palette.grade4 }}>
  {formatCurrency(cost)}
</span>
```

---

## 10. STATS PANEL

### Location
`/Users/junhoyeo/token-tracker/frontend/src/components/StatsPanel.tsx`

### Color Usage:

```typescript
// Highlight color for total cost
<StatItem 
  label="Total Cost" 
  value={formatCurrency(summary.totalCost)} 
  highlightColor={palette.grade4}  // Darkest grade
  highlight 
/>

// Source badges use palette
<span
  style={{ 
    backgroundColor: `${palette.grade3}20`,  // 20% opacity
    color: "#FFFFFF" 
  }}
>
  {source}
</span>
```

---

## 11. KEY PATTERNS FOR TUI ADAPTATION

### Pattern 1: Palette Consistency
- **Frontend**: Uses same palettes across all components
- **TUI**: Already synced with frontend palettes
- **Recommendation**: Keep palettes identical for consistency

### Pattern 2: Grade-Based Intensity
- **Frontend**: Maps cost to 0-4 intensity scale
- **TUI**: Uses same intensity mapping
- **Recommendation**: Maintain 5-grade system for consistency

### Pattern 3: Provider/Source Colors
- **Frontend**: Uses SOURCE_COLORS for source badges
- **TUI**: Uses PROVIDER_COLORS with model detection
- **Recommendation**: Consider unifying these systems

### Pattern 4: Opacity for Emphasis
- **Frontend**: Uses `${color}20` (20% opacity) for backgrounds
- **TUI**: Limited opacity support in terminal
- **Recommendation**: Use dimmed/bold text instead

### Pattern 5: Keyboard Shortcuts
- **Frontend**: Dropdown selector
- **TUI**: Press 'P' to cycle palettes
- **Recommendation**: Keep keyboard-first approach in TUI

---

## 12. COLOR PALETTE RECOMMENDATIONS FOR TUI

### Terminal Color Limitations

Terminal colors have limited support compared to web:
- **256-color mode**: Limited palette
- **True color (24-bit)**: Full RGB support (modern terminals)
- **Opacity**: Not supported in most terminals

### Adaptation Strategy

1. **Use True Color (24-bit RGB)** when available
   - OpenTUI supports this via `backgroundColor` and `fg` props
   - Allows direct use of hex colors from palettes

2. **Fallback to 256-color mode**
   - Map hex colors to nearest 256-color equivalents
   - Maintain visual hierarchy

3. **Text Styling for Emphasis**
   - Use `bold`, `dim`, `italic` for emphasis instead of opacity
   - Use `fg` (foreground) for text color
   - Use `backgroundColor` for cell backgrounds

### Example TUI Color Usage

```typescript
// Direct hex color (24-bit true color)
<text backgroundColor="#216e39" fg="#FFFFFF">█</text>

// With styling
<text bold fg="#FFFFFF">Important</text>
<text dim fg="#696969">Muted</text>
```

---

## 13. IMPLEMENTATION CHECKLIST FOR TUI

### Already Implemented ✓
- [x] 9 color palettes in `config/themes.ts`
- [x] Palette switching with 'P' key
- [x] Settings persistence to `~/.config/token-tracker/tui-settings.json`
- [x] Provider color detection in `utils/colors.ts`
- [x] Contribution grid in StatsView

### Recommended Enhancements
- [ ] Add theme preference (light/dark) support
- [ ] Enhance provider color detection for new models
- [ ] Add color legend/reference in UI
- [ ] Consider per-model color highlighting in ModelView
- [ ] Add palette preview in Footer

---

## 14. FILE REFERENCE GUIDE

### Frontend Theming Files
| File | Purpose |
|------|---------|
| `frontend/src/lib/themes.ts` | Color palette definitions |
| `frontend/src/lib/useSettings.ts` | Theme preference hook |
| `frontend/src/lib/constants.ts` | Source colors & display names |
| `frontend/src/app/globals.css` | Global CSS variables |
| `frontend/src/components/ThemeToggle.tsx` | Theme switcher UI |
| `frontend/src/components/GraphControls.tsx` | Palette selector |
| `frontend/src/components/TokenGraph2D.tsx` | Graph rendering |
| `frontend/src/components/BreakdownPanel.tsx` | Per-model breakdown |
| `frontend/src/components/StatsPanel.tsx` | Statistics display |

### TUI Theming Files
| File | Purpose |
|------|---------|
| `packages/cli/src/tui/config/themes.ts` | Color palette definitions |
| `packages/cli/src/tui/config/settings.ts` | Settings persistence |
| `packages/cli/src/tui/utils/colors.ts` | Provider color mapping |
| `packages/cli/src/tui/App.tsx` | Palette switching logic |
| `packages/cli/src/tui/components/StatsView.tsx` | Contribution grid |
| `packages/cli/src/tui/components/Footer.tsx` | Palette display |

---

## 15. COLOR VALUE REFERENCE TABLE

### All Palette Colors (Quick Reference)

| Palette | Grade 0 | Grade 1 | Grade 2 | Grade 3 | Grade 4 |
|---------|---------|---------|---------|---------|---------|
| Green | #1F1F20 | #9be9a8 | #40c463 | #30a14e | #216e39 |
| Halloween | #1F1F20 | #FFEE4A | #FFC501 | #FE9600 | #03001C |
| Teal | #1F1F20 | #7ee5e5 | #2dc5c5 | #0d9e9e | #0e6d6d |
| Blue | #1F1F20 | #79b8ff | #388bfd | #1f6feb | #0d419d |
| Pink | #1F1F20 | #f0b5d2 | #d961a0 | #bf4b8a | #99286e |
| Purple | #1F1F20 | #cdb4ff | #a371f7 | #8957e5 | #6e40c9 |
| Orange | #1F1F20 | #ffd699 | #ffb347 | #ff8c00 | #cc5500 |
| Monochrome | #1F1F20 | #9e9e9e | #757575 | #424242 | #212121 |
| YlGnBu | #1F1F20 | #a1dab4 | #41b6c4 | #2c7fb8 | #253494 |

### Provider Colors (TUI)

| Provider | Color |
|----------|-------|
| Anthropic | #FF6B35 |
| OpenAI | #10B981 |
| Google | #3B82F6 |
| Cursor | #8B5CF6 |
| OpenCode | #6B7280 |
| DeepSeek | #06B6D4 |
| XAI | #EAB308 |
| Meta | #6366F1 |
| Unknown | #FFFFFF |

### Source Colors (Frontend)

| Source | Color |
|--------|-------|
| OpenCode | #22c55e |
| Claude | #f97316 |
| Codex | #3b82f6 |
| Gemini | #8b5cf6 |
| Cursor | #000000 |

---

## 16. NEXT STEPS

1. **Review** this document with the team
2. **Identify** any additional color needs for TUI
3. **Test** palette rendering in different terminal emulators
4. **Consider** adding theme preference (light/dark) to TUI
5. **Document** any terminal-specific color limitations
6. **Plan** UI enhancements for color visualization

---

## Appendix: Color Harmony Analysis

### Palette Design Principles

1. **Green**: GitHub-inspired, natural progression
2. **Halloween**: High contrast, festive
3. **Teal**: Cool, modern, accessible
4. **Blue**: Professional, calming
5. **Pink**: Vibrant, energetic
6. **Purple**: Creative, sophisticated
7. **Orange**: Warm, energetic
8. **Monochrome**: Accessible, minimal
9. **YlGnBu**: Scientific, colorblind-friendly

All palettes maintain:
- Sufficient contrast for readability
- Consistent empty state color (#1F1F20)
- Progressive intensity from light to dark
- Accessibility considerations

