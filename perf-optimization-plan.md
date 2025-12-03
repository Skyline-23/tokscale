# Performance Optimization: Two-Phase Rust Processing

**Plan Level**: Balanced (suitable for experienced developer implementation)

## Goal
Overlap local file parsing with Cursor API + Pricing network requests to reduce total execution time from ~2.9s to ~1.5-2s.

## Current Flow (Sequential Bottleneck)
```
1. [WAIT] Cursor API sync (1-2s) + Pricing fetch (0.5s) in parallel
2. [THEN] Rust: Scan → Parse → Calculate costs (1.1s)
Total: ~2.9s
```

## Target Flow (Parallel Processing)
```
1. [PARALLEL]
   ├── Cursor API sync (1-2s)        → Writes to ~/.token-tracker/cursor-cache/usage.csv
   ├── Pricing fetch (0.5s)          → Returns PricingFetcher
   └── Rust: Scan+Parse LOCAL (0.8s) ← NEW: OpenCode/Claude/Codex/Gemini only!
2. [THEN] Finalize: Read Cursor CSV + Apply pricing (0.1s)
Total: ~1.5-2s
```

---

## NAPI Type Definitions (Critical)

```rust
// ============================================================================
// New NAPI Types for Two-Phase Processing
// ============================================================================

/// Parsed message without cost (pricing applied in finalize step)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct ParsedMessage {
    pub source: String,        // "opencode", "claude", "codex", "gemini"
    pub model_id: String,
    pub provider_id: String,
    pub timestamp: i64,        // Unix milliseconds
    pub date: String,          // "YYYY-MM-DD"
    pub input: i64,
    pub output: i64,
    pub cache_read: i64,
    pub cache_write: i64,
    pub reasoning: i64,
    // NOTE: No `cost` field - applied in finalize step
}

/// Result of parsing local sources (excludes Cursor)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct ParsedMessages {
    pub messages: Vec<ParsedMessage>,
    pub opencode_count: i32,
    pub claude_count: i32,
    pub codex_count: i32,
    pub gemini_count: i32,
    pub processing_time_ms: u32,
}

/// Options for parsing local sources only
#[napi(object)]
#[derive(Debug, Clone)]
pub struct LocalParseOptions {
    pub home_dir: Option<String>,
    // NOTE: sources should EXCLUDE "cursor" - it's handled separately
    pub sources: Option<Vec<String>>,  // Default: ["opencode", "claude", "codex", "gemini"]
    pub since: Option<String>,
    pub until: Option<String>,
    pub year: Option<String>,
}

/// Options for finalizing report with pricing
#[napi(object)]
#[derive(Debug, Clone)]
pub struct FinalizeReportOptions {
    pub home_dir: Option<String>,      // CRITICAL: Needed to find Cursor cache!
    pub local_messages: ParsedMessages,
    pub pricing: Vec<PricingEntry>,
    pub include_cursor: bool,          // Whether to parse Cursor cache
    pub since: Option<String>,
    pub until: Option<String>,
    pub year: Option<String>,
}
```

---

## Implementation Plan

### Phase 1: Rust Module Changes

- [ ] **1.1** Add new structs to `core/src/lib.rs`
  - `ParsedMessage` - message without cost
  - `ParsedMessages` - collection with stats
  - `LocalParseOptions` - input for local parsing
  - `FinalizeReportOptions` - input for finalization
  - See "NAPI Type Definitions" section above

- [ ] **1.2** Add `parse_local_sources(options: LocalParseOptions) -> ParsedMessages`
  ```rust
  #[napi]
  pub fn parse_local_sources(options: LocalParseOptions) -> napi::Result<ParsedMessages> {
      // 1. Scan local directories (OpenCode, Claude, Codex, Gemini)
      // 2. Parse files in parallel with rayon
      // 3. Return ParsedMessages with cost=0 (pricing not applied)
      // NOTE: Does NOT include Cursor - it's network-synced
  }
  ```

