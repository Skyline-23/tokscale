# Theming Quick Reference Guide

## 🎨 Color Palettes at a Glance

### Visual Palette Comparison

```
GREEN (Default)
├─ grade0: ░░░░░░░░░░ #1F1F20 (empty)
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #9be9a8 (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #40c463 (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #30a14e (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #216e39 (darkest)

HALLOWEEN
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #FFEE4A (yellow)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #FFC501 (orange-yellow)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #FE9600 (orange)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #03001C (dark)

TEAL
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #7ee5e5 (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #2dc5c5 (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #0d9e9e (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #0e6d6d (darkest)

BLUE
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #79b8ff (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #388bfd (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #1f6feb (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #0d419d (darkest)

PINK
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #f0b5d2 (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #d961a0 (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #bf4b8a (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #99286e (darkest)

PURPLE
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #cdb4ff (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #a371f7 (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #8957e5 (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #6e40c9 (darkest)

ORANGE
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #ffd699 (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #ffb347 (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #ff8c00 (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #cc5500 (darkest)

MONOCHROME
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #9e9e9e (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #757575 (medium)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #424242 (dark)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #212121 (darkest)

YlGnBu (Yellow-Green-Blue)
├─ grade0: ░░░░░░░░░░ #1F1F20
├─ grade1: ▓▓▓▓▓▓▓▓▓▓ #a1dab4 (light)
├─ grade2: ▓▓▓▓▓▓▓▓▓▓ #41b6c4 (cyan)
├─ grade3: ▓▓▓▓▓▓▓▓▓▓ #2c7fb8 (blue)
└─ grade4: ▓▓▓▓▓▓▓▓▓▓ #253494 (dark)
```

---

## 🔧 Key Data Structures

### GraphColorPalette Interface
```typescript
interface GraphColorPalette {
  name: string;           // Display name
  grade0: string;         // Empty/no activity
  grade1: string;         // Lightest activity
  grade2: string;         // Light activity
  grade3: string;         // Medium activity
  grade4: string;         // Darkest/most intense
}
```

### Intensity Levels
```
0 = No activity (grade0)
1 = Low activity (grade1)
2 = Medium activity (grade2)
3 = High activity (grade3)
4 = Very high activity (grade4)
```

---

## 🎯 Provider/Source Colors

### TUI Provider Detection
```
Model Name Pattern → Provider → Color
─────────────────────────────────────
claude, sonnet, opus, haiku → Anthropic → #FF6B35
gpt, o1, o3, codex → OpenAI → #10B981
gemini → Google → #3B82F6
deepseek → DeepSeek → #06B6D4
grok → XAI → #EAB308
llama, mixtral → Meta → #6366F1
cursor, auto → Cursor → #8B5CF6
(default) → Unknown → #FFFFFF
```

### Frontend Source Colors
```
opencode → #22c55e (Green)
claude → #f97316 (Orange)
codex → #3b82f6 (Blue)
gemini → #8b5cf6 (Purple)
cursor → #000000 (Black)
```

---

## 📁 File Locations

### Frontend
```
frontend/
├── src/
│   ├── lib/
│   │   ├── themes.ts              ← Color palettes
│   │   ├── useSettings.ts         ← Theme preferences
│   │   └── constants.ts           ← Source colors
│   ├── app/
│   │   └── globals.css            ← CSS variables
│   └── components/
│       ├── ThemeToggle.tsx        ← Theme switcher
│       ├── GraphControls.tsx      ← Palette selector
│       ├── TokenGraph2D.tsx       ← Graph rendering
│       ├── BreakdownPanel.tsx     ← Per-model colors
│       └── StatsPanel.tsx         ← Stats display
```

### TUI
```
packages/cli/src/tui/
├── config/
│   ├── themes.ts                  ← Color palettes
│   └── settings.ts                ← Settings persistence
├── utils/
│   └── colors.ts                  ← Provider colors
├── App.tsx                        ← Palette switching
└── components/
    ├── StatsView.tsx              ← Contribution grid
    └── Footer.tsx                 ← Palette display
```

