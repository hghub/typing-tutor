# Rafiqy — SEO Playbook

> The definitive guide for all SEO decisions on Rafiqy. Read before writing any meta content, URLs, structured data, or blog posts.

---

## 1. URL Strategy

### Rule: Keyword-First Flat URLs for Priority Tools
High-traffic tools get flat, keyword-rich URLs instead of `/tools/slug`:

**Format:** `/[primary-keyword]-[modifier]`

✅ Good: `/compress-pdf-online-free`, `/pakistan-tax-calculator`, `/typing-tutor-online-free`
❌ Bad: `/tools/compress-pdf`, `/tools/tax`, `/typely`

### Rule: Always Redirect Old URLs
When a URL changes, the old path MUST redirect:
```jsx
<Route path="/tools/compress-pdf" element={<Navigate to="/compress-pdf-online-free" replace />} />
```
Keep old URL in sitemap for 3–6 months, then remove.

### Rule: Standard Tools Use `/tools/[slug]`
For tools not yet promoted to flat SEO URL, use `/tools/[descriptive-slug]`.

### Rule: Categories at `/category/[name]`
Category pages always at `/category/[name]`. Name must be human-readable:
✅ `/category/productivity-tools`, `/category/pakistan-tools`
❌ `/category/prod`, `/category/pk`

---

## 2. Meta Title Formula

**Format:** `Primary Keyword — Benefit | Rafiqy`

Rules:
- ≤60 characters total (Google truncates at ~60)
- Primary keyword first (most important for ranking)
- Benefit after the dash (answers "why use this?")
- `| Rafiqy` brand suffix always last
- No clickbait, no ALL CAPS

**Examples:**
```
Free Typing Tutor Online — Improve WPM | Rafiqy           ✅ (51 chars)
Free Compress PDF Online — Reduce File Size | Rafiqy       ✅ (51 chars)
Pakistan Income Tax Calculator 2025-26 — FBR | Rafiqy      ✅ (53 chars)
Free Word Counter Online — Count Words Instantly           ✅ (no brand — acceptable for long keyword)
```

**Homepage title:**
```
Free Online Tools for Productivity, Finance & PDF | Rafiqy
```

---

## 3. Meta Description Formula

**Format:** `Use [Tool] to [benefit]. [Feature 1], [Feature 2]. Free, [privacy note]. No sign-up.`

Rules:
- 120–155 characters (Google shows ~155)
- Must include primary keyword naturally
- Lead with the benefit, not the feature
- End with trust signals: "Free", "private", "no sign-up", "browser-based"
- No duplicate descriptions across tools

**Examples:**
```
Compress PDF files online for free. Reduce file size without losing quality.
100% browser-based — your files never leave your device.           (155 chars ✅)

Free typing speed test with 1v1 battles, XP system, Kids Mode,
Urdu phonetic input and career readiness. No sign-up. 8 languages. (142 chars ✅)
```

---

## 4. H1 Heading Formula

H1 is rendered from `seo.heading` in toolSEO.js, displayed by `ToolSEOFooter.jsx`.

**Format:** `Free [Tool Name] — [Specific Benefit] Online`

Rules:
- Must contain primary keyword
- Should differ from meta title (adds context, not just a duplicate)
- 40–80 characters ideal
- Only ONE H1 per page (the tool name in the nav area is `<h2>` or a `<div>`)

---

## 5. JSON-LD Structured Data

`ToolLayout.jsx` auto-generates two schemas for every tool:

### WebApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Tool Name",
  "url": "https://rafiqy.app/tool-url",
  "description": "metaDesc value",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "provider": { "@type": "Organization", "name": "Rafiqy", "url": "https://rafiqy.app" }
}
```

### FAQPage Schema (auto-generated from `seo.faqs`)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "FAQ question?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer text." }
    }
  ]
}
```

**FAQPage schema appears in Google Search as expandable results — high-value real estate. Always add 5–15 FAQs.**

