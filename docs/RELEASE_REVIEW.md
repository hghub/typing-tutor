# Rafiqy review batches — updated 21 November 2026

## Homepage navigation — new direct request

See [HOMEPAGE_REVIEW.md](HOMEPAGE_REVIEW.md) for the focused diff since8d1f9e4, exact browser/test evidence, remaining phone QA, release dependencies and final held caption. Current local branch is codex/rafiqy-homepage-navigation; no publication approval inferred.


## Salary-slip draft correction — 21 November 2026 (local only)

Focused diff since04d2cdc on codex/rafiqy-community-workflows. SalarySlip and new salarySlipTotals validate entered earnings and payroll-confirmed tax/employee EOBI, replacing legacy automatic tax and fixed EOBI cap. Both deduction inputs start blank: explicit zero required if appropriate. Invalid amounts/month and deductions above gross block preview and print. This is an intentional scope change to payroll-record drafting; it does not update statutory tax/EOBI calculations or the whole tax cluster. Employer costs are not automatically charged to employees. Separate salary tax calculator remains a base-estimate reference.

Print output says draft, no proof of employment/payment/compliance, employer review required. Title uses text assignment rather than raw employee-name HTML interpolation; blocked popups show guidance. Shrinkable grids, associated labels,1rem inputs and long-text wrapping improve source-level mobile behaviour. About/PWA and earlier fund/rental/demo/offer changes are still dependencies: isolate the intended release from published32484f5 or review the exact combined branch. No production/publicpreview/post/liveDB/customer access/spending performed.

Two direct guides plus the salary-slip section of pakistan-tools-guide, SEO/FAQs/registry/sitemap/generated assets updated. Removed false PF/PESSI/SESSI auto-deduction, saved-template, image-export and compliance assertions. Input state is memory-only; browser print dialog may offer Save as PDF. Other aggregate-guide claims remain separately pending.

Checks:79 combined tests including five new payroll cases; scoped lint, diff and full buildQA159routes115posts pass. Synthetic default and populated page renders with feedback stubbed pass: blank deduction blocks output;70000gross/100enteredtax/0enteredEOBI gives69900net. Actual print, popup handling, keyboard, mobile overflow and rendered long-name/label escaping must be tested on a safe synthetic browser surface; existing local preview limitation remains, no file-policy bypass.

Source verification21November2026:
- https://www.fbr.gov.pk/withholding-tax-rate-card/174298/174301 lists TY2027 current and TY2026 previous.
- https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf retrieved successfully: salary rows pages1–2, page2 visually inspected. Updated through30June2026 under FinanceAct2026; card says original statute prevails. This is not a new verified EOBI basis or complete payroll-law review.
- Prior circular https://download1.fbr.gov.pk/Docs/202698139527880CircularNo.2of2026-27.pdf timed out today. No new tax numbers or surcharge rules imported; existing main salary engine unchanged.

### Final held salary-slip caption

A clean payslip layout cannot fix the wrong deduction.

Rafiqy's Salary Slip Draft Generator uses entered earnings and payroll-confirmed deductions to reconcile gross and net pay. Missing amounts and deductions above gross pay block the draft. Tax estimates stay separate from recorded withholding.

Intended release link: https://rafiqy.app/tools/salary-slip

Need a reviewed payroll-to-accounting workflow for your business? I help scope source-system integration, access controls and approval steps. This tool prepares a browser-printable draft; it does not calculate statutory liability, verify payment or replace employer authorization.

HOLD until browser/print verification, exact version approval and publication; separate approval needed for this caption. Facebook not connected, no post scheduled. Lead/email monitoring is not configured.

---

## API-response offline caching — 20 November 2026 (local only)

Focused diff since3a08815 on codex/rafiqy-community-workflows: vite.config.js changes Supabase GET handling from NetworkFirst to NetworkOnly with fetch cache:no-store; public/sw-cache-cleanup.js deletes only supabase-cache on worker activation. Static public precaching remains. About now limits offline claims and discloses that cloud/online features send requests off-device. No live caches or customer records inspected or removed; no DB operation. Earlier unpublished branch dependencies are still present: isolate this patch from published32484f5 or review the complete release explicitly.