---

## ⌨️ Keyboard Shortcuts

### TUI Theme Control
```
P     → Cycle to next palette
      → Saves to ~/.config/token-tracker/tui-settings.json
```

### Frontend Theme Control
```
Dropdown selector in GraphControls
Light/Dark/System toggle in ThemeToggle
```

---

## 💾 Settings Persistence

### Frontend
```
Storage: localStorage
Key: "token-tracker-settings"
Format: {
  theme: "light" | "dark" | "system",
  paletteName: ColorPaletteName
}
```

### TUI
```
Storage: File system
Path: ~/.config/token-tracker/tui-settings.json
Format: {
  colorPalette: string
}
```

---

## 🎨 Usage Examples

### Frontend - Using a Palette
```typescript
import { getPalette, getGradeColor } from "@/lib/themes";

const palette = getPalette("green");
const color = getGradeColor(palette, 3);  // #30a14e
```

### TUI - Using a Palette
```typescript
import { getPalette, getGradeColor } from "../config/themes.js";

const palette = getPalette("blue");
const color = getGradeColor(palette, 2);  // #388bfd
```

### TUI - Using Provider Colors
```typescript
import { getModelColor, getProviderFromModel } from "../utils/colors.js";

const color = getModelColor("claude-3-sonnet");  // #FF6B35
const provider = getProviderFromModel("gpt-4");  // "openai"
```

---

## 🔄 Intensity Calculation

### Formula
```
intensity = Math.min(4, Math.ceil((cost / maxCost) * 4))
```

### Example
```
If maxCost = $100:
  $0-25   → intensity 1 (grade1)
  $25-50  → intensity 2 (grade2)
  $50-75  → intensity 3 (grade3)
  $75-100 → intensity 4 (grade4)
```

---

## 🎯 Design Principles

1. **Consistency**: Same palettes across frontend and TUI
2. **Accessibility**: Sufficient contrast ratios
3. **Flexibility**: 9 different palettes for user preference
4. **Simplicity**: 5-grade intensity system
5. **Persistence**: User preferences saved locally

---

## 📊 Contribution Graph Specs

### Frontend (Canvas)
```
Grid: 7 days × 53 weeks
Cell size: 10×10 px
Margin: 2 px
Rendering: Canvas 2D
```

### TUI (Text)
```
Grid: 7 days × 52 weeks
Cell: Unicode block character (█)
Empty: Dot character (·)
Rendering: Text-based
```

---

## 🚀 Quick Start

### To Change Palette in TUI
```bash
# Press 'P' while running the TUI
# Cycles through: green → halloween → teal → blue → pink → purple → orange → monochrome → YlGnBu → green
```

### To Change Palette in Frontend
```
1. Click the palette dropdown in GraphControls
2. Select desired palette
3. Preference saved to localStorage
```

### To Add New Palette
```typescript
// In themes.ts
export const colorPalettes: Record<ColorPaletteName, GraphColorPalette> = {
  // ... existing palettes
  newPalette: {
    name: "New Palette",
    grade0: "#1F1F20",
    grade1: "#...",
    grade2: "#...",
    grade3: "#...",
    grade4: "#...",
  },
};
```

---

## 🔍 Debugging Tips

### Check Current Palette (TUI)
```
Look at footer: "p theme (Green)" shows current palette
```

### Check Saved Settings (TUI)
```bash
cat ~/.config/token-tracker/tui-settings.json
```

### Check Saved Settings (Frontend)
```javascript
// In browser console
localStorage.getItem("token-tracker-settings")
```

---

## 📝 Notes

- All palettes use the same empty color: `#1F1F20`
- Intensity is calculated from cost, not tokens
- Provider detection is case-insensitive
- Terminal true color (24-bit) required for full palette support
- Frontend uses CSS variables for additional theming

