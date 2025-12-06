# Token Tracker - Comprehensive Codebase Analysis

## 1. PROJECT OVERVIEW

**Token Tracker** is a high-performance CLI tool and web visualization dashboard for tracking AI coding assistant token usage and costs across multiple platforms.

### Problem Statement
Developers using multiple AI coding assistants (Claude Code, OpenCode, Codex, Gemini, Cursor) need a unified way to:
- Track token consumption across all platforms
- Calculate real-time costs using current pricing models
- Visualize usage patterns over time
- Share and compare usage with other developers on a social platform

### Key Features
- **Multi-platform support**: OpenCode, Claude Code, Codex CLI, Gemini CLI, Cursor IDE
- **Real-time pricing**: Fetches from LiteLLM with 1-hour disk cache
- **Native Rust core**: 8-10x faster processing than pure TypeScript
- **GitHub-style visualization**: 2D contribution calendar + 3D isometric graphs
- **Social platform**: Leaderboards, user profiles, public submissions
- **Flexible filtering**: By platform, date range, year
- **Export to JSON**: For external visualization tools

---

## 2. ARCHITECTURE OVERVIEW

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    TypeScript CLI Layer                      │
│  • Commander.js for CLI parsing                              │
│  • Pricing fetcher (LiteLLM with disk cache)                 │
│  • Output formatting (tables, colors)                        │
│  • Authentication (GitHub OAuth, device code flow)           │
│  • Cursor IDE integration                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ pricing entries
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Rust Native Core (napi-rs)                  │
│  • Parallel file scanning (rayon)                            │
│  • SIMD JSON parsing (simd-json)                             │
│  • Cost calculation with pricing data                        │
│  • Parallel aggregation by model/month/day                   │
│  • Session parsers for 5 platforms                           │
└─────────────────────────────────────────────────────────────┘
                      │ graph data
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (React 19)                     │
│  • GitHub-style contribution graphs (2D + 3D)               │
│  • Leaderboard and user profiles                             │
│  • Local viewer for private data                             │
│  • GitHub Primer design system                               │
│  • Dark/Light/System theme toggle                            │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Drizzle ORM)               │
│  • Users (GitHub OAuth)                                      │
│  • Submissions (token usage data)                            │
│  • Sessions (auth tokens)                                    │
│  • API tokens (for programmatic access)                      │
│  • Device codes (for CLI auth)                               │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
token-tracker/
├── src/                          # TypeScript CLI (5.6K lines)
│   ├── cli.ts                    # Commander.js entry point (826 lines)
│   ├── native.ts                 # Rust module bindings (607 lines)
│   ├── pricing.ts                # LiteLLM pricing fetcher (213 lines)
│   ├── graph.ts                  # Graph data generation (511 lines)
│   ├── table.ts                  # Terminal table rendering (233 lines)
│   ├── auth.ts                   # GitHub OAuth + device code (211 lines)
│   ├── submit.ts                 # Data submission to platform (176 lines)
│   ├── cursor.ts                 # Cursor IDE integration (503 lines)
│   ├── claudecode.ts             # Claude Code parser (485 lines)
│   ├── gemini.ts                 # Gemini CLI parser (193 lines)
│   ├── opencode.ts               # OpenCode parser (117 lines)
│   ├── spinner.ts                # CLI spinner animation (283 lines)
│   └── credentials.ts            # Credential management (123 lines)
│
├── core/                         # Rust Native Module
│   ├── src/
│   │   ├── lib.rs                # NAPI exports (1371 lines)
│   │   ├── scanner.rs            # Parallel file discovery
│   │   ├── parser.rs             # SIMD JSON parsing
│   │   ├── aggregator.rs         # Parallel aggregation
│   │   ├── pricing.rs            # Cost calculation
│   │   └── sessions/             # Platform-specific parsers
│   │       ├── mod.rs            # Unified message format
│   │       ├── opencode.rs       # OpenCode parser (107 lines)
│   │       ├── claudecode.rs     # Claude Code parser
│   │       ├── codex.rs          # Codex CLI parser
│   │       ├── cursor.rs         # Cursor IDE parser (310 lines)
│   │       └── gemini.rs         # Gemini CLI parser (155 lines)
│   ├── Cargo.toml
│   └── package.json
│
├── frontend/                     # Next.js Web App
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   │   ├── (main)/page.tsx   # Leaderboard
│   │   │   ├── local/page.tsx    # Local viewer
│   │   │   ├── u/[username]/     # User profiles
│   │   │   ├── settings/         # User settings
│   │   │   ├── device/           # Device code auth
│   │   │   └── api/              # API routes
│   │   ├── components/           # React components
│   │   │   ├── TokenGraph2D.tsx  # 2D contribution graph
│   │   │   ├── TokenGraph3D.tsx  # 3D isometric graph
│   │   │   ├── GraphControls.tsx # Filter controls
│   │   │   ├── BreakdownPanel.tsx# Daily breakdown
│   │   │   ├── StatsPanel.tsx    # Statistics
│   │   │   ├── DataInput.tsx     # JSON upload
│   │   │   └── layout/           # Navigation, footer
│   │   └── lib/
│   │       ├── db/
│   │       │   ├── schema.ts     # Drizzle ORM schema
│   │       │   └── index.ts      # DB client
│   │       ├── auth/             # Auth utilities
│   │       ├── providers/        # Theme, auth providers
│   │       └── types.ts          # TypeScript types
│   ├── drizzle.config.ts         # Drizzle ORM config
│   ├── middleware.ts             # Auth middleware
│   └── package.json
│
├── benchmarks/                   # Performance benchmarks
│   ├── runner.ts                 # Benchmark harness
│   └── generate.ts               # Synthetic data generator
│
└── docs/                         # Documentation
    ├── PERFORMANCE_OPTIMIZATION.md
    ├── PRIMER_RESEARCH.md
    └── SOCIAL_PLATFORM.md