### Homepage: WebSite + SearchAction
```json
{
  "@type": "WebSite",
  "name": "Rafiqy",
  "url": "https://rafiqy.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://rafiqy.app/tools?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### Category Pages: CollectionPage
```json
{ "@type": "CollectionPage", "name": "Category Title", "url": "...", "description": "..." }
```

### Blog Posts: Article
```json
{
  "@type": "Article",
  "headline": "Blog Title",
  "author": { "@type": "Organization", "name": "Rafiqy" },
  "datePublished": "YYYY-MM-DD"
}
```
*(Blog Article schema is NOT yet implemented — add to BlogPost.jsx)*

---

## 6. SEO Content Rules for toolSEO.js

### Paragraphs (`paras` array)
- Minimum **3 paragraphs**, ideal **4–5**
- Para 1: What the tool does + primary keyword usage
- Para 2: **ALL features** — this is critical. Don't just mention the main feature; list every capability
- Para 3: Who it's for + use cases (be specific: "Pakistani freelancers", "students", "developers")
- Para 4: Privacy/trust statement + comparison to alternatives
- Para 5 (optional): Tips for getting the most out of the tool

### FAQs (`faqs` array)
- Minimum **5 FAQs**, ideal **8–15**
- Cover every feature with a FAQ
- Cover every user question / hesitation
- FAQ answers should be 1–4 sentences — detailed enough to be helpful
- Standard FAQs to always include:
  - "Is [tool] free?" → Yes, completely free, no account required.
  - "Is my data private/safe?" → Yes, all processing in browser, nothing sent to server.
  - "Does it work offline?" → Yes (if true)
  - "Does it support Urdu/Arabic?" → Yes (if true)

### Typely-specific: All 24 features must appear across paras + faqs
See `docs/ARCHITECTURE.md` Section 7 for the complete feature list.

---

## 7. Internal Linking Strategy

### Tool Pages → Related Tools
Handled automatically by `RelatedTools.jsx` using `tool.related` array in registry.

### Tool Pages → Related Blog Posts
Handled automatically by `ToolLayout.jsx` — matches `post.category === tool.category`.

### Category Pages → Related Blog Posts
Handled automatically by `CategoryPage.jsx` — matches by category.

### Blog Posts → Tools (MANUAL — must be done by author)
Every tool mentioned in a blog must:
1. Be linked with its canonical flat URL
2. Have a features list
3. Have a CTA: `<a href="/tool-url">Try [Tool] Free →</a>`

### Homepage → Priority Tools
`Landing.jsx` QUICK_ACTIONS and WHAT_YOU_CAN_DO arrays link to priority tools. Keep these updated when tool URLs change.

### SEO Intro on Homepage
The 300-word SEO intro on Landing.jsx links to 4+ priority tools inline. Keep updated.

---

## 8. Sitemap Rules

**File:** `public/sitemap.xml`

### Update triggers
- New tool added → add tool URL
- Tool URL changed → add new URL (keep old for 6 months)
- New category page → add category URL
- New blog post → add blog URL

### Priority values
| Page type | Priority |
|---|---|
| Homepage | 1.0 |
| Priority tools (flat URLs) | 0.9 |
| Standard tools | 0.7 |
| Category pages | 0.6 |
| Blog posts | 0.6 |
| Static pages (About, Help) | 0.5 |

### Change frequency
| Page type | changefreq |
|---|---|
| Currency converter | daily (prices change) |
| Gold price, Tax calculator | weekly (rates update) |
| Most tools | weekly |
| Category pages | weekly |
| Blog posts | monthly |

---

## 9. Canonical URL Rules

- Every page must have exactly ONE canonical URL
- Format: `https://rafiqy.app/path` (no trailing slash, no `www.`)
- Set via `<link rel="canonical">` in Helmet
- ToolLayout sets canonical automatically from `tool.path`
- App.jsx (Typely) sets canonical manually — must be updated when URL changes
- Old redirected URLs must NOT have a canonical (they 301 redirect, so Google follows)

---

## 10. OG / Social Tags

All tool pages automatically get from ToolLayout:
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://rafiqy.app/..." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Rafiqy" />
<meta name="twitter:card" content="summary" />
```

**TODO (not yet implemented):**
- `og:image` — add a 1200×630 default OG image at `/og-image.png`
- Per-tool OG images for better social sharing

---

## 11. Blog SEO Best Practices

1. **Title format:** `[Action/Question] — [Rafiqy Tool Category] | Rafiqy Blog`
2. **URL format:** `/blogs/tools/[keyword-slug]`
3. **Minimum length:** 600 words (ideal 1000–1500)
4. **Keyword density:** Mention primary keyword 3–5 times naturally
5. **Internal links:** Link to at least 3 different Rafiqy tools
6. **Update frequency:** Update blog when tool features change
7. **Evergreen over news:** Write content that stays relevant (avoid date-specific references)

---

## 12. Current SEO Status (April 2026)

### ✅ Implemented
- 16 priority tools with flat SEO URLs + redirects
- `metaTitle` + `metaDesc` for all 57 tools in toolSEO.js
- JSON-LD `WebApplication` + `FAQPage` for all tool pages (via ToolLayout)
- Homepage Helmet + WebSite JSON-LD + keyword H1 + SEO intro
- 8 category pages with Helmet + CollectionPage JSON-LD
- Blog links on tool pages (auto-matched by category)
- Blog links on category pages (auto-matched by category)
- Google Search Console verified
- Bing Webmaster verified (BingSiteAuth.xml)
- sitemap.xml with all URLs

### ⏳ Pending / To Do
- Typely SEO content update — cover all 24 features in paras + 14 FAQs
- All 16 blog posts — expand to cover all tool features
- OG image (1200×630) for social sharing
- Blog Article JSON-LD schema in BlogPost.jsx
- Live gold price integration (CoinGecko API)
- Text diff tool (new developer tool)
- Typely UI redesign (start screen)
