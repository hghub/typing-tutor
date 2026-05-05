# Tool Update Cadence

This document is the operating checklist for keeping `rafiqy.app` tools current.

Use it for:
- data freshness
- legal / policy-sensitive updates
- SEO freshness reviews
- UI / feature maintenance

## Cadence Rules

### `Weekly + event-driven`
Use for tools affected by:
- government tax changes
- tariff / rate changes
- regulations
- market-sensitive assumptions
- real-world pricing that changes fast

Review:
- base assumptions
- legal copy / disclaimers
- FAQs and support blogs
- page titles and “last updated” wording

### `Monthly + event-driven`
Use for decision systems and reference-heavy tools that do not change every week but can go stale if ignored for a month or two.

Review:
- core assumptions
- benchmark values
- guidance text
- support-content cluster

### `Quarterly`
Use for tools where the logic is mostly stable but examples, templates, defaults, UX, and search demand can drift.

Review:
- feature fit
- examples / presets
- internal links
- screenshots / share text if relevant

### `Every 6 months`
Use for mostly stable utility tools.

Review:
- browser compatibility
- dependency / library health
- UI polish
- performance
- FAQ relevance

### `Annual or feature-driven`
Use for timeless tools that rarely need factual updates.

Review:
- only when broken, redesigned, or strategically reprioritized

---

## High-Priority Update Triggers

Update immediately when any of these happen:
- Pakistan federal budget / Finance Act changes
- FBR slab, credit, filer / non-filer, or payroll-treatment changes
- NEPRA / DISCO net billing, buyback, or solar-metering changes
- major fuel / electricity pricing regime changes
- MUFAP / SECP category framing changes that affect investment guidance
- major browser API changes affecting voice, clipboard, PDF, speech, or local storage behavior
- third-party live-data API schema changes

---

## Tool-by-Tool Cadence

## 1. Weekly + Event-Driven

These are the most likely to become wrong if left unattended.

### Pakistan Tax Calculator
- Cadence: `weekly during budget / tax season`, otherwise `monthly`
- Check:
  - tax slabs
  - credit / deduction assumptions
  - filer messaging
  - Finance Act year references
  - FAQ examples
  - supporting tax blog cluster

### Tax Shield Optimizer
- Cadence: `weekly during tax changes`, otherwise `monthly`
- Check:
  - VPS / insurance / charity treatment
  - optimization constraints
  - tax-year labels
  - blog/support copy

### Salary Slip Generator
- Cadence: `weekly during tax changes`, otherwise `monthly`
- Check:
  - payroll tax assumptions
  - EOBI references
  - FY labels
  - printable output labels

### Pakistan Solar Calculator
- Cadence: `weekly when solar policy/pricing is moving`, otherwise `monthly`
- Check:
  - NEPRA / DISCO net billing assumptions
  - buyback rate
  - import tariff baseline
  - installer-cost ranges
  - battery ranges
  - DISCO meter fees
  - solar support blog cluster

### Gold & Silver Calculator
- Cadence: `weekly`
- Check:
  - whether the page copy implies “today” data when user input is manual
  - nisab references
  - any rate-source wording
  - support-content freshness

### Currency Converter
- Cadence: `weekly`
- Check:
  - exchange-rate API reliability
  - fallback behavior
  - source attribution if shown
  - error states

### Pakistan ID & Tax Hub
- Cadence: `weekly during tax season`, otherwise `monthly`
- Check:
  - WHT rate tables
  - FBR deadline references
  - glossary accuracy
  - validation rules if formats change

---

## 2. Monthly + Event-Driven

These are your core decision systems and Pakistan-facing money pages.

### Rent vs Buy Pakistan Analyzer
- Cadence: `monthly`
- Check:
  - city presets
  - markup assumptions
  - transfer-cost assumptions
  - maintenance / holding-cost assumptions
  - support cluster coverage
  - “buy now / rent / wait” messaging clarity

### Salary Offer Evaluator Pakistan
- Cadence: `monthly`
- Check:
  - city-cost baselines
  - tax logic dependency
  - offer-benefit assumptions
  - support blogs for salary negotiation / cross-city move