```

---

## 3. CORE FUNCTIONALITY

### 3.1 Rust Native Module (`core/`)

The Rust core is the performance engine, handling all heavy computation via NAPI-RS bindings.

#### Key Components

**1. Scanner (`scanner.rs`)**
- Parallel directory traversal using `walkdir` + `rayon`
- Scans 5 session directories:
  - OpenCode: `~/.local/share/opencode/storage/message/`
  - Claude Code: `~/.claude/projects/`
  - Codex: `~/.codex/sessions/`
  - Gemini: `~/.gemini/tmp/*/chats/`
  - Cursor: `~/.token-tracker/cursor-cache/` (cached from API)
- Returns `ScanResult` with file paths grouped by source

**2. Parser (`parser.rs`)**
- SIMD-accelerated JSON parsing using `simd-json`
- Two modes:
  - `parse_json_file()`: Single JSON file
  - `parse_jsonl_file()`: Line-delimited JSON (streaming)
- Gracefully skips malformed lines

**3. Session Parsers (`sessions/*.rs`)**

Each platform has a custom parser that converts to `UnifiedMessage`:

```rust
pub struct UnifiedMessage {
    pub source: String,           // "opencode", "claude", etc.
    pub model_id: String,         // "claude-3-5-sonnet"
    pub provider_id: String,      // "anthropic", "openai", etc.
    pub timestamp: i64,           // Unix milliseconds
    pub date: String,             // YYYY-MM-DD
    pub tokens: TokenBreakdown,   // input, output, cache_read, cache_write, reasoning
    pub cost: f64,                // Calculated cost
}
```

**OpenCode Parser** (`opencode.rs` - 107 lines)
- Reads JSON files from `~/.local/share/opencode/storage/message/{sessionId}/*.json`
- Extracts: `modelID`, `tokens` (input, output, cache read/write), `time.created`
- Provider: Anthropic

**Claude Code Parser** (`claudecode.rs`)
- Reads JSONL files from `~/.claude/projects/{projectPath}/*.jsonl`
- Extracts: `message.model`, `message.usage` (input, output, cache_read)
- Provider: Anthropic

**Codex Parser** (`codex.rs`)
- Reads JSONL files from `~/.codex/sessions/*.jsonl`
- Event-based format: looks for `token_count` events
- Extracts: `payload.info.last_token_usage`
- Provider: OpenAI

**Gemini Parser** (`gemini.rs` - 155 lines)
- Reads JSON files from `~/.gemini/tmp/{projectHash}/chats/session-*.json`
- Extracts: `messages[].model`, `messages[].tokens` (input, output, cached, thoughts)
- Provider: Google
- Note: Thoughts count as output for billing

**Cursor Parser** (`cursor.rs` - 310 lines)
- Reads CSV files from `~/.token-tracker/cursor-cache/*.csv`
- CSV format: `timestamp,model,input_tokens,output_tokens,cost`
- Syncs from Cursor API (requires authentication)
- Provider: Multiple (Claude, GPT-4, etc.)

**4. Pricing Module (`pricing.rs`)**
- Receives pricing data from TypeScript (fetched from LiteLLM)
- Implements fuzzy matching for model names (handles variations)
- Calculates costs with support for:
  - Input/output token pricing
  - Cache read tokens (discounted)
  - Cache write tokens
  - Reasoning tokens (for o1 models)
  - Tiered pricing (above 200k tokens)
- Pre-computes sorted keys for fast lookups

**5. Aggregator (`aggregator.rs`)**
- Parallel map-reduce aggregation using `rayon`
- Aggregates by:
  - Date (for contribution graphs)
  - Model (for usage reports)
  - Month (for monthly reports)
- Calculates:
  - Daily totals (tokens, cost, message count)
  - Intensity scores (0-4 based on cost)
  - Year summaries
  - Data statistics (active days, streaks, etc.)

#### Main NAPI Exports

```rust
// Graph generation (no pricing)
pub fn generate_graph(options: GraphOptions) -> GraphResult

// Pricing-aware reports
pub fn get_model_report(options: ReportOptions) -> ModelReport
pub fn get_monthly_report(options: ReportOptions) -> MonthlyReport
pub fn generate_graph_with_pricing(options: ReportOptions) -> GraphResult

// Two-phase processing (for parallel execution)
pub fn parse_local_sources(options: LocalParseOptions) -> ParsedMessages
pub fn finalize_report(options: FinalizeReportOptions) -> ModelReport
pub fn finalize_monthly_report(options: FinalizeMonthlyOptions) -> MonthlyReport
pub fn finalize_graph(options: FinalizeGraphOptions) -> GraphResult

// Utilities
pub fn scan_sessions(home_dir: Option<String>, sources: Option<Vec<String>>) -> ScanStats
pub fn version() -> String
pub fn health_check() -> String
```

#### Performance Characteristics

| Operation | TypeScript | Rust Native | Speedup |
|-----------|------------|-------------|---------|
| File Discovery | ~500ms | ~50ms | **10x** |
| JSON Parsing | ~800ms | ~100ms | **8x** |
| Aggregation | ~200ms | ~25ms | **8x** |
| **Total** | **~1.5s** | **~175ms** | **~8.5x** |

*Benchmarks for ~1000 session files, 100k messages*

---

### 3.2 TypeScript CLI (`src/`)

The CLI layer provides user interface, authentication, and orchestration.

#### CLI Commands

**Default Command (no args)**
```bash
token-tracker                    # Show models report (default)
token-tracker models             # Show usage by model
token-tracker monthly            # Show monthly usage
token-tracker graph              # Export graph data to JSON
```

**Authentication**
```bash
token-tracker login              # GitHub OAuth login
token-tracker logout             # Logout
token-tracker whoami             # Show current user
```

**Social Platform**
```bash
token-tracker submit             # Submit usage to leaderboard
token-tracker submit --dry-run   # Preview submission
```

**Cursor IDE Integration**
```bash
token-tracker cursor login       # Authenticate with Cursor
token-tracker cursor logout      # Logout from Cursor
token-tracker cursor status      # Check sync status
```

#### Filtering Options

**Platform Filters**
```bash
--opencode, --claude, --codex, --gemini, --cursor
```

**Date Filters**
```bash
--today                          # Just today
--week                           # Last 7 days
--month                          # Current calendar month
--since YYYY-MM-DD               # Start date
--until YYYY-MM-DD               # End date
--year YYYY                      # Specific year
```

#### Key Modules

**1. CLI Entry Point (`cli.ts` - 826 lines)**
- Uses `commander.js` for command parsing
- Implements all commands and options
- Orchestrates pricing fetch + native module calls
- Formats output with tables and colors

**2. Pricing Fetcher (`pricing.ts` - 213 lines)**
- Fetches from LiteLLM GitHub repo
- Disk cache at `~/.cache/token-tracker/pricing.json`
- 1-hour TTL (time-to-live)
- Converts to `PricingEntry[]` format for Rust

**3. Native Module Bindings (`native.ts` - 607 lines)**
- TypeScript wrapper around Rust NAPI exports
- Type definitions for all Rust structures
- Handles snake_case ↔ camelCase conversion
- Provides high-level functions like:
  - `parseLocalSourcesNative()`
  - `finalizeReportNative()`
  - `finalizeGraphNative()`

**4. Authentication (`auth.ts` - 211 lines)**
- GitHub OAuth flow
- Device code flow (for CLI)
- Token storage in `~/.config/token-tracker/`
- Session management

**5. Cursor Integration (`cursor.ts` - 503 lines)**
- Authenticates with Cursor API
- Syncs usage data to local cache
- Parses CSV format
- Handles credential storage

**6. Table Formatting (`table.ts` - 233 lines)**
- Dynamic width calculation
- Color-coded output
- Formats numbers with thousands separators
- Currency formatting

**7. Graph Data Generation (`graph.ts` - 511 lines)**
- Converts Rust output to frontend-compatible format
- Handles date filtering
- Calculates statistics (streaks, best day, etc.)
- Exports to JSON

---

### 3.3 Frontend (`frontend/`)

Next.js 16 web application with React 19 for visualization and social features.

#### Pages

**1. Leaderboard (`app/(main)/page.tsx`)**
- Shows top users by total cost
- Filters: all-time, this month, this week
- User cards with avatars and stats
- Click to view user profile

**2. User Profile (`app/u/[username]/page.tsx`)**
- Public profile with contribution graph
- Usage statistics
- Submission history
- Share button

**3. Local Viewer (`app/local/page.tsx`)**
- Upload JSON data file
- View graphs privately (no submission)
- Same visualization as leaderboard

**4. Settings (`app/settings/page.tsx`)**
- User profile management
- API token management
- Session management
- Logout

**5. Device Code Auth (`app/device/page.tsx`)**
- Display device code for CLI login
- Poll for authorization
- Redirect on success

#### Components

**1. TokenGraph2D (`TokenGraph2D.tsx`)**
- GitHub-style contribution calendar
- Canvas-based rendering
- Hover tooltips with daily breakdown
- Click to show detailed breakdown
- Responsive to theme changes

**2. TokenGraph3D (`TokenGraph3D.tsx`)**
- Isometric 3D visualization using `obelisk.js`
- Cube height = cost
- Color = intensity
- Interactive hover/click
- Animated rendering

**3. GraphControls (`GraphControls.tsx`)**
- Year selector
- Source filters (OpenCode, Claude, etc.)
- Color palette selector
- View toggle (2D/3D)

**4. BreakdownPanel (`BreakdownPanel.tsx`)**
- Shows daily breakdown by source and model
- Token counts (input, output, cache, reasoning)
- Cost per source
- Sortable columns

**5. StatsPanel (`StatsPanel.tsx`)**
- Total cost, tokens, active days
- Best day, current streak, longest streak
- Average per day

**6. DataInput (`DataInput.tsx`)**
- File upload for JSON data
- Drag-and-drop support
- Validation and error handling

#### Database Schema (Drizzle ORM)

```typescript
// Users (GitHub OAuth)
users {
  id: UUID (PK)
  githubId: INTEGER (unique)
  username: VARCHAR (unique)
  displayName: VARCHAR
  avatarUrl: TEXT
  email: VARCHAR
  isAdmin: BOOLEAN
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}

// Sessions (auth tokens)
sessions {
  id: UUID (PK)
  userId: UUID (FK)
  token: VARCHAR (unique)
  expiresAt: TIMESTAMP
  source: VARCHAR ("web" | "cli" | "device")
  userAgent: TEXT
  createdAt: TIMESTAMP
}

// API Tokens
apiTokens {
  id: UUID (PK)
  userId: UUID (FK)
  token: VARCHAR (unique)
  name: VARCHAR
  lastUsedAt: TIMESTAMP
  expiresAt: TIMESTAMP
  createdAt: TIMESTAMP
}

// Device Codes (for CLI auth)
deviceCodes {
  id: UUID (PK)
  deviceCode: VARCHAR (unique)
  userCode: VARCHAR (unique)
  userId: UUID (FK, nullable)
  deviceName: VARCHAR
  expiresAt: TIMESTAMP
  createdAt: TIMESTAMP
}

// Submissions (user data)
submissions {
  id: UUID (PK)
  userId: UUID (FK)
  totalTokens: BIGINT
  totalCost: DECIMAL
  inputTokens: BIGINT
  outputTokens: BIGINT
  cacheReadTokens: BIGINT
  cacheWriteTokens: BIGINT
  reasoningTokens: BIGINT
  messageCount: INTEGER
  sources: JSONB (array of sources)
  models: JSONB (array of models)
  dateRange: JSONB {start, end}
  submittedAt: TIMESTAMP
  createdAt: TIMESTAMP
}

// Leaderboard (materialized view)
leaderboard {
  userId: UUID (PK)
  username: VARCHAR
  displayName: VARCHAR
  avatarUrl: TEXT
  totalCost: DECIMAL
  totalTokens: BIGINT
  messageCount: INTEGER
  submissionCount: INTEGER
  lastSubmittedAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### API Routes

**Authentication**
- `POST /api/auth/github` - GitHub OAuth initiation
- `GET /api/auth/github/callback` - OAuth callback
- `POST /api/auth/device` - Create device code
- `POST /api/auth/device/poll` - Poll for authorization
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Logout

**Data**
- `POST /api/submit` - Submit usage data
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/users/[username]` - Get user profile

**Settings**
- `GET /api/settings/tokens` - List API tokens
- `POST /api/settings/tokens` - Create API token
- `DELETE /api/settings/tokens/[tokenId]` - Delete API token

---

## 4. DATA FLOW

### Typical Usage Flow

```
User runs: token-tracker models --opencode --since 2024-01-01
                    │
                    ▼
        ┌─────────────────────────┐
        │  CLI (cli.ts)           │
        │  Parse arguments        │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Pricing Fetcher        │
        │  (pricing.ts)           │
        │  Fetch from LiteLLM     │
        │  (with disk cache)      │
        └────────────┬────────────┘
                     │ PricingEntry[]
                     ▼
        ┌─────────────────────────┐
        │  Native Module          │
        │  (Rust core)            │
        │  1. Scan files          │
        │  2. Parse JSON (SIMD)   │
        │  3. Filter by date      │
        │  4. Aggregate by model  │
        │  5. Calculate costs     │
        └────────────┬────────────┘
                     │ ModelReport
                     ▼
        ┌─────────────────────────┐
        │  Table Formatter        │
        │  (table.ts)             │
        │  Format with colors     │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Terminal Output        │
        │  Display table          │
        └─────────────────────────┘
```

### Graph Export Flow

```
User runs: token-tracker graph --output data.json
                    │
                    ▼
        ┌─────────────────────────┐
        │  Pricing Fetcher        │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Native Module          │
        │  generate_graph_with_   │
        │  pricing()              │
        │  Returns: GraphResult   │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Graph Converter        │
        │  (graph.ts)             │
        │  Convert to frontend    │
        │  format                 │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Write to JSON file     │
        │  data.json              │
        └─────────────────────────┘
```

### Submission Flow

```
User runs: token-tracker submit
                    │
                    ▼
        ┌─────────────────────────┐
        │  Check auth             │
        │  (auth.ts)              │
        │  Load token from disk   │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Pricing Fetcher        │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Native Module          │
        │  Parse + aggregate      │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Validate data          │
        │  (submit.ts)            │
        │  Check totals, dates    │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  POST /api/submit       │
        │  Send to backend        │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Backend validation     │
        │  Store in DB            │
        │  Update leaderboard     │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Success message        │
        │  Show profile URL       │
        └─────────────────────────┘
```

---

## 5. KEY TECHNOLOGIES

### Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **CLI** | Commander.js | Command parsing |
| **CLI** | picocolors | Terminal colors |
| **CLI** | cli-table3 | Table rendering |
| **Native** | Rust 1.82+ | Performance engine |
| **Native** | napi-rs | Node.js bindings |
| **Native** | rayon | Data parallelism |
| **Native** | simd-json | SIMD JSON parsing |
| **Native** | walkdir | Directory traversal |
| **Native** | chrono | Date/time handling |
| **Frontend** | Next.js 16 | React framework |
| **Frontend** | React 19 | UI library |
| **Frontend** | Drizzle ORM | Database access |
| **Frontend** | Zod | Schema validation |
| **Database** | PostgreSQL | Data storage |
| **Database** | Neon/Vercel Postgres | Hosting options |

### Visualization Libraries

- **2D Graph**: Canvas API (custom implementation)
- **3D Graph**: obelisk.js (isometric rendering)
- **Themes**: GitHub Primer design system
- **Animations**: Framer Motion

---

## 6. SUPPORTED PLATFORMS

### Session Data Locations

| Platform | Location | Format | Status |
|----------|----------|--------|--------|
| **OpenCode** | `~/.local/share/opencode/storage/message/` | JSON | ✅ Supported |
| **Claude Code** | `~/.claude/projects/` | JSONL | ✅ Supported |
| **Codex CLI** | `~/.codex/sessions/` | JSONL | ✅ Supported |
| **Gemini CLI** | `~/.gemini/tmp/*/chats/` | JSON | ✅ Supported |
| **Cursor IDE** | `~/.token-tracker/cursor-cache/` | CSV | ✅ Supported |

### Data Retention Settings

| Platform | Default | Config File | Setting |
|----------|---------|-------------|---------|
| Claude Code | 30 days | `~/.claude/settings.json` | `"cleanupPeriodDays": 9999999999` |
| Gemini CLI | Disabled | `~/.gemini/settings.json` | `"sessionRetention.enabled": false` |
| Codex CLI | Disabled | N/A | No cleanup feature |
| OpenCode | Disabled | N/A | No cleanup feature |

---

## 7. PRICING SYSTEM

### Pricing Data Source

- **Source**: LiteLLM GitHub repository
- **URL**: `https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json`
- **Cache**: `~/.cache/token-tracker/pricing.json`
- **TTL**: 1 hour

### Pricing Features

- **Input/Output tokens**: Standard per-token pricing
- **Cache read tokens**: Discounted (typically 90% off)
- **Cache write tokens**: Full price
- **Reasoning tokens**: For models like o1
- **Tiered pricing**: Different rates above 200k tokens
- **Fuzzy matching**: Handles model name variations

### Cost Calculation

```
cost = (input_tokens × input_price) +
       (output_tokens × output_price) +
       (cache_read_tokens × cache_read_price) +
       (cache_write_tokens × cache_write_price) +
       (reasoning_tokens × reasoning_price)
