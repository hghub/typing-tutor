# CODEX_CONTEXT

Read this file first at the start of every Codex session for `typing-tutor` / `rafiqy.app`.
Then read `docs/TASKS.md` and continue with the highest-priority next step.

Ignore `docs/new/` unless the user explicitly asks for it.

If this file and the live code ever differ, trust the live code and then update this file.

## 1. Project Identity

- Public brand: `Rafiqy`
- Repo folder name is legacy: `typing-tutor`
- Site type: privacy-first browser tools + decision systems
- Audience for integration, automation and AI services: Pakistan and international customers, with no single-geography restriction.
- Geography-specific tools (such as Pakistan tax) retain explicit local scope; reusable business tools and solution pages address international needs by default.
- Product promise:
  - useful
  - private
  - fast
  - browser-based
  - practical before clever

## 2. Current Product Shape

Rafiqy has three layers:

1. `Utility tools`
- small browser utilities

2. `Decision systems`
- deeper tools that compare options, explain tradeoffs, show recommendation logic, and support real-life decisions

3. `Future automation flows`
- guided multi-step workflows that reduce repetitive work
- these can become premium later

The strongest current strategic direction is:
- deepen a smaller number of serious decision systems
- support them with useful blog clusters
- keep Pakistan relevance strong without making pages too narrow for generic search queries

## 3. Stable Product Principles

### Product

- Do not build shallow, random tools if an existing cluster can be improved instead.
- A few strong decision systems are more valuable than many weak calculators.
- Every important tool should be understandable to normal users, not only power users.
- Important Pakistan-first tools should support simpler English and, where helpful, Roman Urdu-style intent bridging.

### SEO

- Core rule:
  - `generic intent first`
  - `Pakistan context second`
- Example pattern:
  - title/H1/front sentence should match the generic search query
  - local Pakistan value should appear in the subtitle, assumptions, explanation, examples, FAQs, and support content
- Do not remove Pakistan-specific logic just to chase generic ranking.
- Do not stuff `Pakistan` mechanically into every title.
- Keep one clear canonical URL per tool.
- For every strategic tool page, preserve the full SEO landing-page pattern:
  - one canonical only
  - route-specific title and meta description
  - H1 that matches the main query intent
  - clear early value statement
  - visible “what this helps you decide/do” section
  - visible methodology / trust / assumptions section where relevant
  - freshness / update cues for time-sensitive tools
  - early internal links into the support-guide cluster
  - related blogs written to reinforce the same query cluster
- When adding or updating a tool/blog, also review:
  - blog tags
  - blog filters/topic chips
  - category discovery
  - internal anchors
  - homepage/tools/blog surfacing if the cluster is important
- Blog URL taxonomy:
  - Integration/MuleSoft posts use `/blog/integration/<slug>`
  - decision/comparison/planning posts use `/blog/decision-support/<slug>`
  - practical utility guides use `/blog/utilities/<slug>`
  - do not create or keep flat `/blog/<slug>` post URLs
  - do not add redirect fallback routes for old blog URL patterns unless the user explicitly asks for a migration exception
  - internal links, share URLs, canonical tags, and sitemap entries must use the sectioned URL

### Engineering Discipline

- Treat discovered architecture, SEO, design, accessibility, or workflow issues as reusable system improvements, not one-time fixes.
- When a task exposes a better pattern, update code helpers, QA checks, and docs so future small tasks follow the same standard automatically.
- Avoid parallel patterns for the same concern. One canonical implementation should drive rendering, links, metadata, sitemap, and docs.
- Do not leave hidden compatibility behavior such as redirects, duplicate routes, or old URL patterns unless there is an explicit migration decision.

### Content

- Every important tool should have at least `one real, need-based blog post`.
- Blogs should:
  - start from a real user problem
  - explain the issue clearly
  - guide the reader
  - naturally lead into the tool
- Blog posts are not filler for SEO. They should be genuinely useful.

### Pakistan-first accessibility

- Some tools need a plain-language bridge for Pakistani users with weaker English.
- Use the `PakistanFriendlyGuide` pattern only where it improves understanding.
- Do not add it to every tool mechanically.

Guide density rule:
- `full`:
  - high-stakes
  - jargon-heavy
  - under-discovered
  - strongly Pakistan-first
- `light`:
  - mostly understandable tools that still benefit from one plain-language explanation
- `none`:
  - obvious utilities

### Design