Tradeoff: Supabase reads, including the former public-passage fallback, require a connection; no unverified public-data cache exception added. This does not clear localStorage, cookies, unrelated CacheStorage, database records or separately implemented local state. It does not fix live RLS or certify absence of exposure. Old installed workers remain unchanged until the approved worker activates. No public security/marketing caption is prepared; existing fund/order/migration drafts below remain held and unchanged.

Checks:74 combined tests (three new PWA tests), scoped lint, diff check and production build/QA159routes115posts pass. Generated worker has NetworkOnly/no-store and cleanup import; former NetworkFirst/runtime-cache name absent. QA enforces those artifacts and exact cleanup script. Synthetic deletion tests preserve unrelated caches and cover asynchronous wait, absence and rejected deletion. These are code/build checks, not actual browser migration evidence.

Release gate: on a safe synthetic origin, seed a fake supabase-cache plus unrelated cache; install old worker then update to this reviewed worker. Confirm only named cache removed on activation, static tools still load offline after precaching, API requests fail offline without stale fallback, and online sync resumes. Check multi-tab upgrade, Chrome/Safari/installed PWA and storage deletion failure. Use no real customer data; the available browser cannot reach the local server and earlier file access was denied, so these checks remain pending. Do not bypass that restriction. No production/public preview approved or created.

Primary documentation checked20November2026:
- https://developer.chrome.com/docs/workbox/modules/workbox-routing (GET default and first matching route)
- https://developer.chrome.com/docs/workbox/modules/workbox-strategies (NetworkOnly, fetchOptions, network failure)
- https://developer.chrome.com/docs/workbox/modules/workbox-build (GenerateSWOptions.importScripts)
- https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/delete (named deletion and false if absent)

Production metadata20Nov still reports approved deployment dpl_AKEhcGpFGBMazQ289m6biR8T1puN READY; remote main6c4651a stale. No Facebook/live DB/model/spending. Lead monitoring and email alerts are not configured. Supabase live metadata access and prior GitHub-write permission remain blockers.

---

## Fund summary follow-up — 19 November 2026 (local only)

Branch `codex/rafiqy-community-workflows`; focused diff since c451e07. Extends the same fund page and paired guide, not another app. The branch still includes unapproved rental, order/migration, historical salary-offer and initial fund changes. No production/preview/push/post/DB/model/spend action authorized or performed.

English/Urdu text reports now include opening cash, net agreed dues, total/allocated receipts, protected excess, approved/paid/unpaid costs, calculated closing/unrestricted cash and both gaps, plus formulas and first-line verification/reconciliation warnings. Urdu numbers/currency are directionally isolated. Renamed “confirmed receipts” to recorded/entered amounts. No member/expense references exported; aggregate sharing still needs review. The guide has a worked cash trail; SEO/sitemap/generated assets match. No fresh financial rates or legal effective dates asserted.

Checks:71 planning tests pass, including seven new fund cases (one exercises216 small money combinations); scoped ESLint, diff check and full build/QA159routes115posts pass. Actual page server-render checks pass with feedback stubbed. Browser/mobile/download behaviour remains unverified due the existing access/policy limitation; no workaround attempted. Reviewable source is local, not a public preview. Existing offline HTML still contains only the original two order/migration demos.

Additional review steps: sample report must show opening5000 + entered receipts10500 − paid7000 = closing8500, minus protected1000 = unrestricted7500; unpaid expenses13000 minus7500 = immediate gap5500. Full collection still leaves structural gap4000. In both languages, confirm the downloaded text retains those values, omits unit/expense references and says balances are not independently verified. Mark both expenses fully paid: remaining costs become0 but negative cash still produces a warning and gap5500. Review RTL/wrapping/focus and local downloads on phone widths before release. Read-only Vercel metadata confirms the previous approved bilingual deployment remains READY/production; remote main remains stale6c4651a.

