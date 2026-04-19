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

## 🏗️ How to Add a New Tool

### Step 1 — Create the tool page
Create `src/pages/YourTool.jsx`. Wrap it in `ToolLayout`:
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

### Step 2 — Add to registry.js
Add an entry to `src/tools/registry.js`:
```js
{
  id: 'your-tool-id',
  name: 'Your Tool Name',
  tagline: 'One line benefit description',
  description: 'Full description for the tools hub card',
  icon: '🛠️',
  color: '#hexcolor',
  category: 'productivity',   // Must match an existing CATEGORIES id
  path: '/tools/your-tool-slug',   // Always use /tools/ prefix
  tags: ['tag1', 'tag2'],
  features: ['Feature 1', 'Feature 2'],
  related: ['other-tool-id', 'another-tool-id'],  // 2-3 related tool IDs
}
```

### Step 3 — Add SEO content to toolSEO.js
Add an entry to `src/data/toolSEO.js`:
```js
'your-tool-id': {
  metaTitle: 'Primary Keyword — Benefit | Rafiqy',  // <60 chars, keyword first
  metaDesc: 'Benefit-driven description 120-155 chars. Use [tool] to [benefit]. Free, private, no sign-up.',
  heading: 'Full H1 heading with primary keyword',
  paras: [
    'Para 1: What the tool does and why it matters (mention primary keyword)',
    'Para 2: Key features — cover ALL features, not just the basic ones',
    'Para 3: Privacy/privacy angle + who it is for',
  ],
  faqs: [
    { q: 'What does this tool do?', a: 'Comprehensive answer...' },
    { q: 'Is it free?', a: 'Yes. Completely free, no sign-up, no watermarks.' },
    { q: 'Is my data private?', a: 'Yes. All processing happens in your browser. Nothing is sent to any server.' },
    // Add 5-10 FAQs covering every feature
  ],
}
```

### Step 4 — Add route to main.jsx
```jsx
const YourTool = lazy(() => import('./pages/YourTool.jsx'))
// Add inside <Routes>:
<Route path="/tools/your-tool-slug" element={<YourTool />} />
```

### Step 5 — Update sitemap.xml
Add to `public/sitemap.xml`:
```xml
<url>
  <loc>https://rafiqy.app/tools/your-tool-slug</loc>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

### Step 6 — Add a blog reference (optional but recommended)
If a relevant blog post exists in `blogPosts.js`, add a mention of the new tool with a link and feature list.

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