- Never use purple text/accent on dark backgrounds.
- Prefer readable neutral, cyan, blue, green, or orange accents depending on context.
- Decision-system pages should stay readable, structured, and not feel like walls of text.
- Prioritize:
  - H1 first
  - clear value statement
  - tool interaction above long explanation
  - actionable guidance
  - collapsible advanced detail when needed
- Important UX rule:
  - the user should be able to start using the tool quickly without reading a long essay first
  - explanations like methodology, deeper FAQs, how it works, and support content should usually come below the core tool interaction or after a short intro/trust layer

### Tool language architecture — 16 November 2026

- `toolLanguage` (`en`/`ur`) is separate from the legacy `urduLabels` card preference. `useToolLanguage` and `ToolLanguageSwitcher` expose a persistent local choice on supported tools.
- Urdu core presenters live in `UrduToolViews.jsx` and reuse parent state and the existing quantitative engines. Preserve user inputs, forecast history and selection across language changes; never translate record contents or alter calculations as a side effect of switching.
- Use explicit Urdu wording, scoped `lang`/RTL and bidi-isolated LTR numbers/currency; do not use runtime machine translation or DOM text replacement. Treat dynamic errors and exports as user-facing content.
- First coverage: rental, stock/forecast, salary and freelance reserve core views. Do not claim full site translation: advanced rental narratives and global nav/SEO/help/blogs are still English. Add further tools and full feature parity incrementally with coverage and browser checks.

## 4. Architecture That Should Stay Stable

- Stack:
  - React
  - Vite
  - React Router
  - React Helmet Async
  - local-first browser tools
  - Supabase only where explicitly used

Key files:
- `src/main.jsx`
  - all routes are defined manually here
- `src/tools/registry.js`
  - single source of truth for tool definitions and base categories
- `src/data/toolSEO.js`
  - tool SEO metadata, headings, paragraphs, FAQs
- `src/data/categoryPages.js`
  - shared category-page metadata and priority ordering for UI + prerender
- `content/blog/`
  - source-of-truth blog posts as one markdown file per post
- `src/data/blogIndex.js`
  - generated blog metadata index for listings, links, and discovery; do not edit directly
- `src/data/blogContent/`
  - generated per-post article modules; do not edit directly
- `scripts/generated/blogPrerenderData.mjs`
  - generated build-only blog dataset with full article HTML for prerender and QA; do not edit directly
- `scripts/sync-blog-posts.mjs`
  - syncs markdown blog source into generated app data
- `docs/BLOG_PUBLISHING_PLAYBOOK.md`
  - blog publishing rules, including MuleSoft technical posts and DOCX intake workflow
- `src/components/ToolLayout.jsx`
  - shared SEO/meta/related-tools wrapper for most tools
- `public/sitemap.xml`
- `public/llms.txt`

Important exception:
- `src/App.jsx`
  - Typing Tutor is special and not a normal `ToolLayout` page

Important implementation notes:
- `src/tools/registry.js` exports `TOOL_CATEGORIES` and `TOOLS`
- do not preserve hardcoded tool counts in docs unless they are intentionally updated
- some discovery surfaces use curated cross-listing logic on top of the primary tool category
- category pages and `/tools` discovery should stay aligned when categories or tool placement change
- rendering strategy is now defined in `docs/PRERENDER_ROLLOUT_PLAN.md`
- stable rule:
  - content/discovery pages should be fully prerendered
  - important tool pages should be prerendered and then hydrated
  - all major decision-system pages are included in that hybrid prerender model
- current implementation:
  - `scripts/prerender-routes.mjs` defines the selected prerender set
  - `scripts/prerender-content.mjs` builds route HTML from shared content/data sources
  - prerender coverage currently includes:
    - core static pages
    - blog index + section pages
    - all category pages
    - all current blog posts
    - strategic tool and decision-system routes
  - Vercel deployment rule:
  - `scripts/prerender.mjs` must stay browserless/static in the normal Vercel build path
  - do not rely on Playwright/Chromium or `apt-get` during Vercel builds
  - if browser-based rendering is needed later, run it in a supported CI/build environment and publish static output before Vercel deploy
- blog authoring rule:
  - edit markdown files under `content/blog/`, not generated files under `src/data/blog*` or `scripts/generated/`
  - `npm run dev` and `npm run build` now run blog sync automatically
  - one post per file is the stable content workflow going forward
  - stable runtime pattern:
    - listing/discovery pages use `BLOG_INDEX`
    - article pages lazy-load one generated content module per post
    - prerender/QA use the build-only generated blog dataset

## 5. Standard Workflow For Any New Tool

