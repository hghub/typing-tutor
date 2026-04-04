# ⌨️ Typing Master

> **A free, multilingual typing tutor — practice in English, Urdu, Arabic, and Persian with real-time multiplayer, gamification, and offline PWA support.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-realtime-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### ⌨️ Core Typing
- 📊 **Live stats** — WPM, CPM, and accuracy tracked character-by-character
- ⏱️ **60-second timer mode** — classic timed test with final score summary
- 📋 **Custom text mode** — paste any passage and practice it
- 🔁 **RTL support** — full right-to-left layout for Urdu, Arabic, and Persian
- 🛡️ **Paste prevention** — anti-cheat: typing input blocks clipboard paste

### 🌍 Languages
- 🇬🇧 English · 🇵🇰 Urdu (اردو) · 🇸🇦 Arabic (العربية) · 🇮🇷 Persian (فارسی)
- 🖮 **Virtual keyboard** — phonetic layout per language, updates live with every keystroke
- 🎨 **Finger colour coding** — each finger group highlighted in a distinct colour

### 📈 Analysis
- 🖐️ **Weak finger detection** — identifies which fingers slow you down most
- 🐢 **Slow key & digraph detection** — pinpoints specific keys and key pairs with high latency
- 😓 **Fatigue analysis** — detects speed drop across the session over time
- 💼 **Career readiness score** — compares your WPM against target speeds for common job roles

### 🎮 Gamification
- ⭐ **XP system** — earn XP per test, level up, maintain daily streaks
- 🏆 **Achievements** — unlock badges for speed milestones, streaks, and accuracy
- 🥇 **Personal best tracking** — per-language, per-difficulty records saved locally
- 🗓️ **Weekly tournament** — compete on a global weekly leaderboard
- 🗺️ **Regional leaderboard** — top scores filtered by region/country

### 🤝 Multiplayer
- ⚔️ **1v1 Live Battle** — real-time race via Supabase Realtime (Presence + Broadcast); join with a 6-character room code; countdown sync; live progress bars; disconnect = win by default
- 👥 **Group Challenge** — async rooms where everyone types the same passage; live leaderboard polling; room creator can end the session early
- 🔗 **Challenge Link** — share a URL encoding your WPM score; a friend opens it and must beat you

### 👶 Kids Mode
- 🐘 Simple word/phrase passages — animals, fruits, colours — in all 4 languages
- 🔠 Large 2 rem font and a rainbow-coloured keyboard
- 🎉 Emoji burst animation on every correct keypress (Web Audio API sound effects)
- ⭐ Star rating on completion (★★★★★ based on accuracy)
- 🚫 Multiplayer and tournament features are hidden in Kids Mode

### 📲 PWA
- 📦 Installable — works like a native app on desktop and mobile
- 🌐 Offline support — Workbox service worker caches the shell and passages
- 🔔 Install banner — appears automatically in Chrome and Edge

