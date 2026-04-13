# Typely — QA Test Cases
**Date reviewed:** 2025  
**Build:** clean (347 modules, 12.43s, no errors)  
**Coverage:** All 11 new tool pages (5 Dev Tools + 6 Misc Tools) + routing + registry

---

## Summary

| Status | Count |
|--------|-------|
| ✅ PASS | All 11 tools render, build cleanly, routing correct |
| 🐛 BUG FIXED | 1 (TimelineBuilder UTC date offset) |
| ⚠️ KNOWN LIMITATION | 3 (noted below, not bugs) |

---

## 1. Developer Tools

### 1.1 Data Transformer (`/tools/data-transformer`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Paste valid JSON → convert to CSV | Headers + rows output | ✅ |
| 2 | Paste malformed JSON | Error message displayed | ✅ |
| 3 | Paste CSV → convert to JSON | Array of objects | ✅ |
| 4 | Empty input → click convert | No crash, shows prompt | ✅ |
| 5 | Enable de-identify → names/emails/phones masked | Fields redacted | ✅ |
| 6 | Download button → blob URL created + revoked | No memory leak | ✅ (URL.revokeObjectURL called) |

### 1.2 Markdown Scraper (`/tools/markdown-scraper`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Paste raw HTML → convert to Markdown | Clean markdown output | ✅ |
| 2 | HTML with `<script>` tags | Scripts stripped | ✅ |
| 3 | Generate ToC | Heading hierarchy extracted | ✅ |
| 4 | Copy as LLM Prompt | Clipboard write triggered | ✅ |
| 5 | Empty input | No crash | ✅ |

### 1.3 Log Analyzer (`/tools/log-analyzer`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Paste server logs → parse levels | INFO/WARN/ERROR counted | ✅ |
| 2 | Filter by ERROR level | Only errors shown | ✅ |
| 3 | Copy for AI button | Full log summary on clipboard | ✅ |
| 4 | Large log (>1000 lines) | Renders without freeze | ✅ |
| 5 | Clear button | State reset | ✅ |

### 1.4 Config Converter (`/tools/config-converter`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | .env format → JSON | Key-value pairs parsed | ✅ |
| 2 | JSON → YAML | Correct YAML output via js-yaml | ✅ |
| 3 | YAML → TOML | Flat keys + [sections] | ✅ |
| 4 | TOML → .env | KEY=VALUE format | ✅ |
| 5 | Nested JSON → YAML | Hierarchy preserved | ✅ |
| 6 | Malformed YAML | Error caught, shown | ✅ (js-yaml throws, caught) |

### 1.5 Mock Data Generator (`/tools/mock-data`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Default schema → Generate 10 rows | JSON with uuid/name/email/age/date | ✅ |
| 2 | Change count to 500 | 500 rows generated | ✅ |
| 3 | Add custom field (type: phone PK) | +92XXXXXXXXXX format | ✅ |
| 4 | Enable edge case mode | ~10% nulls/empty/XSS strings injected | ✅ |
| 5 | Export as CSV | Proper quoting for commas/newlines | ✅ |
| 6 | Remove a field row | Field absent in output | ✅ |
| 7 | XSS in field name | `crypto.randomUUID()` used, no injection risk | ✅ |

---

## 2. Misc Professional Tools

### 2.1 Timeline Builder (`/tools/timeline-builder`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Paste sample text → Extract Timeline | 8 events detected and sorted | ✅ |
| 2 | ISO date format (2024-01-15) | Parsed correctly | ✅ |
| 3 | Written month (Jan 15, 2024) | Parsed correctly | ✅ |
| 4 | Slash format (07/14/2024) | Parsed correctly | ✅ |
| 5 | Load Sample button | Sample auto-extracted | ✅ |
| 6 | Toggle Newest First / Oldest First | Sort order flips | ✅ |
| 7 | Delete event | Event removed from list | ✅ |
| 8 | Manually add event via date picker | Event added at correct local date | ✅ **BUG FIXED** |
| 9 | Copy as Text | Plain text timeline on clipboard | ✅ |
| 10 | Download .txt | File downloaded | ✅ |
| 11 | Stats bar (N events, spanning X days) | Shown for 2+ events | ✅ |

**🐛 Bug Fixed:** `new Date(manualDate)` with YYYY-MM-DD string parses as UTC midnight, causing a -1 day offset in timezones west of UTC. Fixed by parsing with `new Date(y, m-1, d)` (local time).

### 2.2 Position Size Calculator (`/tools/position-size-calc`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Enter account size + 1% risk + entry/stop | Shares, max loss, position value shown | ✅ |
| 2 | Entry price = Stop loss | Shows 0 shares, no division by zero | ✅ (guarded: `riskPerShare > 0`) |
| 3 | Risk % chips (0.5, 1, 2, 3) | Input updates | ✅ |
| 4 | Risk meter changes color at 1%, 2% | Green → amber → red | ✅ |
| 5 | Add take profit → R/R ratio shown | "1 : 2.5" style display | ✅ |
| 6 | Save to journal | Trade stored in localStorage | ✅ |
| 7 | Journal persists on refresh | Loaded from localStorage | ✅ |
| 8 | Max 20 trades in journal | Oldest trimmed | ✅ |
| 9 | Currency switch (PKR/USD/EUR/GBP) | Symbol and formatting update | ✅ |

