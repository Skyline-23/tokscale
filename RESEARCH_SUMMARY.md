# Frontend Theming Research - Executive Summary

## 📋 Overview

This research documents the complete theming implementation across the token-tracker project, covering both the Next.js frontend and the CLI TUI. The goal is to provide a comprehensive guide for understanding and extending the color system.

## 🎯 Key Findings

### 1. **Unified Color Palette System**
- **9 distinct color palettes** available for contribution graphs
- **5-grade intensity system** (0-4) for data visualization
- **Consistent structure** across frontend and TUI
- **Already synchronized** between frontend and TUI

### 2. **Provider/Source Color Mapping**
- **Frontend**: 5 source types with dedicated colors
- **TUI**: 8 provider types with intelligent model detection
- **Pattern-based detection** for automatic provider identification
- **Fallback to unknown** for unrecognized models

### 3. **Settings Persistence**
- **Frontend**: localStorage with light/dark/system theme preference
- **TUI**: File-based settings in `~/.config/token-tracker/tui-settings.json`
- **Keyboard-driven**: Press 'P' in TUI to cycle palettes
- **Dropdown selector**: In frontend GraphControls

### 4. **Contribution Graph Implementation**
- **Frontend**: Canvas-based 7×53 grid with interactive features
- **TUI**: Text-based 7×52 grid using Unicode characters
- **Same intensity calculation**: Cost-based 0-4 mapping
- **Consistent visual hierarchy**: Light to dark progression

## 📊 Color Palette Summary

| Palette | Use Case | Vibe |
|---------|----------|------|
| **Green** | Default, GitHub-inspired | Natural, familiar |
| **Halloween** | High contrast, festive | Bold, energetic |
| **Teal** | Modern, cool | Contemporary, calm |
| **Blue** | Professional | Trustworthy, stable |
| **Pink** | Vibrant | Energetic, creative |
| **Purple** | Sophisticated | Creative, elegant |
| **Orange** | Warm | Energetic, friendly |
| **Monochrome** | Accessible | Minimal, universal |
| **YlGnBu** | Scientific | Colorblind-friendly |

## 🔑 Key Components

### Frontend Theming Architecture
```
themes.ts (Color definitions)
    ↓
useSettings.ts (Preference management)
    ↓
GraphControls.tsx (Palette selector)
    ↓
TokenGraph2D.tsx (Graph rendering)
    ↓
BreakdownPanel.tsx (Per-model colors)
    ↓
StatsPanel.tsx (Statistics display)
```

### TUI Theming Architecture
```
config/themes.ts (Color definitions)
    ↓
config/settings.ts (Preference persistence)
    ↓
App.tsx (Palette switching)
    ↓
StatsView.tsx (Contribution grid)
    ↓
Footer.tsx (Palette display)
```

## 💡 Design Patterns

### Pattern 1: Grade-Based Intensity
```typescript
// All palettes follow this structure
grade0: empty color
grade1: lightest activity
grade2: light activity
grade3: medium activity
grade4: darkest/most intense
```

### Pattern 2: Provider Detection
```typescript
// Model name → Provider → Color
// Case-insensitive pattern matching
// Fallback to "unknown" provider
```

### Pattern 3: Settings Persistence
```typescript
// Frontend: localStorage
// TUI: ~/.config/token-tracker/tui-settings.json
// Both use JSON format
```

### Pattern 4: Keyboard-First Control
```typescript
// Frontend: Dropdown selector
// TUI: 'P' key to cycle palettes
// Both save preferences automatically
```

## 📁 Critical Files

### Must Know
- `frontend/src/lib/themes.ts` - Color palette definitions
- `packages/cli/src/tui/config/themes.ts` - TUI palettes (synced)
- `frontend/src/lib/constants.ts` - Source colors
- `packages/cli/src/tui/utils/colors.ts` - Provider colors

### Important
- `frontend/src/lib/useSettings.ts` - Theme preference hook
- `packages/cli/src/tui/config/settings.ts` - Settings persistence
- `frontend/src/components/GraphControls.tsx` - Palette selector
- `packages/cli/src/tui/App.tsx` - Palette switching logic

### Reference
- `frontend/src/app/globals.css` - CSS variables
- `frontend/src/components/TokenGraph2D.tsx` - Graph rendering
- `packages/cli/src/tui/components/StatsView.tsx` - TUI grid

## 🚀 Implementation Status

### ✅ Already Implemented
- [x] 9 color palettes in both frontend and TUI
- [x] Palette switching mechanism (keyboard + UI)
- [x] Settings persistence (localStorage + file)
- [x] Provider color detection
- [x] Contribution grid visualization
- [x] Intensity calculation system

