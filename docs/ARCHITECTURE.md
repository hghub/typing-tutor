# Rafiqy — Architecture & Implementation Reference

> **Read this before making any changes.** This document is the single source of truth for how Rafiqy is built.

---

## 1. What Is Rafiqy?

Rafiqy (`rafiqy.app`) is a **privacy-first, browser-only tool platform** with 57 free utilities built for Pakistani users and beyond. Every tool runs 100% in the browser — no data is ever sent to a server (except where explicitly stated, e.g. Supabase leaderboard).

**Stack:** React 18 + Vite + React Router v6 + React Helmet Async + Supabase (leaderboard only) + TailwindCSS (minimal use) + inline styles (primary styling approach)

---

## 2. Project Structure

```
typing-tutor/                    ← Git root (project name is legacy)
├── src/
│   ├── App.jsx                  ← Typely (typing tutor) — standalone, NOT wrapped in ToolLayout
│   ├── main.jsx                 ← ALL routes defined here
│   ├── components/
│   │   ├── ToolLayout.jsx       ← Shared wrapper for all 57 tools (except Typely)
│   │   ├── ToolSEOFooter.jsx    ← Renders heading/paras/faqs from toolSEO.js
│   │   ├── RelatedTools.jsx     ← Shows related tools from registry.js
│   │   ├── ToolsNav.jsx         ← Global sticky nav
│   │   ├── TrustBadge.jsx       ← Privacy/trust footer bar
│   │   └── ...                  ← Tool-specific sub-components
│   ├── pages/
│   │   ├── Landing.jsx          ← Homepage (/)
│   │   ├── ToolsHome.jsx        ← All tools grid (/tools)
│   │   ├── CategoryPage.jsx     ← Category pages (/category/*)
│   │   ├── BlogHome.jsx         ← Blog listing (/blogs)
│   │   ├── BlogPost.jsx         ← Blog reader (/blogs/tools/:slug)
│   │   ├── About.jsx            ← About page (/about)
│   │   ├── Help.jsx             ← Help/FAQ (/help)
│   │   └── [ToolName].jsx       ← Individual tool pages (57 tools)
│   ├── data/
│   │   ├── toolSEO.js           ← SEO content for all 57 tools (metaTitle, metaDesc, heading, paras, faqs)
│   │   └── blogPosts.js         ← All 16 blog posts (slug, title, category, content HTML)
│   ├── tools/
│   │   └── registry.js          ← Single source of truth for all 57 tools
│   ├── hooks/                   ← Custom React hooks
│   ├── constants/               ← Languages, passages, etc.
│   └── utils/                   ← Supabase client, helpers
├── public/
│   ├── sitemap.xml              ← Updated manually on each URL change
│   ├── robots.txt
│   └── BingSiteAuth.xml         ← Bing webmaster verification
├── docs/                        ← You are here
├── vercel.json                  ← SPA fallback (all routes → index.html)
└── vite.config.js
```

---

## 3. Registry — The Single Source of Truth

**File:** `src/tools/registry.js`

Every tool is defined here. The `path` field is used everywhere automatically (ToolLayout canonical, Landing links, RelatedTools, ToolsHome, sitemap).

```js
{
  id: 'word-counter',          // Unique key — used in toolSEO.js, ToolLayout, routes
  name: 'Word Counter',        // Display name
  tagline: 'Count words instantly',
  description: 'Full description...',
  icon: '📝',
  color: '#10b981',            // Accent colour for hover states
  category: 'writing',         // Maps to blog categories + CategoryPage filter
  path: '/word-counter-online-free',  // ← CANONICAL URL — change here, propagates everywhere
  tags: ['word', 'count', ...],
  features: ['Feature 1', ...],
  related: ['text-cleaner', 'doc-composer'],  // Other tool IDs shown in RelatedTools
}
```

**Registry also exports:**
```js
export const CATEGORIES = [
  { id: 'productivity', label: '⚡ Productivity' },
  { id: 'writing',      label: '✍️ Writing Tools' },
  { id: 'security',     label: '🔒 Security & Privacy' },
  // ... all category definitions
]
```

---

## 4. URL Structure

### Priority Tools — Flat SEO URLs (16 tools)
These tools have keyword-rich flat URLs for SEO. Old `/tools/` paths redirect via `<Navigate replace>`.

