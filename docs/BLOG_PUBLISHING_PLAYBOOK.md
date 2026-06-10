# BLOG PUBLISHING PLAYBOOK

Read `docs/CODEX_CONTEXT.md` first.

This document defines how to publish blogs on Rafiqy, including normal tool guides and technical MuleSoft content.

## 1. Core Blog Standard

Every blog must:
- solve a real user problem
- be useful without feeling like filler SEO
- lead naturally to a relevant Rafiqy tool or category when appropriate
- use generic search intent first, with Pakistan context where it matters
- include clear title, description, category, tags, read time, publish date, and content
- use H2/H3 structure for readability and table of contents support

## 2. Blog Data Location

All published posts currently live in:
- `src/data/blogPosts.js`

Each post must include:
- `slug`
- `title`
- `description`
- `hero`
- `category`
- `readTime`
- `publishDate`
- `tags`
- `content`

## 3. MuleSoft Blog Category

Use category:
- `mulesoft`

MuleSoft posts should target developers, integration engineers, architects, and learners working with:
- Mule 4
- Anypoint Platform
- API-led connectivity
- DataWeave
- RAML / OpenAPI
- API Manager
- policies
- error handling
- deployments
- CloudHub / Runtime Fabric
- integration design patterns

MuleSoft posts should be practical and example-driven.

Good MuleSoft post types:
- how-to guides
- troubleshooting guides
- comparison guides
- reusable patterns
- interview / learning guides
- migration notes
- checklist-style implementation guides

Avoid:
- shallow introductions with no implementation detail
- untested snippets
- large code blocks with no explanation
- vendor-copy style writing
- claims that depend on current product behavior without checking current docs

## 4. Technical Formatting Rules

Do not paste code as plain paragraphs.

Use:

```html
<pre><code class="language-xml">
&lt;flow name="example-flow"&gt;
  &lt;logger message="Hello Mule" /&gt;
&lt;/flow&gt;
</code></pre>
```

Recommended language classes:
- `language-xml`
- `language-json`
- `language-yaml`
- `language-dw`
- `language-http`
- `language-bash`
- `language-java`

Use inline code only for short identifiers:
- `<code>payload</code>`
- `<code>vars.customerId</code>`
- `<code>HTTP:CONNECTIVITY</code>`

Use tables for comparisons, checklists, and mappings.

Use blockquotes only for important notes, warnings, or tradeoffs.

## 5. DOCX Intake Workflow

If the user places `.docx` drafts in a folder:
- treat the DOCX as source material, not final publishable HTML
- extract and clean the structure
- convert headings to H2/H3
- convert code examples into `<pre><code class="language-...">`
- convert lists and tables properly
- rewrite unclear sections for readability
- add SEO title, description, tags, and internal links
- validate with `npm run build`

Recommended source folder if needed:
- `content-inbox/mulesoft/`

Do not commit raw DOCX files unless the user explicitly asks.

## 6. SEO Rules For MuleSoft Posts

Use generic technical intent first.

Examples:
- `DataWeave Map Function: How to Transform Arrays in Mule 4`
- `Mule 4 Error Handling: Try Scope vs On Error Continue`
- `API-Led Connectivity: Experience, Process and System APIs`

Then add context in description/body:
- practical examples
- Mule 4 version assumptions
- Anypoint Platform context
- common production mistakes

Every MuleSoft post should include:
- a direct problem statement
- one working example or clear pseudo-example
- pitfalls
- when to use / when not to use
- summary checklist
- links to relevant MuleSoft docs when current behavior matters

## 7. QA Rules

Build now runs:
- app build
- prerender
- build QA checks

The QA script checks:
- prerendered pilot routes have title, description, canonical, H1, and links
- blog posts have required metadata
- blog posts have H2 structure
- MuleSoft posts use proper fenced code block HTML when code examples are present

Use:
- `npm run build`

For lint-only work:
- `npm run lint`

Current note:
- lint is still a separate cleanup track because older app code has existing lint debt.
- build QA is the active deploy gate for SEO/prerender/blog integrity.

