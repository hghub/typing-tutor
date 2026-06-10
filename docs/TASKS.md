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
   - pilot routes implemented and validated:
     - `/`
     - `/tools`
     - `/blog`
     - `/tools/solar-planner`
     - `/tools/tax-calculator`
   - raw HTML verification passed for pilot pages:
     - single title
     - single meta description
     - single canonical
     - H1 present
2. expand prerender coverage to homepage / tools / blog / category pages
3. all decision-system pages
   - preserve the existing solar SEO improvements during rollout
   - verify solar route/source after prerender before widening further
4. other key Pakistan-first tools

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
- build QA now checks blog metadata and MuleSoft code-block formatting

Next when content is available:
- publish first MuleSoft post from user-provided content or DOCX source
- add it to `src/data/blogPosts.js`
- add strong title, description, tags, and internal links
- add it to prerender once blog route expansion starts

### 5. Maintain one useful blog per tool minimum

This baseline has been largely achieved.

Ongoing rule:
- if a tool is important and its blog feels weak, outdated, or too generic, improve it
- if a tool gains a new feature or use case, consider whether the related blog should also be updated

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