### 🔍 SEO
- Full `<meta>` tags, Open Graph, and Twitter Card
- JSON-LD `WebApplication` structured data
- `sitemap.xml` and `robots.txt` in `/public`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Build tool | Vite 8 |
| Backend / Realtime | Supabase (Postgres + Realtime) |
| Styling | Tailwind CSS 4 (utility classes via PostCSS) |
| PWA | `vite-plugin-pwa` + Workbox |
| Deployment | Vercel / Netlify |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A free [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/typing-tutor.git
cd typing-tutor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> **Where to find these:** Supabase Dashboard → Project Settings → API → Project URL & anon public key.

### 4. Run the database migrations

See [Supabase Setup](#-supabase-setup) below.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Full URL of your Supabase project (e.g. `https://abcxyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key — safe to expose in the browser (Row Level Security enforced) |

> ⚠️ Never commit real credentials. Add `.env` to your `.gitignore`.

---

## 🗄️ Supabase Setup

Run the SQL files in the `supabase/` folder against your Supabase project (**SQL Editor → New query**):

| File | Purpose |
|---|---|
| `supabase/rooms.sql` | Creates `rooms` and `room_scores` tables for Group Challenge |
| `supabase/battles.sql` | Creates `battles` table for 1v1 Live Battle |
| `supabase/tournaments.sql` | Creates tournament leaderboard tables |

### Table overview

#### `scores`
Stores individual typing test results.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto-generated |
| `user_id` | text | anonymous identity |
| `wpm` | integer | words per minute |
| `cpm` | integer | characters per minute |
| `accuracy` | numeric | 0–100 |
| `difficulty` | text | easy / medium / hard |
| `language` | text | en / ur / ar / fa |

#### `rooms`
Group Challenge rooms.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | 6-character room code |
| `passage_text` | text | shared passage for all participants |
| `created_by` | text | creator's anonymous identity |
| `expires_at` | timestamptz | auto-cleanup after session |

#### `room_scores`
Scores submitted within a Group Challenge room.

| Column | Type | Notes |
|---|---|---|
| `room_id` | text FK → `rooms.id` | |
| `user_id` | text | participant identity |
| `wpm` | integer | |
| `accuracy` | numeric | |

#### `battles`
1v1 Live Battle rooms.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | 6-character room code |
| `passage_text` | text | same passage for both players |
| `language` | text | language of the passage |
| `difficulty` | text | |
| `created_by` | text | creator's anonymous identity |
| `expires_at` | timestamptz | 10 minutes from creation |

---

## 📁 Project Structure

```
typing-tutor/
├── public/                   # Static assets served as-is
│   ├── icons/                # PWA icons (192×192, 512×512)
│   ├── robots.txt            # Search engine crawl rules
│   └── sitemap.xml           # Sitemap for SEO
├── src/
│   ├── components/           # All UI components (lazy-loaded where possible)
│   │   ├── ActionButtons.jsx         # Restart / share / mode toggle buttons
│   │   ├── AchievementToast.jsx      # Pop-up toast for unlocked achievements
│   │   ├── AnimatedBackground.jsx    # Decorative animated background
│   │   ├── BattleModal.jsx           # 1v1 Live Battle lobby + race UI
│   │   ├── CareerReadiness.jsx       # WPM vs. job-role target comparison
│   │   ├── CompletionCard.jsx        # End-of-test result summary card
│   │   ├── CustomPassagePanel.jsx    # UI to paste and activate custom text
│   │   ├── DifficultySelector.jsx    # Easy / Medium / Hard picker
│   │   ├── EmojiPopup.jsx            # Kids Mode emoji burst animation
│   │   ├── FeedbackModal.jsx         # User feedback / bug report form
│   │   ├── GroupChallengeModal.jsx   # Group Challenge lobby + leaderboard
│   │   ├── Header.jsx                # App header with nav, theme, language
│   │   ├── IdentityModal.jsx         # Anonymous nickname / avatar picker
│   │   ├── InstallBanner.jsx         # PWA install prompt banner
│   │   ├── LearningPanel.jsx         # Typing tips and lesson guidance
│   │   ├── LeaderboardModal.jsx      # Regional / global leaderboard
│   │   ├── LevelUpModal.jsx          # Celebration modal on XP level-up
│   │   ├── PassageDisplay.jsx        # Character-by-character highlighted text
│   │   ├── PrivacyPolicy.jsx         # In-app privacy policy page
│   │   ├── StatsGrid.jsx             # Live WPM / CPM / accuracy grid
│   │   ├── StatsModal.jsx            # Historical stats and personal bests
│   │   ├── TournamentModal.jsx       # Weekly tournament entry + standings
│   │   ├── TypingAnalysis.jsx        # Weak fingers, slow keys, fatigue charts
│   │   ├── TypingInput.jsx           # Hidden textarea capturing all keystrokes
│   │   ├── VirtualKeyboard.jsx       # On-screen keyboard with finger colouring
│   │   └── XPBar.jsx                 # XP progress bar with level badge
│   ├── hooks/                # Custom React hooks
│   │   ├── useTypingTest.js          # Core typing engine (timer, WPM, accuracy)
│   │   ├── useTheme.js               # Dark/light/kids theme state + colours
│   │   ├── useXP.js                  # XP gain, levelling, streak tracking
│   │   ├── useIdentity.js            # Persistent anonymous user identity
│   │   ├── useLeaderboard.js         # Supabase leaderboard fetch + submit
│   │   ├── useKeyboardSound.js       # Web Audio API keypress sounds
│   │   ├── useIsMobile.js            # Responsive breakpoint detection
│   │   └── useFeedback.js            # Feedback form submission logic
│   ├── constants/            # Static data
│   │   ├── passages.js               # Curated passages for all languages/difficulties
│   │   ├── kidsPassages.js           # Simple word lists for Kids Mode
│   │   └── languages.js              # Language metadata (RTL flag, locale, label)
│   ├── utils/                # Utility modules
│   │   ├── supabase.js               # Supabase client initialisation
│   │   ├── typing.js                 # WPM / CPM / accuracy calculation helpers
│   │   ├── scores.js                 # Score persistence (local + Supabase)
│   │   └── kidsSounds.js             # Kids Mode audio synthesis helpers
│   ├── App.jsx               # Root component — layout, routing, modal orchestration
│   └── main.jsx              # Vite entry point, React root render
├── supabase/                 # SQL migration files
│   ├── rooms.sql             # Group Challenge tables
│   ├── battles.sql           # 1v1 Battle table
│   └── tournaments.sql       # Tournament leaderboard tables
├── index.html                # HTML shell with meta/OG/JSON-LD tags
├── vite.config.js            # Vite + PWA plugin configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS pipeline
└── package.json
```

---

## 📲 PWA — Install & Offline

Typing Master is a full Progressive Web App.

### Installing
1. Open the app in **Chrome** or **Edge**
2. An **"Install Typing Master"** banner appears at the bottom of the screen (or use the browser's address-bar install icon)
3. Click **Install** — the app opens in its own window like a native app

### Offline support
The Workbox service worker (generated by `vite-plugin-pwa`) caches:
- The entire app shell (HTML, JS, CSS)
- All passage constants
- PWA icons and static assets

> Internet is only required for leaderboard submissions, multiplayer battles, and tournament entries.

---

## 🚢 Deployment

### Vercel (recommended)

1. Push the repository to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. In **Environment Variables**, add:
   ```
   VITE_SUPABASE_URL      = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key_here
   ```
4. **Build command:** `npm run build`  
   **Output directory:** `dist`
5. Click **Deploy** ✅

### Netlify

1. Push the repository to GitHub
2. New site → Import from Git at [app.netlify.com](https://app.netlify.com)
3. Set the same two environment variables under **Site settings → Environment variables**
4. **Build command:** `npm run build`  
   **Publish directory:** `dist`
5. Add a `_redirects` file to `/public` if you use client-side routing:
   ```
   /*  /index.html  200
   ```

---

## 🎨 Developer Notes — Styling

> All component styling uses **inline `style={{}}` props** — there are no Tailwind `className` attributes in JSX files. Colours and theme tokens are derived from the `useTheme` hook, which returns a `colors` object consumed throughout the component tree. This keeps theming centralised and makes dark/light/kids theme switching instant without CSS class toggling.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`)
2. Make your changes — follow the inline-style convention above
3. Run `npm run build` to verify no build errors
4. Open a pull request with a clear description

Please open an issue first for larger changes so we can discuss the approach.

---

## 📄 License

MIT © Typing Master contributors
