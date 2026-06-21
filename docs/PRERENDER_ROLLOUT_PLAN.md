# PRERENDER ROLLOUT PLAN

Read `docs/CODEX_CONTEXT.md` first.

This document defines the long-term rendering strategy for `rafiqy.app` using the current `Vite + React + React Router` codebase.

The goal is:
- fix crawlability without a full framework rebuild
- keep current interactive tools working
- make blogs, categories, and key tool landing pages SEO-readable in raw HTML
- avoid rethinking rendering architecture every session

---

## 1. Core Decision

Use a **hybrid prerender strategy**.

That means:

### Fully prerendered static pages
- homepage
- blog index
- all blog posts
- category pages
- about
- help
- privacy

### Hybrid prerendered + hydrated tool pages
- important tool pages
- all decision-system pages
- other strategic tool landing pages

For hybrid tool pages:
- prerender the route into real HTML
- keep the existing interactive React tool
- hydrate the tool on the client after load

This is the right approach for the current repo because it improves SEO while preserving the current product architecture.

---

## 2. Why This Approach Is The Best Fit

### It solves the real SEO problem
Important crawlers and audit tools currently see too much app shell and not enough route-specific HTML.

Prerender fixes that by giving initial HTML with:
- title
- meta description
- canonical
- H1
- headings
- intro text
- FAQs
- internal links

### It avoids a full rebuild
Do **not** move to Next.js or another SSR framework right now just to solve this.

That would:
- slow momentum
- increase migration risk
- force route/layout rewrites
- create new bugs

### It keeps tool UX intact
The calculators and decision systems can remain browser-based, interactive, and client-driven.

Prerender only changes the initial HTML delivery layer.

---

## 3. What Counts As “Done”

For an important route, prerender is considered complete only when the raw HTML contains:

- correct page title
- correct meta description
- exactly one canonical
- H1
- visible intro copy
- meaningful headings
- internal links
- FAQ/methodology/support content if relevant

For tool pages, the interactive calculator may still hydrate after load.

---

## 4. Rendering Strategy By Page Type

## A. Fully static content routes

These should be prerendered fully:

- `/`
- `/blog`
- `/blog/:slug`
- `/category/...`
- `/about`
- `/help`
- `/privacy`

These pages are mostly content/discovery pages, so static prerendering is the correct default.

## B. Hybrid tool routes

These should be prerendered with the tool UI still hydrating on the client:

### Decision systems
- `/tools/solar-planner`
- `/tools/tax-calculator`
- `/tools/investment-allocation-planner-pakistan`
- `/tools/rent-vs-buy-calculator-pakistan`
- `/tools/petrol-vs-hybrid-vs-ev`
- `/tools/salary-offer-calculator-pakistan`
- `/tools/freelance-tax-planner-pakistan`
- `/tools/loan-emi`

### Other strategic Pakistan-first tools
- `/tools/urdu-keyboard`
- `/tools/salary-slip`
- `/tools/gold-price`
- `/tools/pk-id-tax-hub`
- `/tools/tax-optimizer`
- `/tools/whatsapp-tools`
- `/tools/voice-invoice`

### Flagship product tool
- `/tools/typing-tutor`

Typing Tutor is special because it uses `src/App.jsx`, but it should still follow the same SEO landing-page principle.

## C. Later / lower-priority tools

Do not block the rollout on every minor utility tool.

After the important routes are done and verified, widen coverage gradually.

---

## 5. Recommended Technical Approach

## Use selected-route prerendering in the current Vite app

Do not prerender the whole app blindly.

Instead:
- maintain a route list for prerender
- build once
- generate HTML snapshots for those routes

### Practical implementation shape

1. Keep `src/main.jsx` as the source of routes.
2. Add a dedicated prerender route list in a stable file, for example:
   - `prerender-routes.js`
3. Use a Vite-compatible prerender flow for selected routes only.
4. Output real HTML files for each route.
5. Keep React hydration for interactive pages.