- [ ] **1.3** Add `finalize_report(options: FinalizeReportOptions) -> ModelReport`
  ```rust
  #[napi]
  pub fn finalize_report(options: FinalizeReportOptions) -> napi::Result<ModelReport> {
      // 1. If include_cursor, read Cursor CSV from:
      //    {home_dir}/.token-tracker/cursor-cache/usage.csv
      // 2. Parse Cursor messages
      // 3. Merge: local_messages + cursor_messages
      // 4. Apply pricing to ALL messages
      // 5. Apply date filters
      // 6. Aggregate by model
      // 7. Return ModelReport
  }
  ```

- [ ] **1.4** Add similar finalize functions:
  - `finalize_monthly_report(options) -> MonthlyReport`
  - `finalize_graph(options) -> GraphResult`

- [ ] **1.5** Build and verify
  ```bash
  cd core && yarn build
  # Check core/index.d.ts has new exports
  ```

### Phase 2: TypeScript CLI Changes

- [ ] **2.1** Add TypeScript bindings in `src/native.ts`
  ```typescript
  export function parseLocalSourcesNative(options: LocalParseOptions): ParsedMessages;
  export function finalizeReportNative(options: FinalizeReportOptions): ModelReport;
  export function finalizeMonthlyReportNative(options: FinalizeMonthlyOptions): MonthlyReport;
  export function finalizeGraphNative(options: FinalizeGraphOptions): GraphResult;
  ```

- [ ] **2.2** Create new parallel execution flow with error handling
  ```typescript
  // Use Promise.allSettled for graceful degradation
  const [cursorResult, pricingResult, localResult] = await Promise.allSettled([
    syncCursorData(),                    // Network: Cursor API
    fetchPricingData(),                  // Network: LiteLLM pricing  
    parseLocalSourcesNative({            // CPU: Parse local files
      sources: ['opencode', 'claude', 'codex', 'gemini'],  // NO cursor!
      ...dateFilters
    }),
  ]);

  // Handle partial failures gracefully
  const cursorSync = cursorResult.status === 'fulfilled' 
    ? cursorResult.value 
    : { attempted: true, synced: false, rows: 0, error: 'Cursor sync failed' };
  
  const fetcher = pricingResult.status === 'fulfilled'
    ? pricingResult.value
    : new PricingFetcher();  // Empty pricing → costs = 0
    
  const localParsed = localResult.status === 'fulfilled'
    ? localResult.value
    : null;

  if (!localParsed) {
    spinner.error('Failed to parse local files');
    process.exit(1);
  }

  // Finalize with pricing + cursor
  const report = finalizeReportNative({
    homeDir: os.homedir(),             // CRITICAL: For cursor cache path
    localMessages: localParsed,
    pricing: fetcher.toPricingEntries(),
    includeCursor: cursorSync.synced,  // Only include if sync succeeded
    ...dateFilters
  });
  ```

- [ ] **2.3** Update `showModelReport()` in `src/cli.ts`

- [ ] **2.4** Update `showMonthlyReport()` in `src/cli.ts`

- [ ] **2.5** Update `handleGraphCommand()` in `src/cli.ts`

### Phase 3: Testing & Verification

- [ ] **3.1** Benchmark comparison
  ```bash
  # Before (baseline already recorded):
  # ~2.9s total, ~1.1s Rust
  
  # After (target):
  for i in {1..5}; do yarn dev --benchmark 2>&1 | grep "Processing time"; done
  # Target: < 2.0s total
  ```

- [ ] **3.2** Verify correctness with comparison script
  ```bash
  # Save baseline output (before changes)
  git stash
  yarn build:core && yarn dev > /tmp/baseline.txt 2>&1
  
  # Save optimized output (after changes)
  git stash pop
  yarn build:core && yarn dev > /tmp/optimized.txt 2>&1
  
  # Compare (ignore timing lines)
  diff <(grep -v "Processing time\|Done in" /tmp/baseline.txt) \
       <(grep -v "Processing time\|Done in" /tmp/optimized.txt)
  # Should output nothing (identical results)
  ```

- [ ] **3.3** Test edge cases
  | Case | Command | Expected |
  |------|---------|----------|
  | No Cursor credentials | `rm ~/.token-tracker/cursor-credentials.json && yarn dev` | Works, local data only |
  | Cursor sync fails | (simulate network error) | Works, local data only |
  | Pricing fetch fails | (simulate timeout) | Works, costs = 0 |
  | Empty local data | (new machine) | Shows "No usage data" |