### Final held fund caption — supersedes the earlier fund caption below

Waiting for street contributions? First check whether collecting every agreed amount would actually cover this month's service costs.

Rafiqy's synthetic Shared Services Fund Demo separates a collection delay from a budget shortfall. Its English/Urdu summary shows the opening-to-closing cash trail, protected excess payments and both gaps, without member references.

Intended release link: https://rafiqy.app/tools/community-fund-demo

Need a private reconciliation or member-statement workflow? I help scope access controls, records and integrations around your committee's existing process. This editable demo uses invented examples; it does not verify balances, process payments, send reminders or connect to AI.

HOLD: requires browser verification, approval of the exact combined or isolated release, successful publication, and separate approval for this final caption. No Facebook access available. Lead/email monitoring is not configured. Daily distribution and appointment administration remain queued.

---

## New community-fund demo — prepared 18 November 2026

Local branch `codex/rafiqy-community-workflows`, based on d165e22. New `/tools/community-fund-demo` and paired `/blog/decision-support/manage-shared-service-contributions` guide plus discovery/SEO/sitemap. The branch contains prior unapproved rental, two-demo and salary-offer changes; review a combined release or first isolate the intended patch. No deployment/public preview/remote push/DB/model/message/spending.

64 tests, scoped lint, diff check and full buildQA159routes115posts pass. Browser/phone/download verification pending. The earlier Library offline file contains only order/migration demos; no new fund review artifact is implied.

Review walkthrough: the synthetic sample should show PKR1,500 current contributions outstanding, PKR1,000 protected excess, PKR5,500 funding gap now and PKR4,000 structural budget gap. Change UNIT-A02 receipts from1500 to3000: collection is complete but PKR4,000 gap remains. Increase receipts above agreed dues: extra stays protected. Try paid expense above approval, blank/negative amount and invalid month; results should show errors. Inspect English/Urdu aggregate exports and confirm no unit reference appears. No live funds or messages move.

### Held fund caption draft

Waiting for street contributions? First check whether collecting every agreed amount would actually cover this month's service costs.

Rafiqy's synthetic Shared Services Fund Demo separates partial contributions, approved guard/cleaning costs, protected excess payments and a monthly budget gap. Its English/Urdu summary shows aggregate amounts without a public member list.

Intended release link: https://rafiqy.app/tools/community-fund-demo

For a real private member-statement or reconciliation workflow, I help scope permissions, records and integrations around your committee's process. This demo is an editable worksheet—not payment processing, a verified ledger or connected AI.

Hold until this exact version is checked, approved and live. Caption requires separate approval. Goods distribution and appointment apps remain queued; no routes or live features exist for them.

---

## Latest maintenance addition — 18 November 2026 (not published)

Salary-offer historical-year disclosure and responsive layout, paired four-guide/SEO/registry/sitemap updates. Calculation unchanged; still TY2026/FY2025–26, explicitly not current-year payroll. No refreshed legal-rate claim. Removed displayed confidence and misleading spendable-buffer wording. FBR current/previous-year index verified18Nov; detailed circular/rate-card retrieval timed out.

55 existing tests, scoped lint, diff check and buildQA157routes114posts pass. Actual browser/mobile checks remain pending. Local branch `codex/rafiqy-synthetic-business-demos` also contains earlier b7f5c34 demos and1ee1680 rental correction, which remain unapproved for release. A production request must identify the exact combined batch or first isolate its intended changes onto published32484f5.

Promotion decision: do not advertise Salary Offer Evaluator as current payroll guidance. No new salary-offer caption is prepared for publication. The exact synthetic-demo captions below remain unchanged and separately held; they do not authorize unrelated tool releases or public posting. Lead monitoring remains unconfigured.

---

## New review batch — two synthetic business workflows (17 November 2026)