```

---

## 8. AUTHENTICATION FLOWS

### GitHub OAuth (Web)

```
User clicks "Login" on website
        │
        ▼
Redirect to GitHub OAuth
        │
        ▼
User authorizes app
        │
        ▼
GitHub redirects to /api/auth/github/callback
        │
        ▼
Backend creates user + session
        │
        ▼
Set session cookie
        │
        ▼
Redirect to dashboard
```

### Device Code Flow (CLI)

```
User runs: token-tracker login
        │
        ▼
POST /api/auth/device
        │
        ▼
Backend generates device_code + user_code
        │
        ▼
Display: "Visit https://... and enter: XXXX-XXXX"
        │
        ▼
User visits URL and authorizes
        │
        ▼
CLI polls /api/auth/device/poll
        │
        ▼
Backend returns session token
        │
        ▼
CLI saves token to ~/.config/token-tracker/
        │
        ▼
Success message
```

---

## 9. PERFORMANCE OPTIMIZATIONS

### Rust Native Module

1. **Parallel File Scanning**: Uses `rayon` for parallel directory traversal
2. **SIMD JSON Parsing**: `simd-json` for 8x faster parsing
3. **Streaming JSONL**: Processes line-by-line to avoid buffering entire files
4. **Parallel Aggregation**: Map-reduce pattern for combining results
5. **Pre-computed Indices**: Pricing data pre-sorted for fast lookups
6. **Zero-copy Strings**: Rust's ownership model avoids unnecessary copies

### Caching

1. **Pricing Cache**: 1-hour disk cache to avoid repeated fetches
2. **Cursor Cache**: Local CSV cache of Cursor API data
3. **Resolution Cache**: Model name → pricing lookup cache

### Frontend

1. **Canvas Rendering**: 2D graph uses canvas for performance
2. **Lazy Loading**: 3D graph (obelisk.js) loaded on demand
3. **Memoization**: React components memoized to avoid re-renders
4. **Theme Optimization**: CSS variables for instant theme switching

---

## 10. DEVELOPMENT WORKFLOW

### Building

```bash
# Install dependencies
yarn install

