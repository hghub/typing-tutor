# Rafiqy — Agent & Developer Guide
## Read This Before Making ANY Changes

> This guide ensures every agent and developer follows consistent practices. Non-compliance causes broken builds, SEO regressions, and inconsistent UX.

---

## ⚡ Quick Checklist Before Starting

- [ ] Read `docs/ARCHITECTURE.md` for project structure
- [ ] Read `docs/SEO_PLAYBOOK.md` for SEO rules
- [ ] Run `npm run build` baseline — confirm 0 errors before your changes
- [ ] After changes, run `npm run build` again — must still be 0 errors
- [ ] Commit with the Co-authored-by trailer (see below)

---

## 🏗️ How to Add a New Tool — Complete Checklist

> **Copy this checklist.** Every item is required unless marked optional.

### ✅ Step 1 — Create the tool page
Create `src/pages/YourTool.jsx`. **Always wrap in `ToolLayout`** — this auto-injects all SEO meta tags, canonical URL, JSON-LD, related tools, blog links, and the SEO footer:
```jsx
import ToolLayout from '../components/ToolLayout'

export default function YourTool() {
  return (
    <ToolLayout toolId="your-tool-id">
      {/* your tool UI */}
    </ToolLayout>
  )
}
```
> ⚠️ Exception: Typing Tutor (`src/App.jsx`) does NOT use ToolLayout — it has its own full-page layout.

---

### ✅ Step 2 — Add to registry.js
`src/tools/registry.js` is the **single source of truth**. The `id` drives favourites, recent views, related tools, and all navigation. The `path` drives canonical URLs, sitemap, and links everywhere.

```js
{
  id: 'your-tool-id',           // kebab-case, unique, NEVER change after launch
  name: 'Your Tool Name',       // Display name shown everywhere
  tagline: 'One line benefit',  // Short CTA shown on tool cards
  description: 'Full description for the /tools grid card',
  icon: '🛠️',
  color: '#hexcolor',           // Accent colour for hover/highlight states
  category: 'productivity',    // Must match an existing CATEGORIES id in registry.js
  path: '/tools/your-tool-slug', // ALWAYS /tools/ prefix — this IS the canonical URL
  tags: ['tag1', 'tag2'],
  features: ['Feature 1', 'Feature 2'],  // Shown in tool card
  related: ['other-tool-id', 'another-tool-id'],  // 2-3 tool IDs for RelatedTools widget
}
```

> 🎯 **Favourites & Recent Views are automatic.** Once your tool's `id` is in registry.js, it appears in "❤️ My Favourites" and "🕐 Recently Used" on the `/tools` page with zero extra code. The `ToolsHome.jsx` handles this via `localStorage` keys `typely_favourites` and `typely_recent_tools`.

---

### ✅ Step 3 — Add SEO content to toolSEO.js
`src/data/toolSEO.js` — keyed by `tool.id`. **ToolLayout reads this automatically** to inject `<title>`, `<meta description>`, OG tags, H1, paragraphs, and FAQPage JSON-LD.

```js
'your-tool-id': {
  metaTitle: 'Primary Keyword — Benefit | Rafiqy',  // ≤60 chars, keyword first
  metaDesc: 'Benefit-driven 120-155 char description. Use [tool] to [benefit]. Free, private, no sign-up.',
  heading: 'Full H1 heading with primary keyword',
  paras: [
    'Para 1: What the tool does + primary keyword',
    'Para 2: ALL features — list every capability (not just the main one)',
    'Para 3: Who it is for + use cases (specific: "Pakistani freelancers", "students")',
    'Para 4: Privacy/trust — all processing in browser, nothing sent to server',
  ],
  faqs: [
    { q: 'What does this tool do?', a: 'Comprehensive answer...' },
    { q: 'Is it free?', a: 'Yes. Completely free, no sign-up required.' },
    { q: 'Is my data private?', a: 'Yes. All processing in your browser. Nothing is sent to any server.' },
    // Add 5–15 FAQs — each FAQ = one rich snippet opportunity in Google
  ],
}
```

---

### ✅ Step 4 — Add route to main.jsx
```jsx
const YourTool = lazy(() => import('./pages/YourTool.jsx'))
// Add inside <Routes> in src/main.jsx:
<Route path="/tools/your-tool-slug" element={<YourTool />} />
```
> No redirects needed. One route, one canonical URL.

---