- [ ] **3.4** Consistency check
  ```bash
  for i in {1..10}; do yarn dev 2>&1 | grep "Total:"; done
  # All 10 runs must show identical output
  ```

---

## Data Flow Diagram (Updated)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Promise.allSettled() - PARALLEL                          │
├────────────────────┬────────────────────┬───────────────────────────────────┤
│ syncCursorData()   │ fetchPricingData() │ parseLocalSourcesNative()         │
│   (Network API)    │    (Network)       │   (CPU/IO)                        │
│   ~1-2s            │    ~0.5s           │   ~0.8s                           │
│                    │                    │                                   │
│   ↓                │   ↓                │   ↓                               │
│ Writes CSV to:     │ PricingFetcher     │ ParsedMessages                    │
│ ~/.token-tracker/  │ {entries: [...]}   │ {messages: [...]}                 │
│ cursor-cache/      │                    │                                   │
│ usage.csv          │                    │ LOCAL ONLY:                       │
│                    │                    │ ✓ OpenCode (10K files)            │
│                    │                    │ ✓ Claude (300 files)              │
│                    │                    │ ✓ Codex                           │
│                    │                    │ ✓ Gemini                          │
│                    │                    │ ✗ Cursor (excluded - network!)    │
└────────────────────┴────────────────────┴───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    finalizeReportNative()                                    │
│                                                                              │
│  Input: {                                                                    │
│    homeDir: "/Users/xxx",          ← For cursor cache path                   │
│    localMessages: ParsedMessages,  ← From parallel parsing                   │
│    pricing: PricingEntry[],        ← From LiteLLM                            │
│    includeCursor: true/false,      ← Based on sync result                    │
│  }                                                                           │
│                                                                              │
│  Steps:                                                                      │
│  1. Read ~/.token-tracker/cursor-cache/usage.csv (if includeCursor)          │
│  2. Parse Cursor CSV → cursor_messages                                       │
│  3. Merge: local_messages + cursor_messages                                  │
│  4. For each message: cost = pricing.calculate_cost(model, tokens)           │
│  5. Apply date filters (since, until, year)                                  │
│  6. Aggregate by (source, model, provider)                                   │
│  7. Sort by cost descending                                                  │
│                                                                              │
│  Output: ModelReport                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

| # | Criterion | Measurement | Target |
|---|-----------|-------------|--------|
| 1 | Total execution time | `yarn dev --benchmark` | < 2.0s |
| 2 | Results identical | `diff baseline.txt optimized.txt` | No diff |
| 3 | Consistency | 10 consecutive runs | 100% identical |
| 4 | Cursor degradation | Run without credentials | Works |
| 5 | No breaking changes | All CLI commands | Same interface |

---

## Error Handling Matrix

| Failure | Impact | Handling |
|---------|--------|----------|
| Cursor API sync fails | No Cursor data | Continue with local data only |
| Pricing fetch fails | Costs = 0 | Use empty pricing, show warning |
| Pricing fetch timeout | Delays everything | 5s timeout, fallback to empty |
| Local parsing fails | Critical | Exit with error |
| Cursor CSV not found | No Cursor data | Continue with local data only |
| Cursor CSV corrupted | No Cursor data | Log warning, continue with local |

---

## Files to Modify

| File | Changes |
|------|---------|
| `core/src/lib.rs` | Add `ParsedMessage`, `ParsedMessages`, `LocalParseOptions`, `FinalizeReportOptions`, `parse_local_sources()`, `finalize_report()`, `finalize_monthly_report()`, `finalize_graph()` |
| `core/index.d.ts` | Auto-generated |
| `src/native.ts` | Export new native functions |
| `src/cli.ts` | New parallel flow in `showModelReport()`, `showMonthlyReport()`, `handleGraphCommand()` |

---

## Rollback Plan

The existing functions remain unchanged:
- `getModelReportNative()` 
- `getMonthlyReportNative()`
- `generateGraphWithPricing()`

If issues arise, revert TypeScript changes to use old functions.

---

## 현재 진행 중인 작업
Ready for implementation after plan review ✓