# Build native module (release)
yarn build:core

# Build native module (debug, faster)
yarn build:core:debug

# Build frontend
yarn build:frontend
```

### Running

```bash
# CLI development
yarn dev

# Frontend development
yarn dev:frontend

# Run benchmarks
yarn bench:ts              # TypeScript implementation
yarn bench:rust            # Rust implementation
```

### Testing

```bash
# Rust tests
cd core && yarn test:rust

# Node.js integration tests
cd core && yarn test

# All tests
cd core && yarn test:all
```

---

## 11. PROJECT STATUS

### Completed Features ✅

- [x] Multi-platform session parsing (5 platforms)
- [x] Native Rust core with NAPI bindings
- [x] Real-time pricing from LiteLLM
- [x] CLI with all commands
- [x] GitHub OAuth authentication
- [x] Device code flow for CLI
- [x] 2D contribution graph visualization
- [x] 3D isometric graph visualization
- [x] Leaderboard and user profiles
- [x] Local viewer for private data
- [x] Data submission and validation
- [x] Cursor IDE integration
- [x] Dark/Light/System theme toggle
- [x] Database schema (Drizzle ORM)
- [x] API routes for all features

### Recent Work (In Progress)

- Database schema deployment
- ESLint fixes
- Validation schema updates
- Credentials path migration (XDG spec)

---

## 12. KEY INSIGHTS

### Architecture Decisions

1. **Hybrid TypeScript + Rust**: Combines ease of development (TypeScript) with performance (Rust)
2. **Two-Phase Processing**: Allows parallel execution of I/O (pricing fetch, Cursor sync) with CPU-bound work (parsing)
3. **Unified Message Format**: Abstracts platform differences, simplifies aggregation
4. **Disk Caching**: Pricing cache reduces network calls and startup time
5. **Canvas-Based Graphs**: Better performance than DOM-based alternatives

### Scalability Considerations

1. **Parallel Processing**: Rayon thread pool scales with CPU cores
2. **Streaming JSON**: Avoids loading entire files into memory
3. **Database Indexing**: Indexes on frequently queried columns
4. **Leaderboard Materialization**: Pre-computed view for fast queries
5. **API Rate Limiting**: Prevents abuse (not yet implemented)

### User Experience

1. **GitHub Primer Design**: Familiar to developers
2. **Multiple Visualizations**: 2D for quick overview, 3D for engagement
3. **Flexible Filtering**: By platform, date, year
4. **Social Features**: Leaderboards and profiles for motivation
5. **Local Viewer**: Privacy-first option for sensitive data

---

## 13. CODEBASE STATISTICS

| Component | Files | Lines | Language |
|-----------|-------|-------|----------|
| CLI | 13 | 5,656 | TypeScript |
| Rust Core | 8 | ~2,500 | Rust |
| Frontend | 30+ | ~5,000 | TypeScript/React |
| **Total** | **50+** | **~13,000** | Mixed |

### Largest Files

1. `core/src/lib.rs` - 1,371 lines (NAPI exports)
2. `src/cli.ts` - 826 lines (CLI commands)
3. `src/native.ts` - 607 lines (Rust bindings)
4. `src/pricing.ts` - 213 lines (Pricing fetcher)
5. `src/cursor.ts` - 503 lines (Cursor integration)

---

## 14. DEPLOYMENT

### Frontend Deployment

- **Platform**: Vercel (recommended)
- **Database**: Neon or Vercel Postgres
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `GITHUB_CLIENT_ID`: GitHub OAuth app ID
  - `GITHUB_CLIENT_SECRET`: GitHub OAuth app secret
  - `NEXT_PUBLIC_URL`: Public URL of the app

### CLI Distribution

- **Package**: Published to npm as `token-tracker`
- **Native Bindings**: Pre-built for multiple platforms:
  - macOS (x86_64, aarch64)
  - Linux (x86_64, aarch64, musl)
  - Windows (x86_64, aarch64)

---

## 15. FUTURE ENHANCEMENTS

Potential improvements based on codebase structure:

1. **Rate Limiting**: Prevent API abuse
2. **Device Code Cleanup**: Auto-delete expired codes
3. **Payload Size Limits**: Validate submission sizes
4. **ISR (Incremental Static Regeneration)**: Cache leaderboard pages
5. **Account Deletion**: GDPR compliance
6. **Export Formats**: CSV, Excel, PDF
7. **Webhooks**: Notify on new submissions
8. **Advanced Analytics**: Trends, predictions
9. **Team Features**: Shared workspaces
10. **Mobile App**: React Native version

---

## CONCLUSION

Token Tracker is a well-architected, high-performance application that solves a real problem for developers using multiple AI coding assistants. The hybrid TypeScript + Rust approach provides both developer productivity and runtime performance. The codebase is modular, well-documented, and ready for production deployment.

Key strengths:
- ✅ Excellent performance (8-10x speedup with Rust)
- ✅ Multi-platform support (5 AI assistants)
- ✅ Clean architecture (separation of concerns)
- ✅ Comprehensive features (CLI + web + social)
- ✅ User-friendly (GitHub Primer design, multiple visualizations)

The project demonstrates best practices in:
- Performance optimization (SIMD, parallelism, caching)
- API design (NAPI-RS bindings, type safety)
- Database design (Drizzle ORM, proper indexing)
- Frontend development (React 19, Canvas rendering)
- CLI development (Commander.js, proper error handling)