### 🔄 Recommended Enhancements
- [ ] Add light/dark theme preference to TUI
- [ ] Enhance provider detection for new models
- [ ] Add color legend/reference in UI
- [ ] Per-model color highlighting in ModelView
- [ ] Palette preview in Footer
- [ ] Color accessibility audit

## 📈 Color Value Reference

### All Palette Colors (Quick Lookup)
```
Green:      #1F1F20 → #9be9a8 → #40c463 → #30a14e → #216e39
Halloween:  #1F1F20 → #FFEE4A → #FFC501 → #FE9600 → #03001C
Teal:       #1F1F20 → #7ee5e5 → #2dc5c5 → #0d9e9e → #0e6d6d
Blue:       #1F1F20 → #79b8ff → #388bfd → #1f6feb → #0d419d
Pink:       #1F1F20 → #f0b5d2 → #d961a0 → #bf4b8a → #99286e
Purple:     #1F1F20 → #cdb4ff → #a371f7 → #8957e5 → #6e40c9
Orange:     #1F1F20 → #ffd699 → #ffb347 → #ff8c00 → #cc5500
Monochrome: #1F1F20 → #9e9e9e → #757575 → #424242 → #212121
YlGnBu:     #1F1F20 → #a1dab4 → #41b6c4 → #2c7fb8 → #253494
```

### Provider Colors
```
Anthropic: #FF6B35    OpenAI: #10B981    Google: #3B82F6
Cursor: #8B5CF6       OpenCode: #6B7280  DeepSeek: #06B6D4
XAI: #EAB308          Meta: #6366F1      Unknown: #FFFFFF
```

## 🎨 Design Principles

1. **Consistency**: Same palettes across all interfaces
2. **Accessibility**: Sufficient contrast for readability
3. **Flexibility**: Multiple palettes for user preference
4. **Simplicity**: 5-grade system is intuitive
5. **Persistence**: User preferences are remembered
6. **Keyboard-First**: TUI uses keyboard shortcuts
7. **Progressive**: Light to dark intensity progression

## 🔍 Key Insights

### Frontend Advantages
- CSS variables for global theming
- React hooks for state management
- localStorage for persistence
- Canvas rendering for performance
- Responsive design support

### TUI Advantages
- File-based settings (no browser dependency)
- Keyboard-driven interface
- Terminal-native rendering
- Lightweight and fast
- Works in any terminal

### Shared Strengths
- Identical color palettes
- Same intensity calculation
- Consistent user experience
- Easy to extend
- Well-documented

## 🛠️ Technical Details

### Intensity Calculation
```
intensity = Math.min(4, Math.ceil((cost / maxCost) * 4))
```

### Provider Detection (TUI)
```
Pattern matching on model ID (case-insensitive)
Regex patterns for common model names
Fallback to "unknown" provider
```

### Color Application
```
Frontend: Direct hex colors in styles
TUI: 24-bit true color support (modern terminals)
Both: Fallback to 256-color mode if needed
```

## 📚 Documentation Files

1. **FRONTEND_THEMING_RESEARCH.md** (16 sections)
   - Comprehensive technical documentation
   - Code examples and patterns
   - File references and locations
   - Implementation checklist

2. **THEMING_QUICK_REFERENCE.md** (Quick lookup)
   - Visual palette comparisons
   - Color value tables
   - File locations
   - Usage examples
   - Debugging tips

3. **RESEARCH_SUMMARY.md** (This file)
   - Executive overview
   - Key findings
   - Implementation status
   - Design principles

## 🎯 Next Steps

1. **Review** the comprehensive research document
2. **Identify** any additional color needs
3. **Test** palettes in different terminal emulators
4. **Plan** UI enhancements
5. **Document** any terminal-specific limitations
6. **Implement** recommended enhancements

## 📞 Questions to Consider

1. Should we add light/dark theme preference to TUI?
2. Do we need additional provider colors?
3. Should we unify SOURCE_COLORS and PROVIDER_COLORS?
4. Are there accessibility concerns with current palettes?
5. Should we add color preview/legend in UI?
6. Do we need per-model color highlighting?

## ✨ Conclusion

The token-tracker project has a well-designed, consistent theming system that spans both web and terminal interfaces. The color palettes are thoughtfully chosen, the intensity system is intuitive, and the implementation is clean and maintainable. The system is ready for extension and enhancement.

---

**Research Date**: December 2024
**Scope**: Frontend (Next.js) + TUI (OpenTUI/Solid.js)
**Status**: Complete and documented
**Recommendation**: Ready for implementation of enhancements