### Freelance Tax and Reserve Planner
- Cadence: `monthly`
- Check:
  - tax logic dependency
  - reserve heuristics
  - emergency-runway framing
  - support blogs around owner pay / reserve separation

### Investment Allocation Planner Pakistan
- Cadence: `monthly`
- Check:
  - MUFAP / SECP category framing
  - Shariah vs conventional category mapping
  - hedge-bucket guidance
  - tax-aware notes
  - rebalancing guidance
  - support cluster freshness

### Petrol vs Hybrid vs EV Pakistan
- Cadence: `monthly`
- Check:
  - fuel baseline assumptions
  - electricity baseline assumptions
  - EV / hybrid practicality copy
  - support cluster depth

### Loan EMI Calculator
- Cadence: `monthly`
- Check:
  - copy/examples
  - mortgage wording
  - amortization correctness
  - links from property / finance cluster

### Kameti Tracker
- Cadence: `monthly`
- Check:
  - UX polish
  - share/read-only state behavior
  - Pakistan committee terminology

### Driving Fine Tracker
- Cadence: `monthly`
- Check:
  - if any fine-reference copy exists
  - public-link / reminder behavior
  - region-specific relevance

### Expense Pattern Analyzer
- Cadence: `monthly`
- Check:
  - guidance quality
  - scenario hints
  - links to finance / reserve / investment tools

### Property Comp Adjuster
- Cadence: `monthly`
- Check:
  - copy assumptions
  - use-case fit with rent vs buy cluster
  - example inputs

### Freelancer Risk Analyzer
- Cadence: `monthly`
- Check:
  - overlap with freelance reserve planner
  - scoring clarity
  - links into freelance cluster

---

## 3. Quarterly

These are stable enough to avoid weekly maintenance, but not “set and forget”.

### Typing Tutor
- Cadence: `quarterly`
- Check:
  - practice content quality
  - language support
  - leaderboard / multiplayer if applicable
  - SEO support pages

### Urdu Keyboard
- Cadence: `quarterly`
- Check:
  - phonetic mapping quality
  - mobile typing UX
  - clipboard / voice-entry behavior
  - Urdu-support blog cluster

### Pomodoro — Focus Engine
- Cadence: `quarterly`
- Check:
  - timer reliability
  - tab-title countdown behavior
  - saved settings

### Word Counter
- Cadence: `quarterly`
- Check:
  - readability logic
  - keyword-density wording
  - SEO support content

### Text Formatter
- Cadence: `quarterly`
- Check:
  - transformations
  - edge-case formatting
  - examples

### Doc Composer
- Cadence: `quarterly`
- Check:
  - templates
  - export quality
  - professional wording

### World Time Converter
- Cadence: `quarterly`
- Check:
  - timezone correctness
  - language parsing
  - meeting-time logic

### Voice Diary
- Cadence: `quarterly`
- Check:
  - speech-recognition browser support
  - local data safety
  - export behavior

### Daily Planner
- Cadence: `quarterly`
- Check:
  - recurring use polish
  - week view
  - persistence behavior

### Habit Tracker
- Cadence: `quarterly`
- Check:
  - streak logic
  - heatmap rendering
  - mobile usability

### Pakistan decision-support blogs
- Cadence: `quarterly`
- Check:
  - internal links
  - stale examples
  - Search Console query alignment

### Color Palette Generator
- Cadence: `quarterly`
- Check:
  - export formats
  - contrast logic
  - design-tool relevance

### Loan Manager
- Cadence: `quarterly`
- Check:
  - local persistence
  - settlement logic
  - reminders / overdue views

### Smart Packing List
- Cadence: `quarterly`
- Check:
  - checklist completeness
  - common-template usefulness
  - seasonal examples

### Bill Splitter
- Cadence: `quarterly`
- Check:
  - calculation correctness
  - share/export flow

### Drug Interaction Checker
- Cadence: `quarterly`, plus `API change review`
- Check:
  - source/API behavior
  - medical disclaimer wording
  - result interpretation copy