| Tool | Canonical URL |
|---|---|
| Typely (Typing Tutor) | `/typing-tutor-online-free` |
| Word Counter | `/word-counter-online-free` |
| Pomodoro Timer | `/pomodoro-focus-engine` |
| Loan EMI Calculator | `/loan-emi-calculator` |
| Compress PDF | `/compress-pdf-online-free` |
| Currency Converter | `/currency-converter-live` |
| Salary Slip Generator | `/salary-slip-generator` |
| JSON Formatter | `/json-formatter` |
| Urdu Keyboard | `/urdu-keyboard-online` |
| Daily Planner | `/daily-planner-online` |
| Kameti Tracker | `/kameti-committee-tracker` |
| Measurement Tracker | `/measurement-tracker-online` |
| Expense Analyzer | `/expense-pattern-analyzer` |
| Pakistan Tax Calculator | `/pakistan-tax-calculator` |
| Smart Packing List | `/smart-packing-list` |
| Warranty Tracker | `/warranty-tracker-online` |

### Standard Tools — `/tools/[slug]`
All other 41 tools use `/tools/[name]` URLs.

### Category Pages — `/category/[name]`
| URL | Tool Category Filter |
|---|---|
| `/category/productivity-tools` | `productivity` |
| `/category/finance-tools` | `finance`, `pakistan` |
| `/category/pdf-tools` | `pdf` |
| `/category/developer-tools` | `developer` |
| `/category/pakistan-tools` | `pakistan` |
| `/category/writing-tools` | `writing` |
| `/category/image-tools` | `media` |
| `/category/security-tools` | `security` |

### Special Routes
- `/` → Landing.jsx
- `/tools` → ToolsHome.jsx
- `/blogs` → BlogHome.jsx
- `/blogs/tools/:slug` → BlogPost.jsx
- `/about`, `/help`, `/privacy` → Static pages

---

## 5. SEO System

### Per-Tool SEO
**File:** `src/data/toolSEO.js`

Every tool has an entry keyed by `tool.id`:
```js
'word-counter': {
  metaTitle: 'Free Word Counter Online — Count Words Instantly',  // <60 chars, keyword-first
  metaDesc: '120-155 char benefit-driven description...',
  heading: 'H1 text shown on the tool page',
  paras: ['paragraph 1...', 'paragraph 2...', ...],  // 3-5 paras covering ALL features
  faqs: [
    { q: 'Question?', a: 'Answer.' },  // 5-15 FAQs covering all use cases
  ],
}
```

### ToolLayout Meta Injection
`ToolLayout.jsx` automatically injects from toolSEO.js:
- `<title>` — `seo.metaTitle` (fallback: `tool.name — Free Online Tool | Rafiqy`)
- `<meta description>` — `seo.metaDesc` (fallback: `seo.paras[0].slice(0, 155)`)
- `<link rel="canonical">` — `https://rafiqy.app${tool.path}`
- OG tags (title, description, url, type, site_name)
- Twitter card tags
- JSON-LD `WebApplication` schema
- JSON-LD `FAQPage` schema (auto-generated from `seo.faqs`)

### Homepage SEO (Landing.jsx)
- Helmet with WebSite JSON-LD + SearchAction
- H1: `Free Online Tools — Productivity, Finance & PDF`
- 300-word SEO intro with internal links to priority tools

### Category Page SEO
- Helmet with `CollectionPage` JSON-LD
- H1 from `CATEGORY_DATA[category].title`
- 200-word intro from `CATEGORY_DATA[category].intro`

### Blog SEO (BlogPost.jsx)
- Helmet with `article` OG type
- Canonical: `https://rafiqy.app/blogs/tools/:slug`
- Each blog post should link to 3+ tools with CTA buttons

---

## 6. Blog System

**Data file:** `src/data/blogPosts.js`

Each post:
```js
{
  slug: 'typing-learning',
  title: 'Master Touch Typing in Urdu & English...',
  description: '155-char meta description',
  category: 'education',        // Maps to tool categories for auto-related-posts
  publishDate: '2025-01-25',
  readTime: '7 min read',
  hero: '⌨️',                  // Emoji shown as blog card image
  tags: ['Typing', 'WPM', 'Urdu', 'Education'],
  content: `<div class="blog-content">...</div>`,  // Raw HTML string
}
```