### Why not “all routes automatically”?

Because:
- not every route deserves the same SEO investment
- some tools are strategically important, some are not
- decision systems and blogs should be guaranteed first
- manual control avoids accidental low-value output

---

## 6. Tool Page Rule Under Hybrid Prerender

Every important tool page must behave like:

- SEO landing page first
- app second

This is not only a rendering rule. It is the standing best-practice content/SEO rule for all strategic tools going forward.

Important UX rule:
- do not bury the tool under too much explanation
- the user should be able to reach the main interaction quickly
- explanatory sections like “how it works”, methodology, deep FAQs, and long support content should usually come after the first usable tool area or below a short trust/introduction layer

That means the prerendered HTML must already contain:

### Required visible blocks
- H1
- one clear value statement
- one short intro paragraph
- one concise “what this tool helps you decide/do” block
- the main usable tool interaction near the top
- methodology or trust block where relevant, usually below the first usable tool area
- FAQ block
- related guides or related tools

### Required metadata rules
- one canonical only
- route-specific title
- route-specific meta description
- route-specific OG/Twitter title and description
- no shell-level homepage metadata leaking into the tool route

### Optional but recommended
- example scenarios
- “who this is for”
- visible assumptions date / freshness note
- explicit next-step guidance
- support-cluster links near the top, not only at the bottom

The calculator itself can remain interactive and client-driven after hydration.

---

## 7. Blog Rule Under Static Prerender

Every blog page should ship as complete static HTML:

- full article content
- metadata
- canonical
- related links
- FAQ if present

No important blog should rely on client rendering for core text visibility.

---

## 8. Specific Architecture Rules To Prevent Future Drift

### Rule 1
Do not let `index.html` inject route-specific canonical/title/description for all routes.

The app shell may keep:
- generic site name
- generic image references
- generic theme/PWA tags

But route identity must come from the route/page layer.

### Rule 2
Every important tool needs one stable page-specific SEO definition in:
- `src/data/toolSEO.js`

### Rule 3
Every important blog must exist as real content in:
- `src/data/blogIndex.js`
- `scripts/generated/blogPrerenderData.mjs`

### Rule 4
When a route is strategic, it must be on the prerender list.

### Rule 5
If a tool/blog/category becomes strategically important later, add it to prerender as part of the same change.

---

## 9. Rollout Order

Implement in this order to reduce risk.

## Phase 1: infrastructure

- create stable prerender route list
- add prerender build flow
- verify output for a few routes only

This phase is a pilot by design. Do not expand route coverage until these few routes are confirmed working in raw HTML and after hydration.

Initial verification routes:
- `/`
- `/tools`
- `/blog`
- `/tools/solar-planner`
- `/tools/tax-calculator`

Current status:
- implemented in the repo with:
  - `scripts/prerender-routes.mjs`
  - `scripts/prerender.mjs`
  - `package.json` build flow
- pilot raw HTML verification passed for:
  - title
  - meta description
  - canonical
  - H1
- next step is route expansion, not rethinking the approach

## Phase 2: all core content pages

- all static discovery/content pages
- all category pages
- all high-value blog posts

## Phase 3: all decision systems

- solar
- tax
- investment
- rent vs buy
- EV/hybrid/petrol
- salary offer
- freelance tax planner
- loan EMI

### Solar-specific carry-forward requirements

The solar page already received a dedicated SEO improvement pass. Those improvements must be preserved and verified during prerender rollout, not accidentally overwritten by shell-level metadata or stripped-down HTML output.

Required solar SEO elements to preserve:

- one canonical only:
  - `https://rafiqy.app/tools/solar-planner`
- route-specific title:
  - generic solar calculator intent first
  - Pakistan context second
- route-specific meta description:
  - solar size
  - install cost
  - monthly savings
  - payback
  - net billing / tariff context
- H1:
  - `Solar Calculator`
- early visible value section:
  - what the calculator helps the user decide
- visible methodology section:
  - sizing formula
  - self-consumption/export logic
  - cost-range basis
  - payback basis
