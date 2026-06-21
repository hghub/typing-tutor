# TASKS

Read `docs/CODEX_CONTEXT.md` first.
Then use this file as the current working queue for `rafiqy.app`.

This file should be updated whenever:
- priorities change
- a major batch is completed
- a new long-term opportunity becomes actionable
- a future Codex session learns something operational that is not yet captured here

## Current Priorities

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
- build now prerenders 149 routes
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

Next when content is available:
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