**16 existing blog posts** (as of April 2026):
`pakistan-tools-guide`, `urdu-tools-guide`, `typing-learning`, `productivity-tools`, `writing-tools`, `language-input`, `finance-investing`, `pakistan-category`, `travel-recreation`, `health-wellness`, `developer-tools`, `education-teaching`, `legal-research`, `business-fieldwork`, `security-privacy`, `pdf-tools`

**Blog → Tool linking:** Every tool mentioned in a blog must:
1. Have a hyperlink to its canonical URL (use the new flat URL if available)
2. Have a "Key Features" bullet list
3. Have a CTA button: `<a href="/tool-url" class="blog-cta-btn">Try [Tool Name] Free →</a>`

**Related blog posts on tool pages:** Auto-matched by `post.category === tool.category`. Shown in "Related Guides" section in `ToolLayout.jsx`.

**Related blog posts on category pages:** Auto-matched in `CategoryPage.jsx`.

---

## 7. Typely (Typing Tutor) — Special Case

Typely is **different from all other tools**:
- **File:** `src/App.jsx` (not a page in `src/pages/`)
- **Does NOT use ToolLayout** — has its own full-page layout
- **Has its own Helmet** — manually maintained in App.jsx
- **Canonical URL:** `https://rafiqy.app/typing-tutor-online-free`
- **Route:** `/typing-tutor-online-free` → `<App />`
- **Old route:** `/tools/typely` → Navigate redirect
- **Also:** `/tools/typing-tutor` → Navigate redirect (legacy)

**Typely Features (all 24+ must be in SEO content):**
1. WPM + CPM + accuracy measurement
2. Multiple difficulty levels (beginner, easy, medium, hard, code, custom)
3. 8 languages: English, Urdu, Arabic, Persian, French, Spanish, German, Portuguese
4. **Phonetic input** — type Urdu/Arabic/Persian in Latin letters, auto-converts
5. **Kids Mode** — simple words, emoji reactions, sound effects
6. **XP & Level system** — earn XP per session, level up, maintain streaks
7. **Goals system** — set a goal (exam prep, job, speed, accuracy)
8. **Typing Analysis** — per-key accuracy breakdown, slowest keys, error patterns
9. **Career Readiness** — compares your WPM against job requirements
10. **Targeted drills** — practice your specific weak keys
11. **1v1 Battle** — real-time typing race via Supabase
12. **Group Challenge rooms** — create a room code, compete as a group
13. **Tournament mode** — organised competitions
14. **Challenge link** — encode your score and send a personalised challenge URL
15. **Custom passage** — paste your own text to practice
16. **Timer mode** — 60-second timed test
17. **Stats history** — view all past sessions, track improvement
18. **Virtual keyboard** — on-screen keyboard display
19. **Sound effects** — keyboard click sounds (toggle on/off)
20. **Learning Panel** — structured lesson content
21. **Leaderboard** — global rankings (Supabase)
22. **Dark/light mode**
23. **Works offline** after first load
24. **Privacy** — all data in localStorage, nothing sent to server (except leaderboard opt-in)

---

## 8. Supabase Usage

Supabase is used **only** for:
- Typing tutor **leaderboard** (opt-in, user creates a nickname)
- Typing tutor **1v1 battle** (real-time via Supabase Realtime)
- Typing tutor **group challenge rooms**
- **Feedback** submissions

Everything else is `localStorage`. No auth, no user accounts.

**Client:** `src/utils/supabase.js`

---

## 9. Theme System

**Hook:** `src/hooks/useTheme.js`

Returns `{ isDark, toggleTheme, colors }`.

`colors` object keys: `bg`, `surface`, `card`, `border`, `text`, `textSecondary`, `muted`, `cardBg`

**Convention:** Always use `colors.X` for themed values. Never hardcode `#fff` or `#000`. Primary accent is `#06b6d4` (cyan-500) — safe to hardcode for accent elements.

---

## 10. Sitemap

**File:** `public/sitemap.xml`

**Must be updated manually** whenever:
- A new tool is added
- A URL is changed (add new URL, old stays for 6 months then remove)
- A new category page is added
- A new blog post is added

Priority guidelines:
- Homepage: 1.0
- Priority tools (flat URLs): 0.9
- Standard tools: 0.7
- Category pages: 0.6
- Blog posts: 0.6
- Static pages: 0.5
