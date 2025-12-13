# Theming Research Documentation Index

## 📚 Complete Research Package

This package contains comprehensive documentation of the token-tracker theming system, covering both the Next.js frontend and the CLI TUI.

---

## 📖 Documents Included

### 1. **RESEARCH_SUMMARY.md** ⭐ START HERE
**Purpose**: Executive overview and quick reference
**Length**: ~8 KB
**Best For**: Getting a quick understanding of the theming system

**Contents**:
- Key findings and overview
- Color palette summary table
- Architecture diagrams
- Implementation status checklist
- Design principles
- Critical files list
- Next steps and recommendations

**Read this first** if you want a high-level understanding.

---

### 2. **FRONTEND_THEMING_RESEARCH.md** 📖 COMPREHENSIVE GUIDE
**Purpose**: Detailed technical documentation
**Length**: ~19 KB
**Best For**: Deep understanding and implementation

**Contents** (16 sections):
1. Contribution Graph Color Palettes
2. Per-Source/Provider Color Mapping
3. Theme Preference System
4. Frontend Theming Architecture
5. Contribution Graph Implementation
6. Palette Switching Mechanism
7. Intensity Calculation
8. Theme Toggle Component
9. Breakdown Panel (Per-Model Colors)
10. Stats Panel
11. Key Patterns for TUI Adaptation
12. Color Palette Recommendations for TUI
13. Implementation Checklist
14. File Reference Guide
15. Color Value Reference Table
16. Next Steps

**Read this** for complete technical details and code examples.

---

### 3. **THEMING_QUICK_REFERENCE.md** 🚀 QUICK LOOKUP
**Purpose**: Fast reference for colors and usage
**Length**: ~8.6 KB
**Best For**: Quick lookups while coding

**Contents**:
- Visual palette comparisons
- Key data structures
- Provider/source colors
- File locations
- Keyboard shortcuts
- Settings persistence
- Usage examples
- Intensity calculation formula
- Design principles
- Debugging tips

**Use this** when you need to quickly find a color value or file location.

---

## 🎯 How to Use This Package

### Scenario 1: "I need to understand the theming system"
1. Read **RESEARCH_SUMMARY.md** (5 min)
2. Skim **FRONTEND_THEMING_RESEARCH.md** sections 1-3 (10 min)
3. Reference **THEMING_QUICK_REFERENCE.md** as needed

### Scenario 2: "I need to add a new color palette"
1. Check **THEMING_QUICK_REFERENCE.md** for structure
2. Read **FRONTEND_THEMING_RESEARCH.md** section 1
3. Follow the pattern in `frontend/src/lib/themes.ts`

### Scenario 3: "I need to implement a feature using colors"
1. Find relevant section in **FRONTEND_THEMING_RESEARCH.md**
2. Look up color values in **THEMING_QUICK_REFERENCE.md**
3. Check file locations in **RESEARCH_SUMMARY.md**

### Scenario 4: "I need to debug a color issue"
1. Check **THEMING_QUICK_REFERENCE.md** debugging section
2. Verify settings in **RESEARCH_SUMMARY.md**
3. Review implementation in **FRONTEND_THEMING_RESEARCH.md**

---

## 🔍 Quick Navigation

### By Topic

**Color Palettes**
- RESEARCH_SUMMARY.md → Color Palette Summary
- THEMING_QUICK_REFERENCE.md → Color Palettes at a Glance
- FRONTEND_THEMING_RESEARCH.md → Section 1

**Provider/Source Colors**
- RESEARCH_SUMMARY.md → Color Value Reference
- THEMING_QUICK_REFERENCE.md → Provider/Source Colors
- FRONTEND_THEMING_RESEARCH.md → Section 2

**Settings & Persistence**
- RESEARCH_SUMMARY.md → Key Findings
- THEMING_QUICK_REFERENCE.md → Settings Persistence
- FRONTEND_THEMING_RESEARCH.md → Section 3

**File Locations**
- RESEARCH_SUMMARY.md → Critical Files
- THEMING_QUICK_REFERENCE.md → File Locations
- FRONTEND_THEMING_RESEARCH.md → Section 14

**Implementation Details**
- RESEARCH_SUMMARY.md → Implementation Status
- THEMING_QUICK_REFERENCE.md → Usage Examples
- FRONTEND_THEMING_RESEARCH.md → Sections 4-10

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| Color Palettes | 9 |
| Intensity Grades | 5 (0-4) |
| Provider Types | 8 |
| Source Types | 5 |
| Frontend Files | 9 |
| TUI Files | 6 |
| Total Documentation | ~36 KB |

---

## 🎨 Color Palette Overview

All 9 palettes at a glance:

```
1. Green       - GitHub-inspired (default)
2. Halloween   - High contrast, festive
3. Teal        - Modern, cool
4. Blue        - Professional
5. Pink        - Vibrant
6. Purple      - Sophisticated
7. Orange      - Warm
8. Monochrome  - Accessible
9. YlGnBu      - Scientific
```

---

## 📁 File Structure