### 2.3 Voice Invoice (`/tools/voice-invoice`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Fill header fields (client, company, date) | Live preview updates | ✅ |
| 2 | Add item row manually | Line item appears in invoice | ✅ |
| 3 | Change qty/price → subtotal updates | Total recalculated live | ✅ |
| 4 | Voice input (Chrome) → "3 units cleaning 800" | Parsed to qty=3, desc="Cleaning", price=800 | ✅ |
| 5 | Voice input unsupported (Firefox) | Graceful fallback message shown | ✅ |
| 6 | Print invoice | Print stylesheet applied, controls hidden | ✅ |
| 7 | Delete line item | Row removed, total recalculated | ✅ |
| 8 | Tax % field | Tax amount added to total | ✅ |
| 9 | Invoice number auto-generated | INV-XXXXXX format | ✅ |

### 2.4 Property Comp (`/tools/property-comp`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Enter subject property details | Fields accepted | ✅ |
| 2 | Enter comp 1 sale price + features | Adjustment table populates | ✅ |
| 3 | Bedroom diff: subject has 4, comp has 3 | +500,000 adjustment shown | ✅ |
| 4 | Toggle PKR / USD | Values recalculated at 280 rate | ✅ |
| 5 | Toggle plot size: Marla / Sqft | Converted correctly (1 marla = 272.25 sqft) | ✅ |
| 6 | All 3 comps filled → Avg adjusted value | Average of 3 estimates shown | ✅ |
| 7 | Condition grade difference | Adjustment row shown | ✅ |

### 2.5 Student Groups (`/tools/student-groups`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Load sample (30 students) | Students rendered in list | ✅ |
| 2 | Generate balanced groups (size 5) | High/Medium/Low distributed per group | ✅ (snake-draft algo) |
| 3 | Generate random groups | Shuffled, no level bias | ✅ |
| 4 | Ability-matched mode | All Highs together, then Mediums, then Lows | ✅ |
| 5 | Change group size | Correct number of groups recalculated | ✅ |
| 6 | Add student manually | Appears in list | ✅ |
| 7 | Delete student | Removed from list | ✅ |
| 8 | Group summary tags (2H · 2M · 1L) | Shown per group card | ✅ |
| 9 | Empty class → Generate | No crash, 0 groups | ✅ |
| 10 | Odd class size (e.g., 31 students, size 5) | Last group has remaining students | ✅ |

### 2.6 Refrigerant Leak Calculator (`/tools/refrigerant-calc`)

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Enter charge=10kg, added=1.5kg, months=12 | Leak rate = 15% | ✅ |
| 2 | R-22 at 15% → threshold=15% | "At Threshold" warning | ✅ |
| 3 | R-410A at 11% → threshold=10% | "Exceeds EPA Limit" shown in red | ✅ |
| 4 | Leak rate < threshold | "Within Limit" shown in green | ✅ |
| 5 | Zero charge entered | No crash (division guarded) | ✅ |
| 6 | Log entry saved to localStorage | Persists on refresh | ✅ |
| 7 | Log capped at 10 entries | Oldest trimmed on save | ✅ |
| 8 | Clear log button | localStorage cleared, UI updated | ✅ |

---

## 3. Routing & Registry

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | All 11 new tools in registry.js | ✅ verified by grep |
| 2 | All 11 routes in main.jsx | ✅ verified by grep |
| 3 | Registry `path` matches route `path=` | ✅ 100% match |
| 4 | All 4 new categories in TOOL_CATEGORIES | developer, education, legal, business ✅ |
| 5 | Tools home shows new categories | Driven by TOOL_CATEGORIES array ✅ |
| 6 | Lazy loading — each tool in separate chunk | ✅ confirmed in build output |

---

## 4. Build Health

| Check | Result |
|-------|--------|
| `npm run build` exits 0 | ✅ |
| 347 modules transformed | ✅ |
| No TypeScript/ESLint errors | ✅ |
| Pre-existing chunk warnings (jspdf/html2canvas >500KB) | ⚠️ Pre-existing, not caused by new tools |
| PWA precache: 58 entries | ✅ |

---

## 5. Known Limitations (Not Bugs)

| Tool | Limitation | Workaround |
|------|-----------|------------|
| Drug Checker | Requires exact generic name for NLM API (brand names may 404) | Type generic name (e.g. "carbamazepine" not "Tegral") |
| Voice Invoice | Voice input only works in Chrome/Edge (Web Speech API) | Manual text entry fallback |
| Property Comp | PKR/USD rate hardcoded at 280 | Update `USD_RATE` constant in PropertyComp.jsx when needed |

---

## 6. Bugs Fixed This QA Round

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `TimelineBuilder.jsx:319` | `new Date("YYYY-MM-DD")` parses as UTC, shows -1 day in western timezones | Changed to `new Date(y, m-1, d)` (local time) |
