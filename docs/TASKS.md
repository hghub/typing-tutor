# TASKS

Read `docs/CODEX_CONTEXT.md` first.
Then use this file as the current working queue for `rafiqy.app`.

This file should be updated whenever:
- priorities change
- a major batch is completed
- a new long-term opportunity becomes actionable
- a future Codex session learns something operational that is not yet captured here

## Current Priorities

### 22 November 2026 — rental cash display and navigation accessibility

- GitHub source synchronization is now working: remote review codex/rafiqy-homepage-navigation is bd6681d and matches the earlier local b40e890 tree. New local codex/rafiqy-usability-review starts from that remote snapshot, preserving the older local history. Main remains stale6c4651a; approved production32484f5 deployment metadata rechecked READY22Nov. Keep the codex/* deployment guard; do not force-push divergent local history or deploy main.
- Corrected Owner upfront cash to include assumed entry costs already present in the calculation; explicit shared output, English/Urdu cards and summaries, paired guide/FAQ/sitemap agree. Added independent numeric regression (83 total tests). No new rate/tax-law number or fresh-market assertion.
- Preferences now keyboard-operable labelled switches, bounded nonmodal dialog/Close, scoped Escape/focus restore, trigger-safe pointer dismissal; cloud and backup copy no longer claims successful save/all-data coverage. No cloud sync enabled, backup import/export or customer records used.
- Actual340px CSS viewport via browser400% zoom: homepage/rental widths337, rental one305px column; desktop1363px/home1348. Narrow menu navigation and keyboard/focus checks, both themes, rental input preservation and both-language cash summary checks pass. Device emulation is blocked; no bypass. Not physical-phone/touch/download/print/installed-worker evidence.83 tests/scoped lint/diff/full buildQA159routes115posts pass. Exact review, remaining gates, dated primary sources and final held rental caption in USABILITY_REVIEW_2026-11-22.md.
- Supabase search22Nov: available but not installed. Live metadata-only review still blocked; unconditional repository SQL is not proof deployed/exposed. Lead/email monitoring unconfigured; Facebook unconfirmed/unaccessed. No liveDB/customer access/production merge/push/deploy/publicpreview/post/spend. Earlier unpublished dependencies still require exact combined approval or isolation before publication.
- Next useful cleanup observed during directory QA: ToolsHome's blanket No Uploads/offline/No Login claims and hard-coded category count need bounded per-tool wording. Keep the existing quality queue; do not start a new app before prior gates.

### Homepage/navigation — direct user request21November2026

- New local codex/rafiqy-homepage-navigation based on clean8d1f9e4, preserving all prior unpublished work. Rebuilt homepage with local shared-vocabulary search, eight task categories/full15-category directory, six starters, four labelled demos, guides/FAQs/footer and responsive shared navigation. Registry-driven destinations/counts; matching static homepage prerender/metadata. No invented live integration/AI/privacy claims.
- Supporting rendering repair: lazy-load Typing Tutor; defer existing feedback client until submission and handle returned errors truthfully. Missing local Supabase config no longer prevents homepage/directory/blog/category rendering. No feedback submitted or DB/customer access; backend security remains separately pending.
-82 tests/scoped lint/buildQA159routes115posts/diff pass. Managed internal preview works in this environment; actual desktop search/themes/category/directory/guides/anchor/skip-link checks passed. Phone viewport/menu interaction still pending; earlier file-policy restrictions remain respected. See HOMEPAGE_REVIEW.md for exact evidence and held caption.
- Publication still requires exact approval; branch includes earlier unapproved changes and homepage links unpublished demos. Isolate from published32484f5 with unavailable links held, or review combined source and checks. No push/deploy/publicpreview/FB/DB/spend. Lead/email monitoring not configured. Continue current branch; do not overwrite it from older automation checkpoints or stale remote main.

### 21 November 2026 — salary-slip payroll draft correction

- Continued clean codex/rafiqy-community-workflows from04d2cdc; all prior unpublished work preserved. Local edits/commit only, with no deploy hook or remote push. Current live approved source remains32484f5 as last verified20Nov; no new production release or claim of fresh live interaction checks.
- SalarySlip previously auto-applied legacy taxData and a hard-coded EOBI wage cap while saying current. Replaced with explicitly entered payroll-confirmed tax/employee EOBI and minor-unit gross-to-net validation. Blank deductions require explicit zero if applicable; invalid amounts/month and deductions above gross suppress preview/printing. Scope change is intentional: drafting actual payroll records, separate from the base-estimate salary calculator. No new statutory calculation or EOBI eligibility claim.
- Removed unsafe raw employee-name interpolation in print title (document.title assignment instead); handle blocked print window. Printed copy remains labelled draft/no proof or compliance and employer review required. Form grid shrinks below320px, inputs use1rem fonts and proper associated labels, long text wraps. Real browser/mobile/print-dialog tests still pending.
- Coordinated two direct guides salary-slip-pakistan/salary-slip-simple-guide-pakistan and salary-slip sections of pakistan-tools-guide, SEO/FAQs/registry/sitemap/generated assets. Removed unsupported automatic PF/provincial deductions, saved profiles, image-export and blanket compliance claims. Other inaccurate clusters in aggregate guides remain separate work, not certified current by this patch.
- Primary verification21Nov: FBR index lists TY2027 current/TY2026 previous. TY2027 rate-card PDF successfully retrieved, salary rows pages1–2 read and page2 visually inspected; updated through30June2026 FinanceAct2026, statute-prevails disclaimer. Prior circular PDF timed out. No new numeric rates or surcharge rules imported; main salary engine unchanged. EOBI current basis not verified, so no auto cap/rate retained. Exact URLs in RELEASE_REVIEW and paired guide.
- Five new payroll tests cover explicit withholding, blank/invalid inputs, cents, excess deductions and zero net/immutability;79 combined tests pass. Scoped lint/diff and full buildQA159routes115posts pass. Synthetic render checks with feedback stubbed cover missing-deduction output blocking and a valid70000gross/100tax/0EOBI=>69900draft; no real employee data. Actual browser/phone/print checks remain release gates.
- Held salary caption added to RELEASE_REVIEW, separate approval required after reviewed release and actual QA. Existing unpublished dependencies need isolation from32484f5 or exact combined approval. No push/deploy/publicpreview/FB/liveDB/customer access/model/spend. Supabase metadata access remains unavailable, existing repository SQL risks not fixed by this draft patch. Lead/email monitoring unconfigured. Do not call full tax/payroll/solar/rates cluster current; distribution/appointments remain queued.

### 20 November 2026 — local PWA API-cache privacy fix

- Continued clean codex/rafiqy-community-workflows from3a08815, preserving prior unpublished work. No local operation invokes a deployment hook or pushes a branch. Remote main still6c4651a by read-only lookup; approved bilingual Vercel deployment dpl_AKEhcGpFGBMazQ289m6biR8T1puN verified READY/production20Nov. GitHub write403 not retried; do not deploy stale main.
- Replaced broad Supabase NetworkFirst GET caching with explicit NetworkOnly and fetch cache:no-store. No public endpoint allowlist is assumed safe. Public static asset precaching remains; Supabase-backed data, including passages formerly using that fallback, requires a connection. Existing tools may retain their separately implemented local state; this patch does not erase it or create an offline write queue.
- Added activation script deleting only the former supabase-cache, without listing/reading records or clearing other caches/localStorage. Deletion promises are passed to waitUntil; missing cache is harmless, failures are not falsely reported as success. This is prepared code, not live cleanup. Updated About's broad offline and never-leaves-device claims to disclose cloud/online requests.
- Three new synthetic PWA tests cover network-only/no-store host matching, deletion limited to the named cache with unrelated caches preserved, asynchronous wait/missing-cache/failure behavior. Combined74 tests pass. Build QA now checks generated worker wiring, absence of old NetworkFirst/cache rule and exact cleanup artifact. Relevant lint/diff/full build checks recorded in RELEASE_REVIEW. Actual installed-worker upgrade, offline requests, storage-failure and multi-tab/browser/mobile testing still required; no policy bypass or public preview.
- Primary references checked20Nov: Chrome Workbox routing, strategies (NetworkFirst caches successful requests and can serve fallback; NetworkOnly requires network), generateSW importScripts option, and MDN CacheStorage.delete named deletion/false when absent. URLs in RELEASE_REVIEW. No numeric tax/rate update or new business app. SQL policies remain unsafe repository definitions, live configuration unverified; no metadata connector/customer-row access/live DB change.
- Approval scope: this code removes the old browser API cache only after a separately approved release activates. Review combined branch dependencies or isolate privacy fix from published32484f5. No push/deploy/publicpreview/Facebook/model/spend/DB write; lead/email monitoring unconfigured. Existing held captions unchanged; security maintenance is not promoted as a proven security guarantee. Community-fund browser QA and broader tax/solar/rate work remain open; distribution/appointments queued.

### 19 November 2026 — fund reconciliation and standalone summaries

- Continued clean local `codex/rafiqy-community-workflows` from c451e07; preserved all previous unpublished work. No new app or public action. Remote main remains6c4651ad17b2f63f76d2b4b383373896bd2798d1 by read-only lookup; latest approved Vercel deployment dpl_AKEhcGpFGBMazQ289m6biR8T1puN remains READY/production with rafiqy.app aliases. Do not deploy stale remote main.
- Fund English/Urdu aggregate summaries now carry opening cash, net agreed dues, total/allocated receipts, protected excess, total/paid/unpaid costs, calculated closing/unrestricted cash and both funding gaps. Put reconciliation warnings before amounts. Replaced potentially misleading “confirmed receipts” wording with recorded/entered figures; neither summary certifies bank balances or payments. Urdu currency figures and period use directional isolates. No member/expense references are exported; review aggregates and audience before sharing.
- Updated the paired markdown guide with the sample cash trail, negative-cash/protected-money limitations and sharing cautions; matched tool SEO and sitemap dates. No tax/rate numbers or regulatory claims changed; earlier external source verification dates remain18Nov or earlier as documented, not newly refreshed today.
- Seven new fund tests include 216 small money scenarios checking conservation, plus collection absorbed by a budget surplus, protected cash misuse despite a positive balance, all-paid-but-negative-cash reconciliation, maximum supported amounts/rows, input immutability/order independence and English/Urdu report integrity. Combined71 tests pass; scoped lint, diff check and full buildQA159routes115posts pass. Synthetic page server rendering checked separately with feedback stubbed; actual browser/phone/download interactions remain pending, not replaced by SSR. Existing preview/file-policy limitations not bypassed.
- New security follow-up found while reading source: vite.config.js has a broad NetworkFirst cache for Supabase URLs. Audit which GET responses are cached and plan a public-content-only allowlist plus private-cache cleanup/logout behaviour before adding private records. This is a repository configuration observation, not proof of cached customer records or live exposure. No service worker/security policy change made in this focused batch. Existing unconditional Supabase SQL policies still need authorized live metadata review; no connector available and no customer rows read.
- Exact local changes since c451e07 and the held caption are in RELEASE_REVIEW. Combined rental/order/migration/offer/fund dependencies remain unapproved; isolate from published32484f5 or obtain exact combined-batch approval after browser checks. No GitHub write retry, push, deployment, public preview, Facebook access/post, live DB write, external model call or spending. Lead/email monitoring is not configured. Distribution and appointment apps remain queued behind fund validation.

### Community and daily operations demos — user request 18 November 2026

Haider requested goods distribution, monthly street-member contributions for guards/cleaners, and appointment management such as clinics, developed slowly with careful details and useful AI only where justified. Continue sequentially; do not build three unfinished live apps or add AI to arithmetic.

| Demo | Small useful workflow | Specific differentiation | Optional AI after evaluation | Main boundaries |
| --- | --- | --- | --- | --- |
| Shared services fund — first synthetic version prepared | One period: agreed contributions/reductions, entered receipts, approved/paid costs and protected excess | Explain collection timing versus a budget that still fails after everyone contributes; aggregate English/Urdu summary without member references | Evidence-linked private receipt matching, committee Q&A and polite reminder drafts | No payment processing, autonomous waivers, public unpaid-member lists or inferred reliability scores |
| Daily goods distribution — queued | Recurring orders for milk/bread/water or similar goods; pause/skip, dispatch, partial/delivered/failed, returns/containers, collected cash and reconciliation | Close the loop between what left the depot, what reached each stop, what returned and what was collected; explain exceptions | Parse permitted order-change messages into proposed amendments; summarize failed deliveries and prepare staff-approved responses | Use explicit quantities/units, cutoff times, duplicate-event handling, offline conflict rules and authorized evidence; no invented delivery or collection status |
| Appointment administration — queued | Practitioner/room calendars, service duration/buffers, booking/hold/confirmation/cancel/no-show, staff-managed waitlist | Prevent double booking and stale cancellation-slot offers; use availability/arrival order and staff rules without clinical scoring | Natural-language scheduling requests, evidence-based admin summaries and reviewed reminder drafts; statistical waiting-time estimates only after actual data validation | No diagnosis, prescribing, automated clinical urgency/recall intervals or patient selection using health attributes; no sensitive details in reminder previews |

- Both Pakistan and international buyers remain in scope. Candidate buyers: resident associations/property managers, doorstep distributors/branch operators, and small practices/reception teams. These are buyer hypotheses, not validated demand. Existing alternatives include spreadsheets/accounting or association software, POS/delivery platforms, and calendar/practice systems. Prefer an integration pilot that fixes one documented failure rather than a replacement platform.
- Pilot economics: paid setup for rules, migration and an existing-system connection; recurring support/private hosting by association/branch/practice if demand supports it. Cost drivers are authorized connectors, messaging/maps licenses, inference utilization, records/storage, support, recovery and human review. No invented savings or earnings. Validate with an owner interview and synthetic/authorized sample workflow before paid infrastructure.
- Common future foundation: authenticated staff roles, per-organization isolation, minimal data, event identifiers/idempotency, evidence/provenance, audit/correction trail, explicit state transitions, private views, consent-aware notifications, an outbox and backups. Existing permissive Supabase repository policies are NOT a safe starting authorization layer. Any real data access, live DB change, third-party processing, external message or paid service retains explicit approval.
- Source checks18Nov: official OR-Tools vehicle-routing-with-time-windows docs demonstrate optimization with travel matrices and constraints (https://developers.google.com/optimization/routing/vrptw); Google Calendar event concepts cover start/end/time-zone/status primitives (https://developers.google.com/workspace/calendar/api/concepts/events-calendars); Ollama structured-output docs support schema-constrained responses (https://docs.ollama.com/capabilities/structured-outputs). These support feasibility, not implementation or accuracy claims. LLMs propose/explain; deterministic validators or an evaluated solver own numbers, capacity and conflicts. No fine-tuning is assumed.

First implementation status:
- New local branch `codex/rafiqy-community-workflows`, created from clean d165e22; earlier rental/demo/salary-offer patches preserved. No push/deploy/public preview. New route `/tools/community-fund-demo` plus engine/communityFund.js, page, nine meaningful tests, paired guide/SEO/FAQs/registry/discovery/sitemap/llms. No overlapping route found; existing kameti has rotating payouts and is a different workflow.
- Fund worksheet uses integer minor units, detects duplicate synthetic references, invalid amounts/periods and paid expenses above approval; separates net dues, outstanding collection, protected excess, cash reconciliation, immediate funding gap and structural budget gap. Opening cash is assumed already unrestricted. No earlier arrears, refunds, bank verification, immutable transactions or automated month rollovers. UI is a fixed four-unit/two-cost synthetic example; currency changes labels only. English interface with English/Urdu aggregate template summaries; not full Urdu localization or AI.
-64 combined tests pass, scoped lint/diff/buildQA159routes115posts pass. Browser/mobile/download interactions remain unverified due existing preview/policy limitations; no bypass attempted. Current offline Library file still contains the earlier TWO demos only; do not claim it includes this new page. Existing lead monitoring remains unconfigured.
- Before a fund release, review this branch's combined unpublished dependencies or isolate the exact diff onto published32484f5; explicit publication approval and relevant checks required. One held caption/walkthrough in RELEASE_REVIEW. Continue fund validation and workflow interviews before implementing the next queued app.

### 18 November 2026 — salary-offer historical scope and narrow-screen layout

- Continued clean local `codex/rafiqy-synthetic-business-demos` at b7f5c34, preserving rental correction1ee1680 and both demos. Local edits only; no deployment hook invoked or branch pushed. Remote main still6c4651ad17b2f63f76d2b4b383373896bd2798d1 (git ls-remote). Existing bilingual deployment dpl_AKEhcGpFGBMazQ289m6biR8T1puN remains READY/production with rafiqy.app aliases; no new release.
- Found salary-offer tool still consumes SLABS_2526 while claiming current salaried tax and refreshed city costs. Replaced its false refresh banner with a prominent TY2026/FY2025–26 historical-income-period disclosure, current-year limitation and link to the main year-specific salary tool. No tax-engine/rate change made. Removed displayed confidence; clarified package value and package-minus-budget include non-cash benefits and one-time relocation, not spendable savings. Replaced rigid320px grid with shrinkable columns and <=900px stacking. Corrected matching SEO/FAQs/registry; changed touched registry accent from purple to cyan.
- Coordinated four direct guides: how-to-evaluate-a-job-offer-in-pakistan, when-a-higher-salary-is-not-a-better-job-offer, should-you-take-a-job-in-another-city-in-pakistan, how-to-negotiate-a-job-offer-in-pakistan. Added historical-period scope and separation of cash/benefits/relocation, updated sitemap dates; generated blog assets rebuilt from markdown.
- Primary-source verification18Nov: https://www.fbr.gov.pk/withholding-tax-rate-card/174298/174301 lists TY2027 current (updated30Jun2026 as per FinanceAct2026) and TY2026 previous. Direct circular PDF and linked TY2027 rate-card PDF both timed out; search also surfaced a Finance Bill, which was NOT used as enacted law. Do not claim refreshed detailed legal verification or completed tax migration. Prior main salary-engine verification remains16Nov. Full offer/slip/optimizer/solar/rates maintenance remains open.
- Checks:55 existing engine/planning tests pass; scoped ESLint, diff check and full buildQA157routes114posts pass. No new tests for the low-impact copy/CSS change. Actual narrow-screen browser verification remains pending; do not reuse prior desktop tests as evidence for this patch. No public preview or browser-policy workaround.
- Supabase policy definitions rechecked: unconditional anon/authenticated policies remain in repository SQL. Live deployment unverified; no metadata connector exposed, customer records accessed or DB changes made. Supported Facebook connection remains unconfirmed; no access/posts/schedules. Lead/email monitoring not configured.
- No new growth product started. Existing demo captions remain held for reviewed, tested release and separate public-post approval. Salary-offer promotion is specifically parked until current-year correctness work is completed. The whole tax cluster is NOT current.

### 17 November 2026 — two synthetic business demos built at Haider's explicit request

- User explicitly requested BOTH demos today; this is a scoped exception to the earlier one-growth-build limit. Created local branch `codex/rafiqy-synthetic-business-demos` from clean `1ee1680`; kept the earlier rental correction intact. No remote push or automatic/public deployment is triggered by local work.
- `/tools/order-review-demo`: editable strict pipe-delimited synthetic purchase-order text, source-line evidence, fixed product catalogue with ambiguous aliases, explicit SKU selection, unit/price/subtotal checks, duplicate reference fixture, meaningful review notes and approval-gated CSV export. Source or decision edits invalidate approval. CSV fields are quoted and spreadsheet formula prefixes neutralized. This is NOT OCR/general text extraction, AI, uploaded-document processing, an ERP connector or authoritative duplicate protection. USD synthetic prices, whole quantities, no freight/tax.
- `/tools/migration-evidence-demo`: two fixed mapping scenarios, editable bounded scalar JSON fixtures, actual browser JavaScript interpreter comparisons, deliberate null-default failure and correction, expected/actual output differences, persistent unsupported operational gaps, downloadable evidence JSON. Illustrative DataWeave/Ballerina snippets are NOT compiled or executed; no real repository conversion or semantic-equivalence claim. Explicit compiler/runtime/model Not run/Not connected states.
- Both have routes/registry, business/developer discovery, SEO/FAQs, strategic prerender, sitemap/llms and paired need-based integration guides. Sources checked in the preceding same-day research: official Ollama structured-output docs, Nanonets PO model docs and WSO2 migration guide. No vendor text/metrics copied or savings/accuracy asserted. Custom private inference, isolated compiler/runtime workers, authorized intake and real connectors remain future scope.
-55 engine/planning tests pass, including13 new synthetic workflow cases. Scoped ESLint passes. Full build/QA157routes114posts passes. Both page components server-render successfully with shared feedback stubbed to avoid requiring live Supabase configuration; this does not verify browser interactions. Browser local preview failed; file-protocol access blocked by browser policy, so no workaround attempted. Actual mobile/desktop screenshots and end-to-end browser/download checks remain pending.
- Portable offline review HTML bundles the same workflow components with simplified navigation, no live site shell/feedback and a CSP blocking network access. Saved as `rafiqy-synthetic-demos.html`, Library identity `libfile_fc76f3a44a1c81918302cbb72b75ad17`. User can download/open locally and switch demos. Not a public preview or deployment; browser behaviour remains user-review pending.
- This branch includes the earlier unapproved rental commit1ee1680 as a dependency. A production release must either review the combined source or prepare an isolated release diff from the published32484f5 first. Do not silently deploy the dependency under approval for demos alone. GitHub writes remain blocked by prior403; remote main stale. No production, Facebook, paid service, DB write, new customer-data access or inference worker. Lead monitoring remains unconfigured.

### 17 November 2026 — Rent vs Buy correctness batch prepared (not published)

- Re-read project instructions and checked a clean local branch at32484f5 before editing. Latest local documentation commit from the previous run was absent in this workspace snapshot; restored the known publication checkpoint without recreating/deploying old sources. Vercel metadata confirms dpl_AKEhcGpFGBMazQ289m6biR8T1puN READY/production with rafiqy.app aliases. Remote main confirmed by git ls-remote as6c4651ad17b2f63f76d2b4b383373896bd2798d1; no fetch/reset/push/deploy.
- Extracted the existing rental engine/presets to src/lib/rentVsBuy.js for meaningful calculation tests. Fixed annual maintenance/holding costs being multiplied by the stay length inside the monthly investment gap. Capped mortgage payment totals at maturity (including shorter-stay sensitivity), and recomputed outstanding balance for lower-markup sensitivity. Both language views use the same result.
- Removed the displayed uncalibrated confidence percentage and unsupported break-even heuristic. Retained heuristic comparison scores as explicitly non-probabilistic. Presets remain examples, not current bank/city/tax rates. Replaced the false refresh/cadence banner; clarified price excludes separately modelled entry costs and shared transaction percentage applies at entry AND exit.
- Updated Urdu limits, the paired markdown guide, SEO/FAQs and sitemap together. Fixed first-year positive contribution remains a model simplification: no evolving investment contribution for rising rent/loan maturity, rent-deficit funding, investment tax/fees or affordability assessment. A full equal-budget cashflow model remains future work; do not advertise complete financial accuracy.
- Sources checked17Nov: Bank Alfalah official hybrid home finance page confirms fixed-then-variable product structure; no numeric current price/rate imported. Old SBP FAQ search result was found but opening its legacy URL returned site navigation, so the batch links the directly verified lender page instead. FBR ordinance collection is a reference pointer only, not a new property-tax implementation. No statutory effective date is asserted;17Nov is the methodology review date.
- Checks:42 planning tests pass (four new rental regression cases), scoped ESLint passes, production build/QA153routes112posts passes, diff check passes. New batch browser/phone visual checks remain pending. No public preview, production deployment or remote branch push. Review docs/RELEASE_REVIEW.md and the local diff/commit before any release.
- Security re-review: cloud_sync_tools.sql and measurements.sql still contain unconditional anon/authenticated policies. This is a repository finding only, not proof of deployed policy or exposure. No Supabase metadata connector is available; no customer rows queried, policies changed or DB writes. Lead/email monitoring remains unconfigured. No supported Facebook connection is confirmed; no page access/posting/scheduling.
- Product radar: no separate new product started. Keep the active stock demo and existing integration/automation queue; prioritize correctness before promotion. Existing local/global stock and exception-use cases remain hypotheses until buyer interviews/sample validation.

### English/Urdu core views and AI-era freelancing guide — prepared 16 November 2026

- The local checkout survived workspace maintenance; no recovery from stale GitHub main was needed. Source matches the released app plus local documentation. Do not overwrite it with the older remote main.
- Added a separate `toolLanguage` preference and English/اردو switch for Rent vs Buy, Stock Planner, Salary Tax and Freelance Reserves. Kept existing card-label `urduLabels` preference independent. Urdu core views have `lang=ur`, RTL layout, explicit labels/errors/cautions and LTR-isolated numeric/currency output. No external translation API or customer-data upload.
- Core Urdu workflows reuse the same parent state and calculation engines. Lifted forecast history, selected item and applied state to the stock page so switching language does not intentionally reset them. Urdu stock and rental text exports are localized. Rendered control/state persistence still needs browser checks.
- Coverage is intentionally described as CORE views, not complete site translation: global navigation, SEO/footer/help and linked blog guides remain English. Advanced Rent vs Buy sensitivity narratives remain in English; the Urdu view explicitly points users to the English switch for that detail. Do not claim full language parity or that the whole site is translated. Solar and remaining important tools are next localization candidates after accuracy work.
- Added `content/blog/decision-support/freelancing-in-the-ai-era.md`: sourced practical guide to business-outcome positioning, coding/agent delivery, beginner versus experienced paths, bounded pilot packaging, pricing cost drivers, portfolio proof, local/international customer discovery, privacy, source synchronization, a 30-day plan and a short Urdu summary. Uses dated Upwork/Anthropic observations and METR's 2025 study AND its February2026 qualification; no universal productivity/earnings promises or confidential client cases. Category discovery/sitemap and generated blog assets are updated.
- Checks: existing 38 calculation tests pass; scoped lint passed; server-render checks passed for Urdu salary, reserve result, required-budget state, stock/forecast and rental outputs, including RTL/lang and no undefined/NaN. Build/QA passed with153 routes112posts. Rental sliders retain the English view’s bounds/steps; final scoped lint, build/QA and diff checks pass. Browser/mobile checks remain pending for this NEW batch; do not reuse the earlier English live-smoke result as translation evidence.
- This batch is local/unpublished and needs approval of its exact reviewed version before deployment. Prior live approval applied to7590cbe, not a blanket future release or Facebook posting authorization. GitHub write403/source-sync blocker persists.

### Production release completed — 16 November 2026

- User explicitly approved publishing the reviewed batch live. Deployed the application content of local commit `7590cbec060877628817013b1cec6a6bae009ac2` directly to the existing Vercel project/team. Deployment `dpl_D5sK26xUHamJo2HMWDCgZRFdTaqH` is READY, target production, with aliases `rafiqy.app` and `www.rafiqy.app`. No Facebook post or live database write was authorized/performed.
- IMPORTANT SOURCE SYNC BLOCKER: GitHub `create_tree` returned 403 Resource not accessible by integration. The remote `main` therefore remains `6c4651a`; do not assume the live site matches GitHub. Direct Vercel source deployment succeeded using the reviewed application sources, existing production environment variables and `npm ci` / `npm run build`. Generated blog modules were regenerated during the build. Do not deploy remote main over this version until write access is repaired and the reviewed source is synchronized. Never expose or request tokens in chat.
- Pre-release checks rerun successfully: all 38 planning tests, scoped lint and production build/QA (152 routes / 111 posts). Post-release live browser checks: all four tool pages render; forecast-copy changes the selected stock input; synthetic salary 250000/month displays annual tax 276000; freelance synthetic tax budget120000 displays withdrawal capacity250000; Rent vs Buy preset works and desktop has no horizontal overflow. All six changed blog headings render live. Actual phone viewport testing still remains with the user/next supported browser environment; do not call it visually verified on mobile.
- Published page scope: Rent vs Buy mobile patch; new stock planner/forecast lab and stock guide; main salary tool/guide; corrected freelance reserve tool and its four guides; business category/discovery and shared layout/SEO assets. Solar, salary slip/offer, optimizer eligibility and other changing-rate updates remain unfinished.
- User also suggested Vercel Python and more interesting demos. Official Python runtime docs checked 16 November2026: https://vercel.com/docs/functions/runtimes/python . Treat Python as a candidate execution option for a scoped forecast/CSV reconciliation/document-processing backend. Preserve one active product at a time, validate runtime/dependency/cost limits, request review before new production endpoints, and keep private model workers/data handling separate where needed. No Python feature was added in this release.

### Customer feedback and local competitor benchmark — queued 16 November 2026

User idea: help a business understand social-media feedback and compare with relevant nearby/city competitors. Keep this queued behind the active stock pilot and maintenance; no separate app started.

- Candidate scope: an evidence-linked reputation brief showing praise/complaint themes, feedback needing attention, response workflow and a clearly scoped comparison of similar businesses within a chosen area/radius. Display source, date window, sample size, missing platforms and coverage; do not infer sales, market share or service quality solely from engagement.
- Begin with synthetic examples and business-authorized exports. Live connectors, paid APIs and third-party processing require reviewed authorization. Keep private inbox/customer content isolated; do not profile reviewers or publish identifiable complaints, private messages or accusations.
- Platform access is a feasibility gate, not assumed: Google Places can provide aggregate rating/review count but returns at most five review objects in a Place response, so that sample is not a complete sentiment history. Meta competitor-page access depends on appropriate permissions/features; an open Facebook tab does not grant API access. Verify current provider terms, attribution, retention, display and costs before implementation. Sources checked 16 November 2026: https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places and https://developers.facebook.com/docs/graph-api/reference/page/ .
- Compare like business categories and branches; let the owner confirm the competitor set, area and dates. Separate ratings, review volume and observed themes rather than making a fake city-wide rank or averaging incompatible platform scores.
- LLM option: multilingual theme clustering and grounded summaries with evidence links, uncertainty and owner-reviewed response drafts. Deterministic metrics handle counts/rates; no autonomous public replies or invented evidence.
- Buyer/payment hypothesis: local service operators, restaurant/retail groups and agencies may value a recurring actionable report plus escalation/CRM integration. Existing alternatives include native platform insights and social-listening/reputation products; validate an unmet workflow before building. Main cost drivers are data access/licensing, inference, refresh/storage and human review. This is not yet a proven paying opportunity or live monitoring service.

### Maintenance follow-up — 16 November 2026

- Continued the existing local branch after checking a clean working tree and commits through `4d6d4a4`. Direct GitHub branch lookup confirms remote `main` remains `6c4651ad17b2f63f76d2b4b383373896bd2798d1`; local work has not been pushed and no remote edits were overwritten.
- Corrected the freelance planner: removed `calcFullTax`/salary-slab inference from freelance revenue. It now requires an explicitly entered annual tax cash-funding budget before showing results, allocates that budget over 12 months, exposes allocation shortfalls and household gaps, and labels the fixed-allocation 20% receipts stress case. Removed pseudo-confidence and the misleading health score. Actual freelancer tax treatment remains a separate assessment; no statutory freelancer rate has been implemented.
- Replaced its rigid two-column grid with a <=900px single-column layout; shared ToolLayout related-guide grid can now shrink below 260px. These are source-level repairs; no browser/mobile visual verification is claimed.
- Updated four direct freelance guides, main SEO/FAQs/registry and sitemap dates. FBR ordinance index verified 16 November 2026 (consolidation listed through 30 June 2026); no new current-rate assertions. Primary reference: https://fbr.gov.pk/Categ/Income-Tax-Ordinance/326 .
- Added six meaningful freelance cash-allocation tests. Combined planning suite passes 38 tests; scoped ESLint and diff checks pass. Final build result is recorded in `docs/RELEASE_REVIEW.md` after completion.
- Remaining correctness blockers: salary offer/slip still use FY 2025–26; tax optimizer/shared legacy credits need verification; solar/rate clusters remain pending. Do not call the full tax or finance cluster current.
- Browser remains unable to reach the local test server in this environment; a protected reachable test surface or local-PC test execution is needed. Public previews and production remain unapproved. Supabase metadata access and private enquiry/email monitoring are not configured; do not infer no enquiries. No Facebook connection is available/used.
- Review checklist and exact hold-for-release captions: `docs/RELEASE_REVIEW.md`. No production approval is being assumed or requested before required verification completes.

### National and international growth — 16 November 2026

User clarification: target Pakistan AND international audiences; integration/automation/AI growth must not be limited by the local calculator audience. Prioritize where customers have visible pain, a practical adoption path and willingness to pay, rather than assuming one country is easiest.

- Preserve the active stock-planning pilot and correctness/security work. Expand its reusable business positioning and later acquisition experiments without starting separate apps for every geography.
- For each candidate record: buyer and decision-maker; repeated problem; existing workaround and alternatives; evidence of willingness to change/pay; accessible systems/data; smallest useful pilot; baseline and success measure; estimated delivery/operating cost; local versus international applicability; acquisition channel; and the uncertainty to resolve next. Park candidates without a clear pain or feasible buyer path.
- Candidate buyer groups already in scope: retail/food/distribution operators (stock and order exceptions); agencies/SaaS/operations teams (failed workflows and monitoring); integration teams and consultancies (migration readiness and contract/mapping drift); professional practices (admin follow-up). These are hypotheses to validate, not proven paying markets.
- Prefer a focused pilot around current POS/accounting/CRM/API workflows using synthetic demos, authorized exports or one verified connector. Avoid requiring a full platform switch before showing value.
- Reusable solution/blog content should lead with the problem in plain English. Add accurate local variants where needed; keep Pakistan tax/solar rules explicitly scoped. Do not imply that changing a currency label localizes tax, regulation, dates or integrations.
- Prepare distinct campaign angles for each selected buyer/problem, with a working demo, measurable outcome to test and optional implementation enquiry. Evaluate relevant channels beyond Facebook during discovery; do not post, contact prospects or spend without the appropriate authorization.
- Track qualified enquiries, discovery conversations and pilot conversion by problem/market when secure capture and consent-appropriate aggregate analytics exist. Traffic alone is not proof of consulting demand; do not imply tracking is already implemented.

### Stock forecasting extension — 16 November 2026

User requested detailed AI forecasting features plus visibility of custom integration options and the roles of traditional/statistical ML versus LLMs.

- Added a working browser-local forecast lab to the existing stock demo (not a separate app). It accepts 42–366 consecutive daily quantities for one item/location, rejects missing/invalid entries, compares a repeated weekly pattern, recent 14-day mean and fixed-alpha simple exponential smoothing, and selects by mean absolute error on eight rolling seven-day test windows. Displays signed bias and seven daily predictions; user can explicitly copy the seven-day average to a chosen item's steady usage input.
- Clearly label this as statistical baselines, not an LLM service. Synthetic weekly sample, short overlapping backtests and the minimum history do not prove real-world accuracy. No calibrated probability interval, promotion adjustment, censored-demand repair or day-by-day reorder optimization is implemented.
- Added custom-capability cards and expanded the source markdown guide/SEO/FAQ/registry/download brief: ETS/SARIMA, Croston-SBA/TSB for intermittent demand, feature-based LightGBM/XGBoost, validated uncertainty, budget/expiry/pack-constrained planning, recipe-to-ingredient conversion, branch transfers, and advanced neural/time-series foundation models only when benchmarked. An LLM explains tool evidence, retrieves permitted records and prepares drafts; it does not authoritatively invent quantities or execute purchasing. Ollama is a potential private-worker deployment with compute/support/security costs, not a live connection or guaranteed free/accurate forecast.
- Sources checked: Forecasting: Principles and Practice (benchmark/evaluation, ETS, ARIMA chapters); StatsForecast and MLForecast official docs/repos; Amazon Chronos official repository/paper; Ollama official tool-calling docs.
- Eight new forecasting tests pass, including independently known chronological errors, seasonal alignment, zero/constant demand, fixed-alpha smoothing and invalid/missing input handling. Combined planning suite now passes 32 tests. Scoped lint, diff check and the final production build/QA passed (152 prerendered routes / 111 blog posts). Browser/mobile interaction validation remains pending; no public release or DB writes.
- Next pilot work remains verification and secure integration/enquiry foundations; select advanced models from real permitted historical evidence, not technology novelty. User approval still required for publication and external actions.

### Execution checkpoint — 16 November 2026

- Local branch: `codex/rafiqy-mobile-review`. No remote push, preview, production deployment, Facebook post or live database write has occurred.
- Built a working Stock & Replenishment Planner at `/tools/stock-planner` with editable synthetic pizza/bakery/retail examples, committed/incoming-stock reconciliation, timing-gap warnings, supplier-pack/MOQ rounding, shelf-life warnings, currency labels and a downloadable planning/integration brief. No uploads, storage, connectors or enquiry capture. Steady usage is an input, not a learned forecast.
- Added its markdown guide, registry/route/SEO/FAQs, business discovery placement, sitemap and prerender entries. Production build passed with 152 routes / 111 blog posts. Ten meaningful calculation tests, scoped ESLint and diff checks passed. Browser/mobile visual and interaction verification remains pending; this is an unpublished prototype, not launch-ready.
- Continue the mobile repair and this one selected growth demo rather than starting additional apps. Keep wider migration/monitoring/vertical ideas queued. Current enqueue criteria: clear pain, useful working result, distinctive workflow, measurable pilot outcome and viable integration enquiry path; park ideas that fail those checks.
- Tax audit found FY 2025–26 still presented as current and an unavailable teacher credit applied on request. Primary-source verification for TY 2027 is underway using FBR Circular 02 of 2026–27 (8 September 2026), page 4, items 7–8. Downloaded and visually inspected the official circular; do not substitute Finance Bill proposals for enacted rates.
- Prepared a replacement salary-only calculator with TY 2027/FY 2026–27 as default and historical TY 2026 selection. The updated engine models the published eight slabs, no TY 2027 salary surcharge, historical TY 2026 9% surcharge above PKR 10M, fractional-rupee boundary handling and a PKR 100M scope cap. It reports before personal credits/rebates; it no longer applies an unavailable teacher credit or asserts unverified concessions. The main tax guide, SEO/FAQs and registry now describe the actual scope and link primary sources. Deliberate scope change: the old personal-credit controls and petrol-price analogy are removed from this calculator pending a separately verified eligibility flow.
- Verification after the salary update: `npm run test:planning` passes all 24 calculation tests (14 salary + 10 stock); scoped ESLint and `git diff --check` pass; `npm run build` passes 152 prerendered routes / 111 posts. Mobile/browser interaction checks remain pending.
- Tax-cluster RELEASE BLOCKERS: `FreelanceTaxPlanner.jsx` incorrectly uses salaried slabs for freelance revenue; `SalaryOfferEvaluator.jsx` and `SalarySlip.jsx` still use FY 2025–26 logic; `TaxOptimizer.jsx` and shared `taxData.js` retain unverified credit/insurance eligibility assumptions. Audit their executable logic and related markdown/SEO/FAQs as one follow-up batch. Do not advertise the whole tax cluster as updated or ship this as a complete cluster update. Keep source-specific effective dates distinct from verification dates; do not just replace year labels.
- Solar audit found unsupported current-market claims and a December 2025 net-billing effective-date claim. NEPRA legal index lists the 9 February 2026 regulations plus April/August amendments; review these together before changing rules, export values or connection fees. Keep tool/blog/SEO changes in one reviewed cluster.

### Approved work order — 15 November 2026

This order takes precedence over the older priority numbering below. Preserve the existing roadmap rather than treating earlier ideas as new discoveries.

Confirmed previous Windows checkout:
- `D:\Haider\Rabi zidni ilma\githubCopilotCli\typing-tutor`
- The user says earlier Codex history, memory and unpublished tool ideas may be in this folder.
- The cloud checkout cannot directly inspect that Windows path or a separate local Codex session. Review any available local-only changes and notes before a production release; do not claim that this reconciliation has happened.
- Repository memory reviewed: `docs/CODEX_CONTEXT.md`, this file, `docs/BLOG_PUBLISHING_PLAYBOOK.md`, and recent Git history. Keep `docs/new/` excluded unless explicitly requested.

| Priority | Work | Current status / next step |
| --- | --- | --- |
| P0 | Supabase access-control review | Verify deployed policies and grants using authorized metadata access. Some repository SQL policies are permissive; live configuration is unverified. Prepare reviewed fixes without reading customer records to demonstrate exposure. |
| P0 | Rent vs Buy mobile layout | Local branch `codex/rafiqy-mobile-review` contains a responsive layout patch. Production build, scoped lint and diff checks passed; actual mobile visual/interaction verification is pending. Nothing has been pushed or deployed. |
| P1 | Solar, tax and changing-rate accuracy | Main salary tool/guide update prepared locally; dependent tax tools and solar cluster still need correction (see checkpoint). Update executable tools, presets, SEO/FAQ text and their markdown blog clusters together. Check current official sources, distinguish effective dates from last verification, and preserve historical-year calculations where useful. Include dependent salary, freelance, investing, gold/currency and EV/fuel assumptions. |
| P1 | Consulting enquiry foundation | Define a useful result without an email gate, optional enquiry intake, private staff-only inbox, and notification delivery with retries. Customer details must not appear in public reports, analytics or social content. Recipient email is still to be chosen by the user. |
| P2 | Automation Opportunity Finder | Approved direction: help common users, SMEs and enterprises identify repetitive work and suitable automation/integration/AI options; explain assumptions and provide an optional implementation enquiry. |
| P2 | Integration Project Planner | Approved direction: collect system names and process needs without credentials/customer payloads, then produce an initial integration outline, open questions and a route to request Haider's help. |
| P2 | Focused AI demonstrations | Scope one useful synthetic-data demo at a time, such as document extraction, enquiry assistance or order-exception support. Separate deterministic processing from AI assistance; present genuine behavior rather than unbuilt capabilities. |
| P2 | Approval-based Facebook promotion | Draft problem-focused posts and demos linked to verified tools and service pages. Use the actual publishing connection when authorized; an open local Facebook tab is not persistent automation access. |
| P3 | Earlier flow and decision-system concepts | Keep the recovered roadmap below. Validate existing coverage before building; a recorded idea is not evidence of implementation or launch approval. |

Daily operation:
- A daily preparation/review workflow is scheduled around 08:00 Asia/Karachi from 16 November 2026.
- It should continue this queue, avoid duplicate drafts, check sources, and report completed preparation, validation, blockers and the exact batch awaiting approval.
- Website production releases, public previews, Facebook publication/scheduling, live database changes and paid actions require the user's explicit approval of the reviewable batch.
- Keep existing production behavior intact while preparing changes. The confirmed Vercel project is `typing-tutor`, linked to `hghub/typing-tutor`.

Recovered idea status:

| Idea / group | Provenance | Queue treatment |
| --- | --- | --- |
| Solar quote comparison; tax filing preparation | Existing automation-flow roadmap in this file | Candidate extensions after accuracy fixes; no evidence of implementation in the current tool registry/routes. |
| Investment setup; loan decision; freelancer money | Existing automation-flow roadmap in this file | Extend existing clusters where useful; validate how much current tools already cover before adding routes. |
| Document safety; kameti management flows | Existing automation-flow roadmap in this file | Reuse relevant tools; resolve access-control requirements before introducing saved private data. |
| Marriage readiness / match; study & career direction | Existing project-memory concepts | Retain as concept backlog with explanation-first, non-authoritative outputs and appropriate review before launch. |
| Trauma recovery / support | Existing project-memory concept | Keep at concept stage; require qualified domain review and careful support boundaries before implementation/public launch. |
| Youth self-employment / start-your-own-work | Existing project-memory concept | Candidate public-facing flow that can connect practical business needs to implementation assistance; scope separately. |
| Local blog-to-social workflow using n8n/Ollama/Publer | Earlier conversation proposal | Alternative integration approach, not proof of an existing working workflow. Check the confirmed Windows folder for any unpublished implementation before rebuilding it. |
| AI essay/IELTS or resume feedback; food/ration calculator; GPA and phone validation; deeper Urdu typing/job-readiness features | Earlier assistant suggestions, not confirmed user commitments | Discovery-only candidates. Many foundational typing/PDF/finance utilities already exist; deduplicate and validate demand before promotion into active development. |

Earlier generic SEO/About/FAQ/schema ideas are already substantially implemented. Do not requeue them as new products; audit specific gaps instead. The two Integration/MuleSoft posts listed below are already published and must not be treated as unpublished ideas.

### Integration / AI opportunity pipeline — 15 November 2026

The user requested daily observations and ideas for both Pakistan/local and international audiences, followed by incremental development, solution/blog pages and promotion. They proposed a monitor/diagnose/fix/message product spanning integrations, websites and mobile, and a lower-cost Ollama-assisted migration workbench. Preserve the existing approval requirement for each public release/post; this request does not remove that review step.

| Candidate | First useful scope | Buyer / region | Commercial path |
| --- | --- | --- | --- |
| Business journey monitor (user idea, scoped) | Trace one synthetic website/mobile-API-to-integration journey, detect broken steps, group incidents and prepare an evidence-backed explanation and staff alert. Start read-only; offer reviewed runbooks before narrowly authorized remediation. | SMEs, agencies and enterprise integration teams; Pakistan and international | Setup plus supported monitoring/incident-review service |
| Local migration workbench (user idea, scoped) | Start Mule 4 to WSO2/Ballerina: inventory a sample project, classify supported/unsupported patterns, convert one supported pattern and validate outputs with compile/tests and regression fixtures. | Migration teams, consultancies and platform owners; primarily international plus local enterprises | Paid readiness assessment and migration pilot, then customer-hosted tooling/support |
| Business exception inbox | Identify a business item that succeeded in one system but failed in another; show evidence, owner and next action. Demo a paid order missing an invoice using synthetic events. | Online sellers, distributors, travel/service businesses; local and international | Workflow implementation plus operations support |
| Payment / settlement reconciliation | Match two CSV exports by stable references and amounts; flag missing/duplicate/partial settlements and fees. Do not move funds. Add APIs only after validating provider access. | Merchants, service firms and finance operations; local and international | Reconciliation setup/customization plus recurring support |
| API contract and mapping drift checker | Compare OpenAPI/schema/payload versions, flag breaking changes and affected mappings; reuse the existing mapper where practical. | Product teams, SaaS vendors and integration consultancies; international and local enterprises | Free sample assessment plus paid CI/integration implementation |
| Private document-to-workflow assistant | Extract invoice/PO/email fields from synthetic documents, validate against a schema and prepare an approval task. No autonomous accounting writes. | SMEs, finance/admin teams, accountants and distributors; local and international | Narrow process pilot and customer-hosted/private deployment |
| Offline branch sync and conflict simulator | Demonstrate queued records, reconnect, deduplication and conflict resolution with synthetic data. | Retail branches, field teams and intermittently connected sites; local and international | Assessment and offline integration implementation |
| AI task-cost workbench | Replay a small fixed task set using rules, local-model and optionally separately approved paid-model paths; compare quality, latency, manual repair and cost per accepted result. | Teams spending heavily on repeated AI processing; international and local enterprises | Benchmark/service engagement and cost-optimization implementation |

Daily opportunity discipline:
- Inspect available authoritative sources, permitted aggregate analytics, existing tool gaps and recurring public/business problems; do not use confidential client records as a research feed.
- Prepare up to two distinct, evidence-backed ideas per run. State the observation, intended buyer, local/global applicability, existing alternatives, smallest demonstrable scope, likely operating costs, what requires validation, and why it could lead to a paid engagement.
- Deduplicate against current tools and this backlog. Clearly distinguish user ideas, prior concepts and newly proposed candidates.
- Continue one selected small build/improvement at a time. A daily idea is not a promise of a new production-ready app every day. Bring an exact reviewable batch and post draft for approval.
- Next growth delivery remains the Automation Opportunity Finder / Integration Project Planner and a useful solution/demo page. Evaluate business exception inbox as the first paid-pilot proposition; evaluate migration workbench as the deeper technical differentiator.

Local-model feasibility:
- Begin with parsing, deterministic rules/templates, small retrieved examples and validation. Adding prompts/examples is not model training; consider fine-tuning only if measured failure cases and suitable data justify it.
- Design migration adapters around an explicit intermediate representation, source/target version support and unsupported-pattern reports. Do not advertise universal conversion or unmeasured accuracy/cost reductions.
- Compare total cost per accepted result: hardware/rental, energy, maintenance, failures/retries and expert review, not only API tokens.
- Keep customer source code/documents in an authorized private worker/customer-hosted installation. Ollama inference requires actual compute separate from the static website; do not assume Vercel can access a user's localhost or expose an unauthenticated Ollama server publicly.

Solution-page pattern inspired by the reviewed Kognitos solutions page (https://www.kognitos.com/solutions/):
- Start with a specific business failure and intended user, then show inputs/systems, a genuine synthetic-data example, workflow/approval boundaries, supported scope, and an optional private implementation enquiry.
- Separate working demos, prototypes and consulting offerings. Do not borrow vendor success percentages or claims of zero hallucinations.
- Pair each chosen solution with a need-based markdown guide and a Facebook demonstration draft. Publish only after the user's approval and appropriate verification.

### Inventory planning and business/professional verticals — 15 November 2026

User additions: agentic inventory/warehouse/supply-chain planning (when to order, what is critical), pizza shops, bakeries, chemists/pharmacies, retail stores, doctors, dentists, lawyers and media professionals. These are candidate verticals for discovery and demos; they do not authorize live purchasing, clinical decisions, legal actions or external messages.

Shared Inventory & Replenishment Copilot:
- Start with synthetic/sample sales, current available stock, confirmed incoming stock, committed demand, supplier lead times, purchasing/pack constraints and batch/expiry information where relevant. Accept CSV/Excel exports before committing to a specific POS/ERP connector.
- Show projected stockout dates, critical items, reorder timing, suggested quantities with visible assumptions, excess/slow-moving stock, expiring batches and purchasing cash requirements.
- Inventory and procurement calculations belong in validated planning/rule code, with forecast uncertainty and missing/stale-data indicators. The agent retrieves permitted data, explains exceptions, prepares tasks/PO drafts, asks for missing information and follows approved workflows. LLM output alone must not determine stock counts, prices or purchase quantities.
- Take account of existing purchase orders/reservations to avoid duplicate ordering. Perishable stock needs shelf-life-aware planning; a slow-selling item is not automatically expendable if it is essential. Approval is required before placing orders, changing prices or messaging suppliers/customers.
- First demonstration can be a small bakery/pizza inventory dataset: translate menu sales into ingredient consumption, explain which ingredient limits service, recommend an expiry-aware prep/replenishment plan and show manager approval. All savings/stockout-reduction claims need real pilot measurement.

| Vertical | Concrete use cases to validate | Small first offering | Outcome to measure |
| --- | --- | --- | --- |
| Pizza / takeaway | Ingredient consumption from recipes; rush-hour shortage alerts; order-channel exceptions; preparation backlog; supplier delay visibility | Ingredient shortage and prep planner using sales/recipe/stock exports | Stockout incidents, waste, delayed orders, staff planning time |
| Bakery | Next-day batch planning; perishability/expiry; cake-order tracking and deposits; branch transfers; raw-material reorder | Daily production and waste planner with editable demand assumptions | Unsold/wasted quantities, unavailable items, planning time |
| Chemist / pharmacy | Batch/expiry tracking; inventory alerts; supplier comparison; reorder drafts; stock transfers | Batch-expiry and replenishment dashboard for pharmacist review | Expiry write-offs, stock availability, ordering effort |
| Retail store / distributor | Stockout and dead-stock alerts; branch imbalance; supplier order drafts; returns/settlement mismatches | Reorder list and slow-stock report from POS/CSV exports | Stockouts, inventory tied up, reconciliation exceptions |
| Doctor / clinic | Appointment confirmations and waiting list; missing intake paperwork; staff-configured follow-up reminders; daily operations summary | Appointment and admin follow-up assistant integrated with current scheduling | Missed appointments, response time, admin effort |
| Dentist / dental clinic | Appointment reminders; cancellation-slot filling; clinician-set recall schedule; approved treatment-plan quotation follow-up; consumables | No-show/cancellation recovery and recall work queue | Attendance, filled cancellations, reception time |
| Lawyer / small firm | Enquiry intake and required-document checklist; source-linked file chronology; verified-date reminders; billing/time-entry drafts | Client intake and document-chasing assistant | Intake turnaround, missing documents, staff time |
| Media / creator / agency | Interview transcript search with source timestamps; brief-to-task planning; approval/version tracking; reusable content drafts; rights/consent checklist | Transcript-to-source-linked content draft and approval workflow | Editing time, revision cycles, source-traceability checks |

Vertical boundaries:
- Clinical diagnosis, medication selection/substitution, prescribing and autonomous clinical follow-up intervals are outside the first healthcare/pharmacy versions. Use existing professional-approved instructions; minimize private patient data.
- Legal outputs remain drafts for a qualified professional; reminders use verified dates, not invented statutory deadlines or unsourced legal claims.
- Preserve speaker attribution/source references for media work; require review of factual claims, quotes, rights and consent before publication.
- Integrate with an existing POS/practice/accounting system where practical. Validate actual API/export access and vendor terms before promising connectors.
- Initial commercial validation hypothesis: bakery/pizza stock-and-waste planning is an accessible first SME pilot; dental admin/no-show workflow is a candidate second vertical. Validate through discovery and sample data, without claiming proven demand or guaranteed savings.
- Represent vertical solutions as presets/templates over reusable intake, validation, forecasting/rules, approvals, notifications, audit and connector components. Do not begin eight separate all-in-one management systems.
- Use at most one selected pilot/build at a time, publish a genuinely working synthetic-data demo and need-based blog only after approval, and retain wider platform migration/integration products in the queue.

### 0. Implement the prerender rollout plan

Next major technical priority:
- implement `docs/PRERENDER_ROLLOUT_PLAN.md`

This is now the main architecture task because:
- crawl tools still miss route-level HTML on important pages
- route identity and content visibility must stop depending on client rendering alone
- decision systems need hybrid prerender + hydration

First execution order:
1. prerender infrastructure for selected routes
   - done
2. expand prerender coverage to homepage / tools / blog / category pages
   - done
3. all decision-system pages
   - done for the current strategic set
   - solar SEO improvements preserved through the new prerender layer
4. other key Pakistan-first tools
   - current selected-route prerender now covers:
     - core static pages
     - all category pages
     - all blog section pages
     - all current blog posts
     - strategic tool and decision-system routes

Current rollout status:
- build now prerenders 150 routes
- build QA verifies the full selected route set, not only the original pilot
- route HTML is generated from shared data sources via `scripts/prerender-content.mjs`

Next prerender-related work:
- improve the quality/depth of static prerender bodies for the most important hybrid tool pages where helpful
- decide whether any additional strategic tools should join the selected prerender set as they become stronger clusters

### 1. Query-driven SEO tuning

Next best work should be driven by:
- Google Search Console impressions
- CTR gaps
- rising pages with weak titles/descriptions
- GA4 landing-page behavior

Focus especially on:
- tax
- solar
- investing
- rent vs buy
- EV / hybrid / petrol
- Urdu typing / typing

What to do:
- inspect which generic queries are surfacing
- tune titles/H1s/intro/FAQ where intent mismatch appears
- improve internal anchors between guide pages and tools

### 2. Keep the generic-first / Pakistan-depth pattern consistent

The sitewide pattern is in place, but older and lower-priority pages may still need occasional cleanup.

When touching any existing page, check:
- is the user query generic-first?
- is Pakistan context layered in naturally?
- is the wording too narrow for how users actually search?
- were blog tags / topic chips / category surfacing also kept aligned?
- does the page follow the full strategic-tool landing pattern:
  - route-specific metadata
  - one canonical
  - H1 + value statement
  - trust/methodology block where relevant
  - support-cluster links
- is the tool still easy to start using near the top, without forcing too much reading first?

### 3. Deepen strongest decision-system clusters based on evidence

Do not add random new decision systems until current winners justify it.

Best current clusters to deepen further if data supports them:
1. Solar
2. Rent vs Buy
3. EV / Hybrid / Petrol
4. Investment Allocation
5. Tax / Salary / Freelance

Possible future improvements inside top clusters:
- stronger scenario presets
- richer exports/reports
- more comparison history
- better checklists
- more support guides around actual user queries

### 4. Add MuleSoft technical blog publishing workflow

MuleSoft needs a dedicated technical blog track.

Current status:
- category support added as `mulesoft`
- blog topic chip added
- technical code/table/blockquote styling added to blog posts
- two production-quality Integration posts are now available:
  - `mulesoft-client-id-secret-401-nginx-ingress`
  - `circuit-breaker-vs-retry-vs-timeout`
- publishing rules documented in `docs/BLOG_PUBLISHING_PLAYBOOK.md`
- markdown-per-post authoring is now implemented under `content/blog/`
- build QA now checks blog metadata and MuleSoft code-block formatting
- runtime now uses a generated metadata index plus per-post content modules instead of shipping one giant blog payload
- blog URL taxonomy is now sectioned and single-pattern only:
  - `/blog/integration/<slug>`
  - `/blog/decision-support/<slug>`
  - `/blog/utilities/<slug>`
- do not reintroduce flat `/blog/<slug>` posts or redirect fallbacks
- sitemap, canonical tags, share URLs, internal links, and docs must all use the sectioned URL helper

Next when new content is available:
- publish MuleSoft posts from user-provided content or DOCX source
- add it under `content/blog/integration/`
- add strong title, description, tags, and internal links
- add it to prerender once blog route expansion starts

### 5. Maintain one useful blog per tool minimum

This baseline has been largely achieved.

Ongoing rule:
- if a tool is important and its blog feels weak, outdated, or too generic, improve it
- if a tool gains a new feature or use case, consider whether the related blog should also be updated

### 5a. Keep blog architecture scalable

Current stable architecture:
- source of truth: one markdown file per post under `content/blog/`
- generated runtime metadata: `src/data/blogIndex.js`
- generated runtime article modules: `src/data/blogContent/`
- generated build-only article dataset: `scripts/generated/blogPrerenderData.mjs`

Rules:
- use one shared route helper for links, canonical URLs, sitemap URLs, and share URLs
- do not reintroduce flat `/blog/<slug>` URLs
- do not hand-edit generated files
- keep prerender and QA wired to the same canonical content source

### 6. Continue Pakistan-friendly accessibility where it adds value

For important Pakistan-first tools:
- keep plain-language guidance current
- keep Roman Urdu bridging natural
- avoid forced keyword stuffing

Use:
- full guide only where needed
- light guide for mostly obvious tools
- no guide for self-explanatory utilities

### 7. Watch for feature-gap opportunities

When reviewing tools, always notice:
- `content gap`
- `feature gap`
- `new-tool opportunity`

Current recurring feature-gap themes:
- exports / summaries
- better presets
- better compare modes
- reminder/support workflows
- templates for repeated use

## Medium-Term Product Directions

### A. Automation flows

Promising future flow layer:
- solar quote comparison flow
- tax filing prep flow
- investment setup flow
- loan decision flow
- freelancer money flow
- document safety flow
- kameti management flow

No real external integrations in V1.
Premium can come from:
- saved scenarios
- exports
- comparison reports
- advanced workflows

### B. Sensitive future decision systems

These need careful design and should not be rushed:
- marriage readiness / match guide
- study & career direction guide
- trauma recovery / support guide
- youth self-employment / start-your-own-work guide

When resumed:
- treat them as high-trust systems
- do not let them become simplistic score widgets
- require careful wording and strong boundaries

## Maintenance Tasks

### Whenever a new tool is added

Do all of this automatically:
- page
- registry
- route
- tool SEO
- at least one useful related blog
- discovery placement
- blog tags / topic chips / category guide priority if the cluster affects discovery
- sitemap update if needed
- `llms.txt` update if the strategic surface changed
- build validation
- update `CODEX_CONTEXT.md` or `TASKS.md` if a new stable rule or new priority emerged

### Whenever a strong existing tool is upgraded

Also check:
- related blog freshness
- related guide priority
- category discoverability
- homepage/tools/blog surfacing
- whether `TASKS.md` needs to reflect a new cluster priority

## Documentation Tasks

### Keep
- `docs/CODEX_CONTEXT.md`
- `docs/TASKS.md`
- `docs/PRERENDER_ROLLOUT_PLAN.md`
- `docs/BLOG_PUBLISHING_PLAYBOOK.md`

### Going forward
- add durable rules to `CODEX_CONTEXT.md`
- add rolling next steps to `TASKS.md`
- avoid recreating a large docs sprawl unless there is a very specific need
- at the end of a meaningful batch, check whether these two files need a short refresh