- trust / freshness layer:
  - visible data date
  - current net billing framing
  - planning-not-quote disclaimer
- early internal links into the solar support cluster
- stronger generic-query alignment in:
  - tool tags
  - title
  - intro
  - FAQs

Required solar support-cluster routes to preserve and prerender:

- `/blog/decision-support/solar-planner-pakistan`
- `/blog/decision-support/smaller-solar-system-vs-net-billing-pakistan`
- `/blog/decision-support/should-you-add-a-battery-to-solar-in-pakistan`
- `/blog/decision-support/5kw-solar-system-price-in-pakistan`
- `/blog/decision-support/10kw-solar-system-price-in-pakistan`
- `/blog/decision-support/how-much-solar-do-i-need-for-a-20000-bill-in-pakistan`
- `/blog/decision-support/how-much-solar-do-i-need-for-a-30000-bill-in-pakistan`
- `/blog/decision-support/hybrid-vs-on-grid-solar-in-pakistan`

When solar is verified after prerender, check:
- raw HTML source shows solar title, description, H1, and headings
- no homepage canonical leaks into the route
- methodology and support links are present before hydration
- guide pages retain their updated titles/descriptions and route identity

## Phase 4: key Pakistan-first tools

- Urdu keyboard
- salary slip
- gold price
- tax optimizer
- PK ID & Tax Hub
- WhatsApp tools
- voice invoice

## Phase 5: flagship typing route

- typing tutor

This may need slightly different handling because it is not a normal `ToolLayout` page.

## Phase 6: widen coverage if justified

- only after the important routes are verified in crawl tools and Search Console

---

## 10. Verification Checklist

For each prerendered route, verify:

1. raw HTML source contains the correct title
2. raw HTML source contains one canonical only
3. raw HTML source contains H1
4. raw HTML source contains body text and headings
5. raw HTML source contains internal links
6. rendered page still hydrates and works
7. build still passes
8. sitemap remains correct

For decision tools:
- calculator still works after hydration
- no broken local state behavior
- no duplicate metadata

---

## 11. SEO Outcomes Expected

If implemented correctly, this should improve:

- route-level crawlability
- Seobility/basic crawler results
- consistency of canonical handling
- title/meta detection
- page-topic clarity
- long-tail ranking reliability
- indexation quality for strategic pages

It will **not** instantly solve:
- low backlinks
- weak domain authority
- zero historical impressions
- low CTR from weak snippets already cached by Google

Those will still need separate work.

---

## 12. Risks And How To Avoid Them

### Risk: duplicate canonical/title/meta
Avoid by keeping route-specific metadata out of the shell where possible.

### Risk: hydration mismatch
Avoid by keeping prerendered content structurally consistent with the live React output.

### Risk: trying to prerender everything at once
Avoid by using the phased route list.

### Risk: tool UI depending on browser-only APIs
Avoid by ensuring browser-only logic stays inside effects or client runtime boundaries where needed.

### Risk: future sessions forgetting the rule
Avoid by updating:
- `docs/CODEX_CONTEXT.md`
- `docs/TASKS.md`

---

## 13. Future Rule For New Strategic Tools

When a new strategic tool or decision system is added:

1. build the tool
2. add tool SEO
3. add at least one related blog
4. connect discovery
5. add the route to prerender if it is strategically important
6. validate raw HTML + hydrated behavior

And also apply the full landing-page pattern used in the solar SEO pass:
- strong query-aligned title/H1
- visible trust/methodology layer
- scenario/examples if useful
- clear support-cluster links
- route-specific metadata only

This rule should be considered permanent.

---

## 14. Final Recommendation

The best approach for `rafiqy.app` is:

- **static prerender for all content/discovery pages**
- **hybrid prerender + hydration for all important tool pages**
- **all decision systems included from the start**
- **no full framework rebuild right now**

This gives the SEO benefits you need while preserving the current app and avoiding a risky architecture reset.