```
token-tracker/
├── RESEARCH_SUMMARY.md                    ← Start here
├── FRONTEND_THEMING_RESEARCH.md           ← Comprehensive guide
├── THEMING_QUICK_REFERENCE.md             ← Quick lookup
├── THEMING_RESEARCH_INDEX.md              ← This file
│
├── frontend/
│   └── src/
│       ├── lib/
│       │   ├── themes.ts                  ← Color palettes
│       │   ├── useSettings.ts             ← Theme preferences
│       │   └── constants.ts               ← Source colors
│       ├── app/
│       │   └── globals.css                ← CSS variables
│       └── components/
│           ├── ThemeToggle.tsx            ← Theme switcher
│           ├── GraphControls.tsx          ← Palette selector
│           ├── TokenGraph2D.tsx           ← Graph rendering
│           ├── BreakdownPanel.tsx         ← Per-model colors
│           └── StatsPanel.tsx             ← Statistics
│
└── packages/cli/src/tui/
    ├── config/
    │   ├── themes.ts                      ← Color palettes
    │   └── settings.ts                    ← Settings persistence
    ├── utils/
    │   └── colors.ts                      ← Provider colors
    ├── App.tsx                            ← Palette switching
    └── components/
        ├── StatsView.tsx                  ← Contribution grid
        └── Footer.tsx                     ← Palette display
```

---

## 🚀 Quick Start Commands

### View Current Palette (TUI)
```bash
cat ~/.config/token-tracker/tui-settings.json
```

### Change Palette (TUI)
```bash
# Press 'P' while running the TUI
```

### View All Palettes
```bash
# See THEMING_QUICK_REFERENCE.md → Color Palettes at a Glance
```

### Find a Color Value
```bash
# See THEMING_QUICK_REFERENCE.md → Color Value Reference Table
```

---

## 💡 Key Concepts

### 1. Grade-Based Intensity
- **grade0**: Empty/no activity
- **grade1-4**: Progressive intensity levels
- **Calculation**: `Math.min(4, Math.ceil((cost / maxCost) * 4))`

### 2. Provider Detection
- Pattern matching on model ID
- Case-insensitive
- Fallback to "unknown"

### 3. Settings Persistence
- **Frontend**: localStorage
- **TUI**: `~/.config/token-tracker/tui-settings.json`

### 4. Keyboard Control
- **TUI**: Press 'P' to cycle palettes
- **Frontend**: Dropdown selector

---

## ✅ Implementation Checklist

### Already Done ✓
- [x] 9 color palettes defined
- [x] Palette switching implemented
- [x] Settings persistence working
- [x] Provider color detection
- [x] Contribution grid visualization
- [x] Intensity calculation

### Recommended Next Steps
- [ ] Add light/dark theme to TUI
- [ ] Enhance provider detection
- [ ] Add color legend in UI
- [ ] Per-model color highlighting
- [ ] Palette preview in footer
- [ ] Accessibility audit

---

## 🔗 Cross-References

### From RESEARCH_SUMMARY.md
- See FRONTEND_THEMING_RESEARCH.md for detailed code examples
- See THEMING_QUICK_REFERENCE.md for color values

### From FRONTEND_THEMING_RESEARCH.md
- See THEMING_QUICK_REFERENCE.md for quick color lookups
- See RESEARCH_SUMMARY.md for implementation status

### From THEMING_QUICK_REFERENCE.md
- See FRONTEND_THEMING_RESEARCH.md for detailed explanations
- See RESEARCH_SUMMARY.md for architecture overview

---

## 📞 Common Questions

**Q: Where are the color palettes defined?**
A: `frontend/src/lib/themes.ts` and `packages/cli/src/tui/config/themes.ts`

**Q: How do I change the palette in TUI?**
A: Press 'P' to cycle through palettes

**Q: Where are settings saved?**
A: Frontend: localStorage | TUI: `~/.config/token-tracker/tui-settings.json`

**Q: How many palettes are there?**
A: 9 palettes with 5 intensity grades each

**Q: How is intensity calculated?**
A: Based on cost relative to maximum cost in dataset

**Q: Can I add a new palette?**
A: Yes, follow the pattern in `themes.ts`

---

## 📝 Document Metadata

| Document | Size | Sections | Last Updated |
|----------|------|----------|--------------|
| RESEARCH_SUMMARY.md | 8.3 KB | 15 | Dec 2024 |
| FRONTEND_THEMING_RESEARCH.md | 19 KB | 16 | Dec 2024 |
| THEMING_QUICK_REFERENCE.md | 8.6 KB | 16 | Dec 2024 |
| THEMING_RESEARCH_INDEX.md | This file | - | Dec 2024 |

---

## 🎯 Recommended Reading Order

1. **First Time?** → RESEARCH_SUMMARY.md (5 min)
2. **Need Details?** → FRONTEND_THEMING_RESEARCH.md (20 min)
3. **Quick Lookup?** → THEMING_QUICK_REFERENCE.md (as needed)
4. **Implementing?** → Relevant sections + code files

---

## 🔄 How to Update This Documentation

When making changes to theming:
1. Update the relevant code files
2. Update FRONTEND_THEMING_RESEARCH.md with details
3. Update THEMING_QUICK_REFERENCE.md with quick reference
4. Update RESEARCH_SUMMARY.md if major changes
5. Update this index if structure changes

---

## ✨ Summary

This research package provides complete documentation of the token-tracker theming system. Whether you need a quick color lookup or a deep dive into the architecture, you'll find what you need in these documents.

**Start with RESEARCH_SUMMARY.md** for a quick overview, then dive into the other documents as needed.

---

**Package Created**: December 2024
**Scope**: Frontend (Next.js) + TUI (OpenTUI/Solid.js)
**Status**: Complete and ready for use
**Maintainer**: Research Team