When adding a new tool, do not wait for the user to remind you about each piece.

Default checklist:

1. Build the tool page
- usually under `src/pages/...`
- use `ToolLayout` unless the tool truly needs a custom full-page structure

2. Add tool to registry
- `src/tools/registry.js`
- correct category
- tags
- related tools
- Urdu labels if useful

3. Add route
- `src/main.jsx`

4. Add tool SEO
- `src/data/toolSEO.js`
- follow the rule:
  - generic search phrasing first
  - local/Pakistan context second

5. Add at least one related, need-based blog
- `content/blog/<section>/<slug>.md`
- do not add hollow content
- update relevant tags/topic chips/related-guide priority if the new content creates or strengthens a cluster

6. Connect discovery
- homepage if important
- `/tools`
- category pages
- related guides
- search aliases if useful

7. Update machine-readable files if needed
- `public/sitemap.xml`
- `public/llms.txt` if the site’s strategic scope changed meaningfully

8. Validate
- `npm run build`

9. Update project memory if needed
- durable rule -> `docs/CODEX_CONTEXT.md`
- current next step -> `docs/TASKS.md`

## 6. Standard Workflow For New Decision Systems

Decision systems are not plain calculators.

They should usually include:
- presets
- scenario inputs
- recommendation logic
- sensitivity checks
- explanation of why the result changed
- clear “what you should do next”
- related support-content cluster

Decision-system output should avoid fake certainty.

Prefer:
- `foundation`
- `fit`
- `risk`
- `clarity`
- `recommended next step`

Avoid:
- crude one-number verdicts pretending to decide the user’s life

## 7. Stable SEO Rules

### Titles and descriptions

- Query match first, context second
- Example:
  - `Hybrid vs Petrol Calculator | Compare Petrol, Hybrid and EV Costs | Rafiqy`
  - not only a narrow local wording unless the page truly serves only that query

### Home / blog / category discovery surfaces

- They should help both:
  - direct users
  - search engines / LLMs
- Blog and category surfaces must be maintained as living discovery systems, not dead archives

### Sitemap and llms

- Keep sitemap current when:
  - tool routes change
  - category routes change
  - important blog content is added
- `llms.txt` should reflect:
  - site purpose
  - key page families
  - planning/not-official boundaries
  - current high-level positioning

### Technical blogs

- MuleSoft has a dedicated blog category: `mulesoft`.
- Technical posts must use proper H2/H3 structure, tables where useful, and `<pre><code class="language-...">` for code blocks.
- If the user provides DOCX source drafts, treat them as source material and convert them into clean blog content instead of publishing raw converted HTML.
- Current behavior, version-specific claims, or official platform details should be checked against official documentation before publishing.

## 8. Stable Operations Rules