### ✅ Step 5 — Update sitemap.xml
Add to `public/sitemap.xml` (keep alphabetical within the tools block):
```xml
<url>
  <loc>https://rafiqy.app/tools/your-tool-slug</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

---

### ✅ Step 6 — Update tool count in Landing.jsx
Search `Landing.jsx` for the tool count number and increment it. It appears in:
- Hero section (e.g. "58 free tools")
- Browse button (e.g. "Browse All 58 Tools")

---

### ✅ Step 7 — Write a blog post (strongly recommended)
Every new tool should have at least one blog post. Add to `src/data/blogPosts.js`:
```js
{
  slug: 'your-blog-slug',          // kebab-case, must be unique
  title: 'Full Blog Title — How to [Action] | Rafiqy Blog',
  description: '120-155 char meta description — keyword-rich, benefit-driven',
  category: 'productivity',        // Must match tool.category → auto-links blog↔tool
  publishDate: 'YYYY-MM-DD',
  readTime: 'X min read',
  hero: '🎯',
  tags: ['Tag1', 'Tag2'],
  content: `
<div class="blog-content">
  <h2>Section Heading</h2>
  <p>Use <a href="/tools/your-tool-slug">Your Tool Name</a> to...</p>
  <ul>
    <li><strong>Feature 1:</strong> What it does</li>
    <li><strong>Feature 2:</strong> What it does</li>
  </ul>
  <p><a href="/tools/your-tool-slug" class="blog-cta-btn">Try Your Tool Free →</a></p>
</div>
  `,
}
```

Then add the blog to `public/sitemap.xml`:
```xml
<url>
  <loc>https://rafiqy.app/blog/your-blog-slug</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

> **Auto-linking:** Blog posts auto-appear on tool pages and category pages when `post.category === tool.category`. No extra wiring needed — just match the category.

---

### ✅ Step 8 — Check CSP if adding external APIs
If your tool calls an external API or loads an external font/script, update the CSP in `index.html` (line 7):
- New API domain → add to `connect-src`
- New font service → add to `style-src` and `font-src`
- External script → add to `script-src`

---

### ✅ Step 9 — Build and verify
```bash
npm run build   # Must pass with 0 errors
```
Then open `https://rafiqy.app/tools/your-tool-slug` in browser and verify:
- Page loads correctly
- Title tag = your `metaTitle`
- SEO footer (H1, paragraphs, FAQs) appears at the bottom
- Related Tools widget shows 2-3 tools
- Related Blog Posts shows if category matches a blog

---

### 📋 New Tool — Files Summary

| File | What to change |
|---|---|
| `src/pages/YourTool.jsx` | **CREATE** — wrap in ToolLayout |
| `src/tools/registry.js` | Add tool object (id, name, path, category, related…) |
| `src/data/toolSEO.js` | Add SEO entry (metaTitle, metaDesc, heading, paras, faqs) |
| `src/main.jsx` | Add `<Route path="/tools/your-slug" element={<YourTool />} />` |
| `public/sitemap.xml` | Add tool URL (and blog URL if writing a post) |
| `src/pages/Landing.jsx` | Increment tool count in hero + browse button |
| `src/data/blogPosts.js` | Add blog post (recommended) |
| `index.html` | Update CSP if new external domain needed |

---

## 📝 How to Add a Blog Post

Add to `src/data/blogPosts.js`:
```js
{
  slug: 'your-blog-slug',          // kebab-case, URL-safe
  title: 'Full Blog Title Here',
  description: 'Meta description 120-155 chars — keyword-rich, benefit-driven',
  category: 'productivity',        // Must match tool.category for auto-related-posts
  publishDate: 'YYYY-MM-DD',
  readTime: 'X min read',
  hero: '🎯',                      // Single emoji used as card visual
  tags: ['Tag1', 'Tag2', 'Tag3'],
  content: `
<div class="blog-content">
  <h2>Section Heading</h2>
  <p>Content with <a href="/tool-canonical-url">Tool Name</a> links.</p>
  <ul>
    <li><strong>Feature 1:</strong> Description</li>
    <li><strong>Feature 2:</strong> Description</li>
  </ul>
  <h2>Another Section</h2>
  <p>More content...</p>
</div>
  `,
}
```

**Blog content rules:**
1. Every tool mentioned must have a hyperlink to its **canonical URL** (`/tools/slug`)
2. Every tool section must have a "Key Features" `<ul>` listing ALL tool features
3. Link to at least 3 different tools per blog post
4. Content should be 600-1500 words
5. Use `<h2>` for sections (not `<h1>` — the blog title is the H1)
6. Keep HTML clean — no inline styles in blog content

