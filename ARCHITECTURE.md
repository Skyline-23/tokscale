# Token Tracker - Architecture Deep Dive

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐          ┌──────────────────┐      ┌────────────────┐ │
│  │   CLI Terminal   │          │  Web Browser     │      │  Cursor IDE    │ │
│  │                  │          │                  │      │                │ │
│  │ $ token-tracker  │          │ leaderboard.com  │      │ Cursor Plugin  │ │
│  │   models         │          │ /local           │      │                │ │
│  │   --opencode     │          │ /u/[username]    │      │ Auto-sync      │ │
│  └────────┬─────────┘          └────────┬─────────┘      └────────┬───────┘ │
│           │                             │                         │         │
└───────────┼─────────────────────────────┼─────────────────────────┼─────────┘
            │                             │                         │
            ▼                             ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER (TypeScript)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         CLI Module (cli.ts)                          │   │
│  │  • Command parsing (Commander.js)                                    │   │
│  │  • Argument validation                                               │   │
│  │  • Output formatting                                                 │   │
│  │  • Error handling                                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Pricing Module (pricing.ts)                       │   │
│  │  • Fetch from LiteLLM                                                │   │
│  │  • Disk cache (~/.cache/token-tracker/pricing.json)                 │   │
│  │  • 1-hour TTL                                                        │   │
│  │  • Convert to PricingEntry[]                                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                  Authentication Module (auth.ts)                     │   │
│  │  • GitHub OAuth flow                                                 │   │
│  │  • Device code flow (CLI)                                            │   │
│  │  • Token storage (~/.config/token-tracker/)                          │   │
│  │  • Session management                                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   Cursor Integration (cursor.ts)                     │   │
│  │  • Cursor API authentication                                         │   │
│  │  • Usage data sync                                                   │   │
│  │  • CSV parsing                                                       │   │
│  │  • Local cache management                                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                  Native Module Bindings (native.ts)                  │   │
│  │  • Type definitions for Rust exports                                 │   │
│  │  • snake_case ↔ camelCase conversion                                 │   │
│  │  • Error handling                                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ pricing entries
                                    │ parsed messages
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE ENGINE (Rust Native Core)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Scanner Module (scanner.rs)                       │   │
│  │  • Parallel directory traversal (rayon + walkdir)                    │   │
│  │  • Scans 5 session directories:                                      │   │
│  │    - OpenCode: ~/.local/share/opencode/storage/message/              │   │
│  │    - Claude: ~/.claude/projects/                                     │   │
│  │    - Codex: ~/.codex/sessions/                                       │   │
│  │    - Gemini: ~/.gemini/tmp/*/chats/                                  │   │
│  │    - Cursor: ~/.token-tracker/cursor-cache/                          │   │
│  │  • Returns: ScanResult with file paths grouped by source              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Parser Module (parser.rs)                         │   │
│  │  • SIMD-accelerated JSON parsing (simd-json)                         │   │
│  │  • Two modes:                                                        │   │
│  │    - parse_json_file(): Single JSON file                             │   │
│  │    - parse_jsonl_file(): Line-delimited JSON (streaming)             │   │
│  │  • Gracefully skips malformed lines                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                  Session Parsers (sessions/*.rs)                     │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ OpenCode Parser │  │ Claude Parser   │  │ Codex Parser    │     │   │
│  │  │ (107 lines)     │  │ (JSONL format)  │  │ (Event-based)   │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                           │   │
│  │  │ Gemini Parser   │  │ Cursor Parser   │                           │   │
│  │  │ (155 lines)     │  │ (310 lines)     │                           │   │
│  │  └─────────────────┘  └─────────────────┘                           │   │
│  │                                                                       │   │
│  │  All convert to: UnifiedMessage {                                    │   │
│  │    source, model_id, provider_id, timestamp, date,                   │   │
│  │    tokens: {input, output, cache_read, cache_write, reasoning},      │   │
│  │    cost                                                              │   │
│  │  }                                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   Pricing Module (pricing.rs)                        │   │
│  │  • Receives pricing data from TypeScript                             │   │
│  │  • Fuzzy matching for model names                                    │   │
│  │  • Calculates costs with support for:                                │   │
│  │    - Input/output token pricing                                      │   │
│  │    - Cache read tokens (discounted)                                  │   │
│  │    - Cache write tokens                                              │   │
│  │    - Reasoning tokens (o1 models)                                    │   │
│  │    - Tiered pricing (above 200k tokens)                              │   │
│  │  • Pre-computed sorted keys for fast lookups                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                 Aggregator Module (aggregator.rs)                    │   │
│  │  • Parallel map-reduce aggregation (rayon)                           │   │
│  │  • Aggregates by:                                                    │   │
│  │    - Date (for contribution graphs)                                  │   │
│  │    - Model (for usage reports)                                       │   │
│  │    - Month (for monthly reports)                                     │   │
│  │  • Calculates:                                                       │   │
│  │    - Daily totals (tokens, cost, message count)                      │   │
│  │    - Intensity scores (0-4 based on cost)                            │   │
│  │    - Year summaries                                                  │   │
│  │    - Data statistics (active days, streaks, etc.)                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ GraphResult
                                    │ ModelReport
                                    │ MonthlyReport
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Next.js Frontend)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Pages (Next.js App Router)                   │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │  Leaderboard    │  │  User Profile   │  │  Local Viewer   │     │   │
│  │  │  (main page)    │  │  (/u/[user])    │  │  (/local)       │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                           │   │
│  │  │  Settings       │  │  Device Auth    │                           │   │
│  │  │  (/settings)    │  │  (/device)      │                           │   │
│  │  └─────────────────┘  └─────────────────┘                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      React Components                                │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ TokenGraph2D    │  │ TokenGraph3D    │  │ GraphControls   │     │   │
│  │  │ (Canvas 2D)     │  │ (obelisk.js 3D) │  │ (Filters)       │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ BreakdownPanel  │  │ StatsPanel      │  │ DataInput       │     │   │
│  │  │ (Daily details) │  │ (Statistics)    │  │ (JSON upload)   │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      API Routes (Next.js)                            │   │
│  │                                                                       │   │
│  │  Authentication:                                                     │   │
│  │  • POST /api/auth/github                                             │   │
│  │  • GET /api/auth/github/callback                                     │   │
│  │  • POST /api/auth/device                                             │   │
│  │  • POST /api/auth/device/poll                                        │   │
│  │  • GET /api/auth/session                                             │   │
│  │  • POST /api/auth/logout                                             │   │
│  │                                                                       │   │
│  │  Data:                                                               │   │
│  │  • POST /api/submit (Submit usage data)                              │   │
│  │  • GET /api/leaderboard (Get leaderboard)                            │   │
│  │  • GET /api/users/[username] (Get user profile)                      │   │
│  │                                                                       │   │
│  │  Settings:                                                           │   │
│  │  • GET /api/settings/tokens                                          │   │
│  │  • POST /api/settings/tokens                                         │   │
│  │  • DELETE /api/settings/tokens/[tokenId]                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL Database                               │   │
│  │                    (Drizzle ORM)                                     │   │
│  │                                                                       │   │
│  │  Tables:                                                             │   │
│  │  • users (GitHub OAuth)                                              │   │
│  │  • sessions (Auth tokens)                                            │   │
│  │  • apiTokens (API access)                                            │   │
│  │  • deviceCodes (CLI auth)                                            │   │
│  │  • submissions (User data)                                           │   │
│  │  • leaderboard (Materialized view)                                   │   │
│  │                                                                       │   │
│  │  Indexes:                                                            │   │
│  │  • idx_users_username                                                │   │
│  │  • idx_users_github_id                                               │   │
│  │  • idx_sessions_token                                                │   │
│  │  • idx_device_codes_device_code                                      │   │
│  │  • idx_submissions_user_id                                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    File System Caches                                │   │
│  │                                                                       │   │
│  │  • ~/.cache/token-tracker/pricing.json (1-hour TTL)                  │   │
│  │  • ~/.token-tracker/cursor-cache/*.csv (Cursor API data)             │   │
│  │  • ~/.config/token-tracker/credentials.json (Auth tokens)            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. CLI Usage Flow

```
User Input
    │
    ├─ token-tracker models --opencode --since 2024-01-01
    │
    ▼
CLI Parser (cli.ts)
    │
    ├─ Parse command: "models"
    ├─ Parse options: {opencode: true, since: "2024-01-01"}
    │
    ▼
Pricing Fetcher (pricing.ts)
    │
    ├─ Check cache: ~/.cache/token-tracker/pricing.json
    ├─ If expired or missing:
    │  └─ Fetch from LiteLLM GitHub
    ├─ Save to cache
    │
    ▼
Native Module Call (native.ts)
    │
    ├─ Call: get_model_report({
    │    sources: ["opencode"],
    │    since: "2024-01-01",
    │    pricing: PricingEntry[]
    │  })
    │
    ▼
Rust Core (lib.rs)
    │
    ├─ Scanner: Scan ~/.local/share/opencode/storage/message/
    ├─ Parser: Parse JSON files (SIMD)
    ├─ Filter: Keep only since 2024-01-01
    ├─ Aggregator: Group by model
    ├─ Pricing: Calculate costs
    │
    ▼
ModelReport
    │
    ├─ entries: [
    │    {source, model, provider, input, output, cache_read, cache_write, reasoning, message_count, cost},
    │    ...
    │  ]
    ├─ total_input, total_output, total_cost, processing_time_ms
    │
    ▼
Table Formatter (table.ts)
    │
    ├─ Format with colors
    ├─ Calculate dynamic column widths
    ├─ Add thousands separators
    ├─ Format currency
    │
    ▼
Terminal Output
    │
    └─ Display formatted table
```

### 2. Graph Export Flow

```
User Input
    │
    └─ token-tracker graph --output data.json --year 2024
    │
    ▼
Pricing Fetcher
    │
    └─ Fetch/cache pricing data
    │
    ▼
Native Module Call
    │
    └─ Call: generate_graph_with_pricing({
         year: "2024",
         pricing: PricingEntry[]
       })
    │
    ▼
Rust Core
    │
    ├─ Scan all 5 sources
    ├─ Parse all files (parallel)
    ├─ Filter by year 2024
    ├─ Aggregate by date
    ├─ Calculate intensities
    ├─ Generate year summaries
    │
    ▼
GraphResult
    │
    ├─ meta: {generated_at, version, date_range, processing_time_ms}
    ├─ summary: {total_tokens, total_cost, active_days, ...}
    ├─ years: [{year, total_tokens, total_cost, range_start, range_end}]
    ├─ contributions: [
    │    {date, totals, intensity, token_breakdown, sources: [{source, model, tokens, cost, messages}]}
    │  ]
    │
    ▼
Graph Converter (graph.ts)
    │
    ├─ Convert to frontend format
    ├─ Calculate statistics (streaks, best day, etc.)
    │
    ▼
JSON Serialization
    │
    └─ Write to data.json
```

### 3. Submission Flow

```
User Input
    │
    └─ token-tracker submit
    │
    ▼
Auth Check (auth.ts)
    │
    ├─ Load token from ~/.config/token-tracker/
    ├─ Verify token is valid
    │
    ▼
Pricing Fetcher
    │
    └─ Fetch pricing data
    │
    ▼
Native Module Call
    │
    └─ Call: get_model_report({...})
    │
    ▼
Data Validation (submit.ts)
    │
    ├─ Check totals match
    ├─ Verify no negative values
    ├─ Validate date range
    ├─ Check for duplicates
    │
    ▼
HTTP Request
    │
    └─ POST /api/submit {
         totalTokens, totalCost, inputTokens, outputTokens,
         cacheReadTokens, cacheWriteTokens, reasoningTokens,
         messageCount, sources, models, dateRange
       }
    │
    ▼
Backend Validation
    │
    ├─ Verify user is authenticated
    ├─ Validate data schema
    ├─ Check for duplicates
    │
    ▼
Database Insert
    │
    ├─ Insert into submissions table
    ├─ Update leaderboard view
    │
    ▼
Success Response
    │
    └─ Return user profile URL
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Commands                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  models ──┐                                                       │
│  monthly ─┼─→ Pricing Fetcher ──→ Native Module ──→ Table Format │
│  graph ───┤                                                       │
│  submit ──┤                                                       │
│           │                                                       │
│           └─→ Auth Module ──→ HTTP Client ──→ Backend API        │
│                                                                   │
│  login ───┐                                                       │
│  logout ──┼─→ Auth Module ──→ HTTP Client ──→ Backend API        │
│  whoami ──┘                                                       │
│                                                                   │
│  cursor ──→ Cursor Integration ──→ Cursor API ──→ Local Cache    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

### Rust Native Module Speedup

```
Operation              TypeScript    Rust Native    Speedup
─────────────────────────────────────────────────────────────
File Discovery         ~500ms        ~50ms          10x
JSON Parsing           ~800ms        ~100ms         8x
Aggregation            ~200ms        ~25ms          8x
─────────────────────────────────────────────────────────────
Total                  ~1.5s         ~175ms         8.5x
```

*Benchmarks for ~1000 session files, 100k messages*

### Memory Usage

- **TypeScript**: ~150MB (full file buffering)
- **Rust**: ~85MB (streaming parsing, zero-copy)
- **Reduction**: ~45%

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Machine                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CLI (token-tracker)                                          │
│  ├─ Reads from ~/.local/share/opencode/                      │
│  ├─ Reads from ~/.claude/                                    │
│  ├─ Reads from ~/.codex/                                     │
│  ├─ Reads from ~/.gemini/                                    │
│  ├─ Reads from ~/.token-tracker/cursor-cache/                │
│  └─ Caches to ~/.cache/token-tracker/                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Next.js App                                                  │
│  ├─ Leaderboard page                                         │
│  ├─ User profiles                                            │
│  ├─ Local viewer                                             │
│  ├─ Settings                                                 │
│  └─ API routes                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon / Vercel Postgres (Database)               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PostgreSQL                                                   │
│  ├─ users                                                    │
│  ├─ sessions                                                 │
│  ├─ submissions                                              │
│  ├─ leaderboard (view)                                       │
│  └─ indexes                                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Stack                             │
├─────────────────────────────────────────────────────────────┤
│  Framework:     Next.js 16                                    │
│  UI Library:    React 19                                      │
│  Styling:       Tailwind CSS 4                                │
│  ORM:           Drizzle ORM                                   │
│  Validation:    Zod                                           │
│  Visualization: Canvas API, obelisk.js                        │
│  Animations:    Framer Motion                                 │
│  Design:        GitHub Primer                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Backend Stack                              │
├─────────────────────────────────────────────────────────────┤
│  CLI Framework: Commander.js                                  │
│  Colors:        picocolors                                    │
│  Tables:        cli-table3                                    │
│  HTTP:          Node.js fetch API                             │
│  Crypto:        Node.js crypto                                │
│  File I/O:      Node.js fs                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Rust Stack                                 │
├─────────────────────────────────────────────────────────────┤
│  Bindings:      napi-rs                                       │
│  Parallelism:   rayon                                         │
│  JSON:          simd-json, serde_json                         │
│  File I/O:      walkdir, std::fs                              │
│  Date/Time:     chrono                                        │
│  Errors:        thiserror, anyhow                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Database Stack                             │
├─────────────────────────────────────────────────────────────┤
│  Database:      PostgreSQL                                    │
│  ORM:           Drizzle ORM                                   │
│  Migrations:    drizzle-kit                                   │
│  Hosting:       Neon / Vercel Postgres                        │
└─────────────────────────────────────────────────────────────┘
```