### Symptom Context Tracker
- Cadence: `quarterly`
- Check:
  - health disclaimers
  - UI clarity
  - symptom-entry flow

### Measurement Tracker
- Cadence: `quarterly`
- Check:
  - trend logic
  - unit handling
  - chart/readability quality

### Student Group Randomizer
- Cadence: `quarterly`
- Check:
  - fairness/randomization behavior
  - classroom UX

### Contextual Timeline Builder
- Cadence: `quarterly`
- Check:
  - legal/research export quality
  - timeline editing UX

### Position Size Calculator
- Cadence: `quarterly`
- Check:
  - formula correctness
  - risk wording
  - disclaimer strength

### Voice-to-Invoice
- Cadence: `quarterly`
- Check:
  - speech support
  - invoice formatting
  - export behavior

### Refrigerant Leak Calculator
- Cadence: `quarterly`
- Check:
  - field assumptions
  - business-use wording

### Warranty Tracker
- Cadence: `quarterly`
- Check:
  - reminder logic
  - expiry views

### AI Resume Builder
- Cadence: `quarterly`
- Check:
  - output quality
  - template relevance
  - hiring-market wording

### Age Calculator
- Cadence: `quarterly`
- Check:
  - edge cases
  - additional stats wording

### Unit Converter
- Cadence: `quarterly`
- Check:
  - conversion coverage
  - precision handling

### QR Code Generator
- Cadence: `quarterly`
- Check:
  - download quality
  - mobile scanning tests

### WhatsApp Tools
- Cadence: `quarterly`
- Check:
  - formatting preview
  - template substitution
  - wa.me link rules

---

## 4. Every 6 Months

These are mostly stable utilities. Review them twice a year unless bugs or browser changes appear first.

### Text Encryptor
### Data Leak Detector
### Privacy-First Data Transformer
### LLM-Ready Markdown Scraper
### Smart Log Analyzer
### Config Polyglot Converter
### Mock Data Generator
### Distributed Trace Correlator
### Schema Field Mapper
### JSON Formatter
### Text Diff Checker
### Smart Document Redaction
### Compress PDF
### Merge PDF
### Split PDF
### PDF Convert
### Doc Converter
### Text Extractor (OCR)
### PDF Search
### Image Tools Suite
### Password Generator
### Regex Tester

For all tools in this section, review:
- dependency health
- browser compatibility
- copy clarity
- performance on larger inputs
- whether the UI still feels current

---

## 5. Annual or Feature-Driven

Right now, almost no public tool should live here permanently because even “stable” tools still need periodic UX, browser, and SEO review.

Use this cadence only for:
- archived / low-priority tools
- experiments not currently being promoted
- tools with no meaningful external dependency and very low traffic

If a tool is active on landing pages, category pages, or blogs, keep it at least on a `quarterly` review.

---

## Monthly Operations Checklist

Run this once per month:
- review Search Console queries for top 15 money pages
- check GA4 for top-entry tools and bounce/engagement changes
- review all `Pakistan`, `finance`, and `decision system` tools first
- refresh `last updated` text where assumptions changed materially
- review `sitemap.xml` after any new tools or blogs
- check `llms.txt` only when platform positioning changes

---

## Budget / Policy Season Checklist

Run immediately around:
- Pakistan budget announcement
- Finance Act publication
- FBR clarification notices
- NEPRA solar / net billing updates

Priority order:
1. Pakistan Tax Calculator
2. Tax Shield Optimizer
3. Salary Slip Generator
4. Pakistan ID & Tax Hub
5. Pakistan Solar Calculator
6. Salary Offer Evaluator Pakistan
7. Freelance Tax and Reserve Planner
8. Investment Allocation Planner Pakistan

---

## Ownership Rule

If time is limited, update in this order:
1. `Pakistan tax`
2. `Solar`
3. `Investment`
4. `Rent vs Buy`
5. `EV / Hybrid / Petrol`
6. `Salary / Freelance`
7. everything else

That keeps the highest-risk and highest-value pages fresh first.