---

## 🗂️ How to Add a Category Page

### Step 1 — Add to CATEGORY_DATA in CategoryPage.jsx
```js
'your-category': {
  title: 'Category Title',
  metaTitle: 'SEO Title | Rafiqy',
  metaDesc: '120-155 char description',
  intro: '150-200 word intro covering the category and what tools are in it',
  categories: ['registry-category-id'],  // Must match tool.category values in registry
},
```

### Step 2 — Add route in main.jsx
```jsx
<Route path="/category/your-category" element={<CategoryPage category="your-category" />} />
```

### Step 3 — Add to sitemap.xml
```xml
<url><loc>https://rafiqy.app/category/your-category</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
```

---

## 🔗 URL Change Rules

The canonical URL format is `/tools/[slug]` for all tools. If you must change a tool's URL:
1. Update `path` in `registry.js`
2. In `main.jsx`: update the route path
3. Update `public/sitemap.xml`
4. Check `Landing.jsx` QUICK_ACTIONS for hardcoded paths

---

## 🎨 Styling Conventions

1. **No Tailwind in tool pages** — use inline styles only
2. **Always use `colors` object** from `useTheme()` — never hardcode `#fff` or `#000`
3. **Primary accent:** `#06b6d4` (cyan-500) — safe to hardcode for accents
4. **Border radius:** Use `0.75rem` (cards), `0.5rem` (inputs), `999px` (pills/badges)
5. **Hover states:** Use `onMouseEnter`/`onMouseLeave` on `e.currentTarget.style`
6. **Mobile:** Check `useIsMobile()` hook, adjust padding/grid for mobile
7. **Font:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

---

## 🔒 Privacy Rules

**CRITICAL — never violate these:**
- No tool may send user data to any server (files, text, financial data, health data)
- All processing must happen in the browser (WebAssembly, Canvas API, Web Crypto API)
- Data persistence uses `localStorage` only
- Exception: Typely leaderboard uses Supabase (opt-in only — user creates a nickname)
- Exception: Feedback form uses Supabase (user explicitly submits)
- No analytics scripts, no tracking pixels, no third-party cookies

---

## ⚙️ Build & Deploy

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build (MUST pass with 0 errors before committing)
npm run build

# Preview production build locally
npm run preview
```

**Deployment:** Vercel (auto-deploys on push to main). `vercel.json` configures SPA fallback.

---

## 📦 Git Commit Convention

```
<type>: <short description>

<optional body>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

Types: `feat` (new feature), `fix` (bug fix), `seo` (SEO changes), `content` (blog/copy changes), `refactor`, `style`

Examples:
- `feat: add text diff comparison tool`
- `seo: add flat URLs for 7 priority tools + category pages`
- `fix: challenge link encoding for special base64 chars`
- `content: update typing-learning blog with all 24 Typely features`

---

## 🚨 Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Hardcoding `#fff`/`#000` in styles | Use `colors.bg`, `colors.text` from `useTheme()` |
| Using `window.location.search` in React | Use `useSearchParams()` from react-router-dom |
| Adding a tool without SEO content | Always add `metaTitle`, `metaDesc`, `heading`, `paras`, `faqs` to toolSEO.js |
| Forgetting to update sitemap.xml | Add every new URL — tool, category, blog |
| Wrapping Typely in ToolLayout | Typely uses its own layout in App.jsx |
| Sending user data to a server | All processing must be browser-only |
| Using `window.location.origin` without stripping `www.` | Use `.replace('://www.', '://')` |
| Short FAQs (1-2 FAQs) | Every tool needs 5-15 FAQs covering all use cases |
| Blog mentions tool without linking it | Always link tool with canonical URL |

---

## 📋 Files That Need Manual Updates for Common Tasks

| Task | Files to Update |
|---|---|
| Add new tool | `registry.js`, `toolSEO.js`, `main.jsx`, `sitemap.xml`, new page file |
| Change tool URL | `registry.js`, `sitemap.xml` |
| Add category page | `CategoryPage.jsx`, `main.jsx`, `sitemap.xml` |
| Add blog post | `blogPosts.js`, `sitemap.xml` |
| Update tool count | `Landing.jsx` (hero + browse button), `CategoryPage.jsx` browse link |
| Improve SEO for a tool | `toolSEO.js` (metaTitle, metaDesc, paras, faqs) |