GitHub synchronization (21 November 2026): identity and installation for hghub are now visible and a harmless unattached blob write succeeded. This resolves the observed write403 for that test; the connector still also lists an unfamiliar bilalcodehub installation, which was not accessed or removed. Never use that account. vercel.json disables automatic Git deployments for codex/* review branches; main and production publication still require exact-batch approval. Keep this guard in every review-branch snapshot and do not push an older unguarded intermediate commit. See docs/GITHUB_SYNC_REVIEW.md for synchronization scope and verification.

Service-worker privacy (prepared20November2026, not yet deployed):
- Supabase GET responses use NetworkOnly with fetch cache:no-store; no private API response may fall back to a shared offline cache. Static public asset precaching is separate. Do not add public API exceptions without a reviewed explicit scope.
- Activation cleanup deletes only the known legacy supabase-cache by name, never reads its contents and never clears all origin caches/localStorage. This is browser cache cleanup code, not a DB change or proof of prior exposure. Actual installed-worker update/offline/cleanup checks remain a release gate.
- Build QA checks the generated worker and cleanup artifact; synthetic tests check the route and narrowly scoped asynchronous deletion. These are not evidence of live cache removal. Older workers/devices are unchanged until an approved release activates.

High-risk freshness clusters:
- tax
- solar
- investing
- rent vs buy
- EV / hybrid / petrol
- salary / freelance

Decision systems and Pakistan-first money tools need regular review for:
- assumptions
- current-year references
- legal/policy changes
- internal links
- blog cluster freshness

Search Console and GA4 should guide later tuning once enough data exists.

When stable product/SEO/process learning emerges from implementation work, add it back here so future sessions inherit it automatically.

Build validation now includes:
- `npm run build`
- Vite production build
- browserless static prerender for selected routes
- build QA checks for route SEO basics and blog content structure
- current QA baseline:
  - 150 prerendered routes verified
  - 110 blog posts verified

`npm run lint` remains useful but is not yet the deploy gate because the older app has existing lint debt that should be cleaned up separately.

## 9. Current Important Clusters

Strong current clusters:
- Typing Tutor
- Urdu Keyboard
- Tax Calculator
- Solar Calculator
- Loan EMI
- Investment Allocation Planner
- Rent vs Buy
- Petrol vs Hybrid vs EV
- Salary Offer Evaluator
- Freelance Tax Planner

Pakistan-first but useful hidden tools:
- Data Leak Detector
- Doc Redaction
- Text Extractor
- Voice Invoice
- WhatsApp Tools
- Salary Slip
- Pakistan ID & Tax Hub

## 10. Decision-System Concepts Already Defined

These concepts already exist as direction and should not need to be re-invented from scratch each session:

- Marriage readiness / match guide
- Study & career direction guide
- Trauma recovery / support guide
- Youth self-employment / start-your-own-work guide

They should be treated as high-trust systems:
- careful boundaries
- explanation-first outputs
- no simplistic verdicts
- expert review before public launch quality

If these are revisited, continue from their already-defined ideas rather than starting concept discovery from zero.

## 11. What To Avoid

- Do not rebuild naming and positioning from scratch each session.
- Do not overuse internal-planning language on public pages.
- Do not add generic filler blogs.
- Do not dilute strong clusters by adding too many unrelated tools too quickly.
- Do not reintroduce purple text on dark backgrounds.
- Do not narrow pages so much that a Pakistan user searching generically cannot find them.

## 12. Documentation Rule Going Forward

From now on:

- `CODEX_CONTEXT.md`
  - stable project memory
  - durable rules
  - architecture and strategic principles

- `TASKS.md`
  - current priorities
  - next steps
  - rolling operational queue

## 13. Maintenance and Consulting Direction — November 2026

Confirmed by the user on 15 November 2026:
- Prior local Windows checkout: `D:\Haider\Rabi zidni ilma\githubCopilotCli\typing-tutor`.
- It may contain local Codex history/memory and unpublished ideas. Its existence/current contents have not been verified from the cloud environment; compare local-only edits before releasing when access is available. Never imply that another Codex session or Windows directory was inspected automatically.
- Continue project memory from this file and `docs/TASKS.md`; preserve recovered ideas and their evidence/status rather than rebuilding the roadmap each session.
- Keep the existing useful Pakistan-first tools, and develop a clear integration, automation and applied-AI service path that can attract consultancy opportunities for Haider.
- Initial accepted business-tool directions are Automation Opportunity Finder and Integration Project Planner, followed by focused, working AI demos for common needs, SMEs and enterprises.
- The user also proposed cross-layer integration/website/mobile monitoring with controlled remediation and notifications, and an Ollama-assisted migration workbench to reduce recurring paid-model inference costs. Explore these as scoped products rather than universal platform claims. Keep a daily local/global opportunity pipeline in `docs/TASKS.md`.
- Business-value positioning should emphasize failed orders, missing invoices, reconciliation exceptions, API/mapping changes, private document processing and practical migration outcomes; technical implementation supports a clear user problem.
- User-requested vertical discovery includes inventory/warehouse/supply-chain replenishment plus pizza shops, bakeries, pharmacies, retail stores, doctors, dentists, lawyers and media professionals. Build reusable workflow capabilities with sector-specific templates; keep quantitative planning in validated code and professional decisions under qualified review. Start with one small, measurable pilot rather than multiple full management suites.
- Local inference reduces dependence on metered cloud tokens but still incurs compute, operations and review costs. Prefer parsing/templates, retrieval and validation first; prompting is not training, and fine-tuning requires measured justification.
- Show useful initial results without forcing visitors to disclose contact details. Make implementation enquiries optional and clearly separate from calculator/document inputs.
- Financial/rate/policy updates must cover tools AND their related blogs/SEO/FAQs; do not merely replace a year in a title. Validate current authoritative sources and effective dates.

Market scope clarified by the user on 16 November 2026:
- National and international growth are both explicit priorities. Do not interpret the existing Pakistan-first calculator/content base as a geographic limit on consultancy, integrations, automation or AI services.
- Select opportunities by a demonstrated operational problem, reachable decision-maker, willingness to fund a pilot, permitted data/system access, manageable delivery effort and measurable benefit. Geography alone is not evidence of demand or purchasing readiness.
- Offer a small useful improvement around the buyer's existing systems before proposing a platform replacement. Frame benefits as outcomes to measure (planning time, missed orders, reconciliation exceptions, waste, response time), not invented savings or guarantees.
- Use clear English for reusable business pages and campaigns; add local language, currency, time-zone and regulatory variants when justified. Currency labels are not FX conversion, and international availability is not universal compliance or connector support.
- Keep qualified lead/pilot conversion as the consulting-growth objective, alongside tool usefulness. Validate acquisition channels and buyer assumptions before paid promotion; public content and spending retain the existing approval requirements.

Approval and privacy rules:
- Prepare focused changes and post drafts; obtain explicit approval for the exact batch before production deployment, public previews, Facebook publication/scheduling, live database changes or spending.
- Rafiqy already uses an active Supabase database. Reuse appropriate existing infrastructure without weakening access controls or assuming repository SQL equals deployed configuration.
- Inspect live schema/policies/grants through authorized metadata access before proposing changes. Do not retrieve customer rows to prove exposure.
- Never put service-role/secret keys in browser code, Git, screenshots, logs or approval reports. Publishable/anon client keys do not replace database authorization.
- Client-side filters and localStorage user/profile codes are not access-control boundaries for private customer data. Private enquiries and saved records require database/server-enforced authorization and isolation.
- Keep enquiry details in an authenticated private inbox. Notification messages should contain only the minimum necessary reference and private link; the user must select the recipient email.
- Test data isolation with synthetic records in a safe environment. Prepare any necessary migration and user-data ownership transition for review before changing a live database.
- The daily workflow prepares work and reports approvals/blockers; configured scheduling does not prove that database enquiry monitoring or email delivery is already implemented.

Salary-tax implementation direction (16 November 2026):
- `src/lib/salaryTax.js` is a year-specific, salary-only base-estimate engine used by the main calculator. Default TY 2027/FY 2026–27 data was verified from FBR Circular 02 of 2026–27, page 4, items 7–8, including withdrawal of the salaried surcharge. TY 2026 is explicitly historical. Personal credits/rebates and income above PKR 100M require separate treatment.
- Do not silently migrate freelance/business income onto salary slabs. The legacy `taxData.js` consumers require their own verified migration; updating the main calculator does not update them. Check all dependent tools and related guides before a cluster release.

Freelance cash-planning direction (16 November 2026):
- `src/lib/freelanceReserves.js` performs cash allocation using a required explicit annual tax funding budget. Do not apply salary slabs to freelance revenue, infer tax liability from this cash budget or call the remainder universally safe to spend. Show deficits separately, keep household runway distinct and label fixed-allocation stress scenarios. The component requires tax input rather than silently assuming zero. Actual freelancer tax modelling is a separate, source-verified project.

Stock planner implementation direction (16 November 2026):
- The first selected growth demo uses deterministic replenishment planning with editable synthetic sector examples. Separate quantity shortages from delivery timing gaps; confirmed orders count once even if late. Show pack/MOQ and shelf-life constraints, an explainable calculation and a downloadable integration-discovery brief.
- The stock page also includes a small local statistical forecast lab: 42–366 daily values, weekly/recent-mean/SES baselines, chronological rolling seven-day comparisons and an explicit copy-average action. It is not a general-LLM forecast, a calibrated uncertainty model or evidence of production accuracy.
- Describe advanced ML, LLM assistance, POS/ERP integration, batch expiry, recipes and constrained optimization as scoped custom implementations until actually built and validated. Numeric forecasting and inventory policies remain outside LLM authority.
- Do not call steady user-entered usage an AI forecast, invent connectors or imply enquiry capture exists. Demand forecasting, batch-level expiry, recipes/POS imports and purchasing execution are later extensions after validation.

If a new finding is stable and likely useful in future sessions, add it to `CODEX_CONTEXT.md`.
If it is an active next step, open question, or temporary priority, add it to `TASKS.md`.


Production continuity checkpoint17November2026:
- Bilingual application source32484f5 was approved and deployed16Nov to dpl_AKEhcGpFGBMazQ289m6biR8T1puN; current Vercel metadata confirms READY production. Older local docs saying unpublished are superseded. GitHub main6c4651a remains stale; never deploy it over current production. Previous GitHub write403 remains unresolved, not retested with a write.
- Rental math is now in src/lib/rentVsBuy.js. Keep annual-to-monthly unit conversions independent of horizon, cap payments at loan maturity and use scenario-specific loan balances. A simplified fixed first-year investment contribution must be labelled; it is not a full equal-budget cashflow model. Never present heuristic confidence or crossover formulas as calibrated probabilities or verified break-even.


Synthetic workflow architecture (17 November 2026):
- User explicitly authorized two synthetic demos together. `orderReview.js` implements a strict sample-format parser and deterministic review checks; `migrationEvidence.js` implements bounded mapping/fixture comparison. Neither is an LLM integration or production runtime. Keep demo wording explicit and reports honest about what ran.
- Order drafts require all demo blockers resolved plus explicit approval; changing inputs or decisions clears approval. Preserve source evidence, use integer cents and escape spreadsheet export fields. Catalogue IDs and units come from authorized data in a future implementation, never model invention.
- Migration fixture agreement is not code compilation, runtime execution or proof of equivalence. Keep unsupported connector/retry/configuration gaps visible even when mapping checks pass. Never execute user/generated code in the browser or a privileged host.


Salary-offer disclosure rule (18 November 2026):
- SalaryOfferEvaluator still calls legacy FY2025–26 rules; the current patch labels it historical and removes false refresh claims. This is not current-year migration or certification of historical payroll accuracy. SalarySlip and optimizer remain separately pending. FBR index metadata or a Finance Bill cannot substitute for the enacted table and effective-date verification.
- Compensation package value can include restricted/non-cash and one-time benefits. Never label package-minus-budget as disposable cash or guaranteed savings. Heuristic scores are not calibrated probabilities. Narrow-screen grid fixes still require actual browser verification.

Salary-slip scope (prepared21November2026, unpublished):
- SalarySlip now uses salarySlipTotals for validated entered payroll amounts. It no longer calls legacy taxData or hard-codes EOBI rates/caps. Require explicit payroll-confirmed tax and employee EOBI, including zero where applicable. Do not infer taxable pay or compliance from gross allowances. The separate salary calculator is a base-estimate reference, not automatic recorded withholding.
- Validate minor-unit amounts/month and reject deductions above gross; no preview/print while invalid. Label output draft and keep employer-review/no-proof limits in printed content. Assign user-controlled print titles through document.title, not HTML interpolation. Form inputs are page memory, not saved employee templates; print uses a browser window, not direct PDF/image generation.


Community workflow direction (18 November 2026):
- User requested three carefully detailed demos: daily goods distribution, recurring shared service contributions (guards/cleaners) and appointment administration (e.g. clinics). Build sequentially, reuse existing stock/order/review components where helpful and avoid shallow full management suites.
- Shared services contributions differ from rotating kameti payouts. Keep agreed current dues separate from receipts, protected extra payments, approved expenses and a structural budget shortfall. Opening unrestricted cash must exclude earlier restricted money; never imply a page-memory worksheet is a verified ledger.
- For delivery and scheduling, deterministic state transitions, units, capacity, idempotency and staff-controlled approvals precede an AI assistant. AI may propose permitted message extraction, evidence-backed explanations and drafts; it must not fabricate receipt/delivery/appointment confirmation or make clinical decisions. Keep member/patient/recipient data private and omit details from public summaries and notifications.
- Aggregate fund exports must be understandable independently: include the opening/closing/unrestricted cash trail and protected excess alongside both funding gaps. Recorded receipt/payment amounts are not independently verified bank balances. Warn first when unrestricted cash is negative, including when closing cash is positive or all expenses are marked paid. Preserve exact minor-unit conservation; protected excess cannot repair a budget deficit. Omit member/expense references, and remind reviewers that even aggregates need an appropriate audience.


Homepage architecture (prepared21November2026):
- src/data/homepage.js is the shared curation/meta source for Landing and static home prerender. Resolve tool IDs through registry and guide slugs through blog route helpers; never duplicate canonical paths/counts. Complete category directory remains reachable beneath primary task groupings.
- src/lib/toolSearch.js owns shared scoring for home and SmartSearch. Tool-name matches should rank ahead of incidental descriptive keywords. Home query stays in local component state, not URLs/analytics/storage.
- Shared ToolsNav provides responsive menu, theme/preferences and breadcrumbs. Keep direct destinations useful on desktop and mobile. Actual phone/menu QA is separate from desktop screenshot checks.
- Keep optional backend initialization off unrelated page load: Typing Tutor is lazy, existing feedback client imports on submission, and backend error responses must not be called successful delivery. This does not repair authorization or configure private enquiry monitoring.
