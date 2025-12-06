# Token Tracker - Analysis Documentation Index

## 📚 Documentation Overview

This directory contains comprehensive analysis of the Token Tracker codebase. Three documents provide different levels of detail:

### 1. **ANALYSIS_SUMMARY.md** ⭐ START HERE
**Quick Reference Guide** - Best for getting a quick overview
- Executive summary of the project
- Key statistics and metrics
- Architecture at a glance
- CLI commands and API routes
- Development workflow
- **Read time**: 10-15 minutes

### 2. **CODEBASE_ANALYSIS.md** 📖 DETAILED REFERENCE
**Comprehensive Technical Analysis** - Best for understanding implementation details
- Complete project overview
- Detailed architecture breakdown
- Core functionality explanation
- All components and modules
- Data flow diagrams
- Performance characteristics
- Database schema
- **Read time**: 30-45 minutes

### 3. **ARCHITECTURE.md** 🏗️ VISUAL GUIDE
**Architecture Diagrams and Flows** - Best for visual learners
- System architecture diagram
- Component interaction diagrams
- Data flow visualizations
- Performance characteristics
- Deployment architecture
- Technology stack summary
- **Read time**: 15-20 minutes

---

## 🎯 Quick Navigation

### By Use Case

**I want to understand what Token Tracker does**
→ Read: ANALYSIS_SUMMARY.md (Section 1-2)

**I want to understand the architecture**
→ Read: ARCHITECTURE.md (System Architecture Diagram)

**I want to understand how the CLI works**
→ Read: CODEBASE_ANALYSIS.md (Section 3.2)

**I want to understand the Rust core**
→ Read: CODEBASE_ANALYSIS.md (Section 3.1)

**I want to understand the frontend**
→ Read: CODEBASE_ANALYSIS.md (Section 3.3)

**I want to understand the database**
→ Read: CODEBASE_ANALYSIS.md (Section 3.3 - Database Schema)

**I want to understand the data flow**
→ Read: ARCHITECTURE.md (Data Flow Diagrams)

**I want to deploy this**
→ Read: ANALYSIS_SUMMARY.md (Deployment section)

**I want to develop on this**
→ Read: ANALYSIS_SUMMARY.md (Development Workflow section)

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| Total Codebase | ~13,000 lines |
| CLI Layer | 5,656 lines (TypeScript) |
| Rust Core | ~2,500 lines |
| Frontend | ~5,000 lines (React/Next.js) |
| Performance Gain | 8.5x faster (Rust vs TypeScript) |
| Supported Platforms | 5 (OpenCode, Claude, Codex, Gemini, Cursor) |
| Database Tables | 6 |
| API Routes | 15+ |

---

## 🏗️ Architecture Summary

```
CLI (TypeScript)
    ↓
Pricing Fetcher (LiteLLM + cache)
    ↓
Rust Native Core (NAPI-RS)
    ├─ Scanner (parallel file discovery)
    ├─ Parser (SIMD JSON parsing)
    ├─ Session Parsers (5 platforms)
    ├─ Pricing Module (cost calculation)
    └─ Aggregator (parallel aggregation)
    ↓
Frontend (Next.js + React)
    ├─ Leaderboard
    ├─ User Profiles
    ├─ Local Viewer
    └─ Settings
    ↓
Database (PostgreSQL)
    ├─ Users
    ├─ Sessions
    ├─ Submissions
    └─ Leaderboard
```

---

## 🚀 Quick Start

### For Users
```bash
yarn install
yarn dev
token-tracker models
```

### For Developers
```bash
yarn install
yarn build:core
yarn dev
# Make changes
yarn build:core
```

### For Deployment
```bash
# Frontend
yarn build:frontend
# Deploy to Vercel

# CLI
npm publish
```

---

## 📋 File Organization

```
token-tracker/
├── ANALYSIS_SUMMARY.md          ← Executive summary
├── CODEBASE_ANALYSIS.md         ← Detailed analysis
├── ARCHITECTURE.md              ← Architecture diagrams
├── ANALYSIS_INDEX.md            ← This file
│
├── src/                         # TypeScript CLI
│   ├── cli.ts                   # Main entry point
│   ├── native.ts                # Rust bindings
│   ├── pricing.ts               # LiteLLM fetcher
│   ├── auth.ts                  # Authentication
│   ├── cursor.ts                # Cursor integration
│   └── ...
│
├── core/                        # Rust native module
│   ├── src/
│   │   ├── lib.rs               # NAPI exports
│   │   ├── scanner.rs           # File discovery
│   │   ├── parser.rs            # JSON parsing
│   │   ├── aggregator.rs        # Aggregation
│   │   ├── pricing.rs           # Cost calculation
│   │   └── sessions/            # Platform parsers
│   └── Cargo.toml
│
├── frontend/                    # Next.js web app
│   ├── src/
│   │   ├── app/                 # Pages
│   │   ├── components/          # React components
│   │   └── lib/                 # Utilities
│   └── package.json
│
└── benchmarks/                  # Performance tests
```

