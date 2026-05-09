# CODEX_CONTEXT

Read this file first at the start of every Codex session for `typing-tutor` / `rafiqy.app`.
Then read `docs/TASKS.md` and continue with the highest-priority next step.

Ignore `docs/new/` unless the user explicitly asks for it.

If this file and the live code ever differ, trust the live code and then update this file.

## 1. Project Identity

- Public brand: `Rafiqy`
- Repo folder name is legacy: `typing-tutor`
- Site type: privacy-first browser tools + decision systems
- Primary audience: `Pakistan first`
- Secondary audience: international users where the tool/problem is broader
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
- When adding or updating a tool/blog, also review:
  - blog tags
  - blog filters/topic chips
  - category discovery
  - internal anchors
  - homepage/tools/blog surfacing if the cluster is important

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
  - actionable guidance
  - collapsible advanced detail when needed

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
- `src/data/blogPosts.js`
  - all blog content
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
- `src/data/blogPosts.js`
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

## 8. Stable Operations Rules

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

If a new finding is stable and likely useful in future sessions, add it to `CODEX_CONTEXT.md`.
If it is an active next step, open question, or temporary priority, add it to `TASKS.md`.