LOCAL ONLY: branch `codex/rafiqy-synthetic-business-demos`, based on1ee1680. No Vercel deployment, remote push, public preview, model host or Facebook publication. Earlier rental correction is included in this branch history and needs explicit review if released together; alternatively isolate the demo changes onto the published32484f5 source before approval.

New tool pages: `/tools/order-review-demo`, `/tools/migration-evidence-demo`. Paired guides: `/blog/integration/purchase-order-review-before-erp-import`, `/blog/integration/integration-migration-needs-behaviour-tests`.

Working: sample-format order parsing, evidence/mapping/exception review, approval-gated CSV; bounded migration interpreters, editable fixtures, comparison diffs and evidence download. Not connected: OCR, Ollama/LLM, private intake/storage, ERP, real repository migration, compiler/runtime execution or live enquiry capture.

Checks:55 engine/planning tests, scoped ESLint, production build/QA157routes114posts and diff check pass. Synthetic page server renders pass with feedback stubbed. Browser/phone/download interaction tests remain pending due inaccessible local preview and blocked file protocol. Portable offline HTML uses the same workflow components with a simplified review wrapper and network-blocking CSP; it is available for local review.

### Review steps for the offline file

1. Open the downloaded HTML locally. Select Order review demo. Confirm export is blocked initially. Select white boxes, enter a synthetic price-review reason for cups and accept that price. Approve the draft and download the CSV. Change the source and confirm approval resets. Load duplicate example and confirm it stays blocked.
2. Select Migration evidence demo. Run customer comparison:4/5pass, explicit-null fails. Enable null-aware handling and re-run:5/5pass, compiler/runtime still Not run. Load operational-gaps scenario, correct null handling and re-run: gaps remain. Edit fixture JSON and confirm old report clears. Download evidence.
3. Review a narrow phone window, keyboard-only controls and local downloads. Guide links are intentionally disabled in the offline wrapper; the paired guides exist in repository source for the main-site release.

### Final caption draft A — order review (hold)

An order can add up correctly and still contain the wrong product or price.

Rafiqy's synthetic Purchase Order Review Demo shows ambiguous catalogue matches, price exceptions, duplicate references and human review before a local CSV draft is exported.

For distributors and wholesalers: the next step is a focused pilot around your catalogue and existing ERP—not replacing the whole system. Private-model document extraction and live connectors are custom options, not connected demo features.

Intended release link: https://rafiqy.app/tools/order-review-demo

### Final caption draft B — migration evidence (hold)

Converted code needs evidence. What happens to null, an empty string, zero or false after a mapping changes?

Rafiqy's synthetic Migration Evidence Lab lets you expose a null-handling regression, test a correction and inspect output differences. Passing fixtures still leave compiler, runtime and operational checks to complete.

For integration teams: I help scope migrations around supported patterns, explicit gaps and acceptance tests. This browser demo does not convert production projects or execute MuleSoft/Ballerina.

Intended release link: https://rafiqy.app/tools/migration-evidence-demo

Both captions are drafts. Publish only after the exact release is browser-checked, approved and live; public post approval remains separate.

---

## Current prepared batch — rental calculation and assumptions correction

Status: LOCAL ONLY on codex/rafiqy-mobile-review, based on published32484f5. The bilingual32484f5 release is already live as deployment dpl_AKEhcGpFGBMazQ289m6biR8T1puN (READY confirmed17Nov). Older unpublished statements below are historical and superseded. This correction needs its own approval after review; no public preview/deploy/push was performed.

Scope: src/lib/rentVsBuy.js extracted from page, rental regression tests, RentVsBuyPakistan.jsx, UrduToolViews.jsx, paired rent-vs-buy guide, toolSEO and sitemap/generated blog assets, plus release memory.

- Correct annual-to-monthly maintenance/holding costs; cap EMI cash outflow at maturity; recompute balance in lower-markup scenario.
- Remove displayed confidence percentage and unsupported break-even estimate; disclose model limitations and illustrative preset status in English/Urdu and paired guide/SEO.
-42tests pass; scoped lint/diff/buildQA pass153routes112posts. New browser/phone verification remains pending. Published production unchanged. No live rates were asserted or customer inputs used.
- Directly verified primary source17Nov: https://www.bankalfalah.com/personal-banking/loans/hybrid-home-finance/ . Product structure only, no endorsement/current-rate quotation. Refer to TASKS for source/remaining-model limitations and access blockers.