---

## 🔑 Key Concepts

### Unified Message Format
All platforms (OpenCode, Claude, Codex, Gemini, Cursor) are parsed into a unified format:
```rust
UnifiedMessage {
    source: String,           // "opencode", "claude", etc.
    model_id: String,         // "claude-3-5-sonnet"
    provider_id: String,      // "anthropic", "openai", etc.
    timestamp: i64,           // Unix milliseconds
    date: String,             // YYYY-MM-DD
    tokens: TokenBreakdown,   // input, output, cache_read, cache_write, reasoning
    cost: f64,                // Calculated cost
}
```

### Two-Phase Processing
1. **Phase 1**: Parse local sources (OpenCode, Claude, Codex, Gemini) in parallel
2. **Phase 2**: Fetch pricing and Cursor data in parallel
3. **Phase 3**: Combine and finalize with costs

This allows I/O operations to happen in parallel with CPU-bound work.

### Pricing System
- **Source**: LiteLLM GitHub repository
- **Cache**: `~/.cache/token-tracker/pricing.json` (1-hour TTL)
- **Features**: Input/output, cache read/write, reasoning tokens, tiered pricing

### Authentication
- **Web**: GitHub OAuth
- **CLI**: Device code flow
- **Storage**: `~/.config/token-tracker/` (XDG spec)

---

## 🎨 Technology Stack

### Frontend
- Next.js 16, React 19, Tailwind CSS 4
- Drizzle ORM, Zod validation
- Canvas API, obelisk.js (3D), GitHub Primer design

### Backend
- Commander.js (CLI), picocolors (colors), cli-table3 (tables)
- Node.js fetch API, crypto module

### Rust
- napi-rs (Node.js bindings), rayon (parallelism)
- simd-json (SIMD parsing), walkdir (file traversal)
- chrono (date/time), thiserror (error handling)

### Database
- PostgreSQL, Drizzle ORM, drizzle-kit (migrations)
- Neon or Vercel Postgres (hosting)

---

## 📈 Performance

### Rust Native Module Speedup
| Operation | TypeScript | Rust | Speedup |
|-----------|-----------|------|---------|
| File Discovery | ~500ms | ~50ms | **10x** |
| JSON Parsing | ~800ms | ~100ms | **8x** |
| Aggregation | ~200ms | ~25ms | **8x** |
| **Total** | **~1.5s** | **~175ms** | **8.5x** |

### Memory Usage
- TypeScript: ~150MB (full file buffering)
- Rust: ~85MB (streaming parsing)
- **Reduction**: ~45%

---

## 🔗 Related Resources

### Official Documentation
- [Token Tracker README](./README.md)
- [LiteLLM Pricing](https://github.com/BerriAI/litellm)
- [napi-rs Documentation](https://napi.rs/)

### Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Commander.js](https://github.com/tj/commander.js)

---

## ✅ Checklist for Understanding

- [ ] Read ANALYSIS_SUMMARY.md (10-15 min)
- [ ] Read ARCHITECTURE.md (15-20 min)
- [ ] Read CODEBASE_ANALYSIS.md (30-45 min)
- [ ] Explore the codebase structure
- [ ] Run `yarn dev` and test the CLI
- [ ] Run `yarn dev:frontend` and explore the web UI
- [ ] Read the source code for key modules:
  - [ ] `src/cli.ts` (CLI entry point)
  - [ ] `core/src/lib.rs` (Rust exports)
  - [ ] `frontend/src/app/(main)/page.tsx` (Leaderboard)

---

## 🤝 Contributing

To contribute to Token Tracker:

1. Understand the architecture (read these docs)
2. Set up development environment (`yarn install`)
3. Build native module (`yarn build:core`)
4. Make changes
5. Run tests (`cd core && yarn test:all`)
6. Submit pull request

---

## 📞 Questions?

Refer to the appropriate documentation:

- **What does this do?** → ANALYSIS_SUMMARY.md
- **How is it built?** → ARCHITECTURE.md
- **How does X work?** → CODEBASE_ANALYSIS.md
- **How do I deploy?** → ANALYSIS_SUMMARY.md (Deployment)
- **How do I develop?** → ANALYSIS_SUMMARY.md (Development Workflow)

---

**Last Updated**: December 6, 2025
**Documentation Version**: 1.0
**Codebase Version**: 1.0.0

---

## 📄 Document Statistics

| Document | Lines | Read Time | Focus |
|----------|-------|-----------|-------|
| ANALYSIS_SUMMARY.md | 400+ | 10-15 min | Overview |
| CODEBASE_ANALYSIS.md | 1,028 | 30-45 min | Details |
| ARCHITECTURE.md | 500+ | 15-20 min | Diagrams |
| **Total** | **1,928+** | **55-80 min** | Complete |