### Final Facebook caption draft — hold for separate approval

Rent or buy? Start by questioning the assumptions—not just comparing rent with a loan instalment.

Rafiqy's Rent vs Buy tool lets you explore financing, holding costs and alternative investment assumptions in English or Urdu. City examples are illustrative, not live bank offers or verified market forecasts.

Try it: https://rafiqy.app/tools/rent-vs-buy-calculator-pakistan

Have a business planning workflow that needs clearer calculations or connected systems? I help teams scope focused integration and automation solutions.

Planning illustration only; confirm actual financing and transaction costs separately.

Hold this caption until the corrected tool passes browser checks and its exact version is approved/live. Facebook access/publication remains separately unapproved. Current tool is live, but this corrected version is not.

---

Historical7590cbe release status: user approved live publication on16November2026. The application content of local commit 7590cbe is deployed and READY at https://rafiqy.app/ via Vercel deployment dpl_D5sK26xUHamJo2HMWDCgZRFdTaqH. GitHub write was denied (403), so remote main remains old; synchronize source before a future Git deployment. Facebook posts and live DB changes remain unapproved/unperformed. See the release checkpoint in TASKS.md. Earlier release gates below record pre-release limitations; live desktop smoke tests now pass, while phone viewport verification and the broader finance backlog remain pending.

## Next batch awaiting review — English/Urdu and AI freelancing

This is a NEW local, unpublished batch after the approved7590cbe live release. Approval for the previous release is not assumed to cover it.

- Add a persistent English/اردو switch and Urdu core views for the four released flagship tools. Use the same engine and parent input state in both languages; stock forecast state is also shared. Urdu errors, numeric output, summaries and core guidance are provided with scoped RTL and bidi handling.
- Scope limitations: global navigation, help, SEO and existing guides remain English; advanced rental sensitivity narratives remain English, with a visible pointer from Urdu. This is not full-site translation or complete presentation parity. Browser/mobile verification of switching, text wrapping, focus, long amounts, downloads and preserved inputs is pending.
- Add the approximately2500-word source-backed article `content/blog/decision-support/freelancing-in-the-ai-era.md`, with its business/developer category discovery and sitemap entry. English article with a short Urdu summary. No current earnings guarantees, model-speed claims or confidential client case studies.
- Relevant checks pass:38 existing calculation tests, scoped lint, five server-render cases (four tool views plus missing-tax-budget state), final build/QA153routes112posts, diff check. Render checks are not a substitute for interactive phone/browser tests.
- No deployment, Facebook post, customer-data access, live DB write or external translation service was performed for this new batch. GitHub source synchronization remains blocked by connector write403.

## Exact review scope

Branch: `codex/rafiqy-mobile-review`.

- Existing prepared work: Rent vs Buy mobile layout, Stock & Replenishment Planner with statistical forecast lab and scoped custom ML/LLM options, paired stock guide, and the year-specific salary calculator/guide.
- This follow-up: freelance cash-reserve correction, four coordinated guides/SEO/FAQs/registry/sitemap, responsive freelance layout and a shrinkable shared related-guide grid.
- The freelance calculation requires an explicit annual tax funding budget. It does not infer tax liability from receipts. Review the removal of the old automatic salary-style estimate and pseudo-confidence score as an intentional correctness change.
- No public AI/ERP connector, enquiry capture, automatic purchasing or forecasting-accuracy claim is included.

## Validation and release gates

- `npm run test:planning`: 38 tests pass, including six new cash-allocation, explicit-budget, deficit, stress-case and validation checks.
- Scoped ESLint passes for the new calculation, freelance page and shared ToolLayout.
- `npm run build`: passes; 152 prerendered routes and 111 blog posts checked.
- `git diff --check`: passes.
- Primary-source check: FBR ordinance collection, checked 16 November 2026, lists consolidation through 30 June 2026. This supports the dated reference, not a statutory freelancer-rate implementation: https://fbr.gov.pk/Categ/Income-Tax-Ordinance/326 .
- Browser interaction and actual mobile/desktop layouts remain unverified because the available browser cannot reach the local server. Verify 320/375/390/768px widths and desktop: edit inputs, empty/zero/negative inputs, scrolling, stock samples, model comparison, copy forecast to an item, downloads and theme changes. Use synthetic inputs only and disable live data integrations during tests.
- Remaining finance correctness gates: salary-offer/slip rules, optimizer credit eligibility and solar/rate assumptions plus their related content. The whole tax/finance cluster is not ready to be advertised as current.
- Supabase live policy metadata access is unavailable; repository policy risks remain unverified live. Lead monitoring and email notifications are not configured. Facebook publishing access is not connected.

## Facebook caption A — stock planning

Hold until the exact stock tool version passes browser checks, is approved and is live. The URL below is an intended release URL, not evidence that the new tool is currently published.

Low stock does not always mean “buy more.” An existing delivery may simply be arriving too late.

Rafiqy's Stock & Replenishment Planner helps you check delivery gaps, avoid duplicate orders and review supplier packs and shelf-life constraints. Its seven-day statistical forecast lab also lets you compare simple methods against daily history.

Try it: https://rafiqy.app/tools/stock-planner

Need this connected to your POS, warehouse or accounting system? I help businesses scope focused integration and automation pilots. Message this page to discuss your workflow.

The browser demo uses editable inputs and synthetic examples. Custom integrations and advanced ML/AI assistance require separate implementation; automatic purchasing is not enabled.

## Facebook caption B — freelance cash planning

Hold until this exact tool version passes browser checks, is approved and is live. Do not position this as a freelancer tax calculator or a completed tax-cluster update.

Your freelance receipts are not the same as money available to spend.

Rafiqy's reserve planner separates business costs, your entered tax budget and reserve allocations, then shows what remains for owner withdrawals. It also exposes funding gaps and tests a 20% drop in receipts.

Try it: https://rafiqy.app/tools/freelance-tax-planner-pakistan

This is a cash-planning scenario, not a tax-liability calculation. Confirm your tax budget separately; salary-tax slabs are not applied to freelance revenue.

## Approval boundary

These are review drafts, not publishing instructions. Approval must identify the final tested commit and selected caption. Resolve any material revisions and obtain fresh approval before the related public action. No lead-collection or email-delivery capability is implied by these drafts.
# Latest focused review — 22 November 2026

See [USABILITY_REVIEW_2026-11-22.md](USABILITY_REVIEW_2026-11-22.md) for the rental upfront-cash correction, accessible navigation/preferences, actual narrow CSS viewport evidence,83 tests/build checks, source links, final held rental caption and remaining release gates. Base remote review snapshot bd6681d already contains earlier unpublished dependencies. Approval of this small diff alone must not publish those dependencies. No public release or social publication occurred.
# Directory/help review — 23 November2026

See [DIRECTORY_REVIEW_2026-11-23.md](DIRECTORY_REVIEW_2026-11-23.md) for exact directory/help copy, shared metadata/topic discovery, search reflow fix, browser/source/build evidence, final held Facebook caption and remaining gates. Base02bf4a4 already contains earlier unapproved dependencies. No production or posting approval is implied.

## 24 November 2026 — solar correctness batch held

See `docs/SOLAR_REVIEW_2026-11-24.md` for the quote-based engine, eight coordinated guides, exact scope removals, primary NEPRA instruments/effective dates, 91-test/build/browser evidence and final held solar caption. Guarded branch `codex/rafiqy-solar-review` inherits the earlier unapproved batches; solar-only approval must isolate its diff onto approved production source, or review the exact combined tree. No release or post approval inferred.
