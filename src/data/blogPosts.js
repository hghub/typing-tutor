export const BLOG_POSTS = [
  {
    slug: 'test',
    content: `hello world`,
  },
  {
    slug: 'typing-learning',
    title: 'The Complete Guide to Learning Typing with Typely',
    description: 'Master touch typing from scratch with Typely — covering WPM tests, per-key analysis, finger speed breakdown, slow-key drills, challenge modes, Focus Mode, and every feature built to make you faster.',
    hero: '⌨️',
    category: 'Typing',
    readTime: '16 min read',
    publishDate: '2025-07-10',
    tags: ['typing', 'WPM', 'touch typing', 'keyboard', 'speed', 'accuracy', 'drills', 'finger speed'],
    content: `
<h2>1. What Is Typely — and Why It Exists</h2>
<p>Most typing tools make you type the same preset sentences over and over with no feedback on <em>why</em> you are slow. Typely was built with a different philosophy: measure everything, surface the root cause, and give you a drill that fixes exactly that gap.</p>
<p>Typely is a free, no-signup typing tutor that works in any modern browser. It measures your WPM (words per minute), CPM (characters per minute), and accuracy in real time. After each session it runs a full analysis — showing which individual keys slowed you down, which finger is your bottleneck, and which two-key combos ("digraphs") cause the most hesitation. Then it auto-generates a targeted drill text built around those weak spots.</p>
<p>Alongside that diagnostic engine, Typely offers eight languages, multiple difficulty levels, Kids Mode, Career Readiness passages, 1v1 Battle, Group Challenge, Tournament Mode, an XP levelling system, a personal stats leaderboard, a virtual on-screen keyboard, optional sound effects, Focus Mode, and a sticky restart bar. This guide walks through every feature so you can extract maximum value from every session.</p>

<h2>2. How Typely Works — A Quick Overview</h2>
<p>The workflow is intentionally simple so you can start improving in under sixty seconds:</p>
<ol>
  <li><strong>Pick your language and difficulty</strong> — both controls now sit side-by-side in one compact row directly above the typing area, so you can switch in a single glance without navigating away.</li>
  <li><strong>Start typing</strong> — the moment you press the first key, the timer starts and live WPM and accuracy appear. If you prefer a distraction-free environment, enable 🎯 <strong>Focus Mode</strong> to hide all live metrics until you finish.</li>
  <li><strong>Finish the passage</strong> — a sticky bar slides up from the bottom of the screen showing your final WPM and an <strong>↺ Try Again</strong> button so you never have to scroll to restart.</li>
  <li><strong>Review your analysis</strong> — below the result card, Typely's full diagnostic panel breaks down weak keys, finger speeds, slow digraphs, and fatigue patterns.</li>
  <li><strong>Run a targeted drill</strong> — click <em>Start My Targeted Drill</em> and Typely generates a custom passage that loads extra repetitions of every key or combo that flagged as slow.</li>
</ol>
<p>Three action groups — <strong>⚙️ Settings</strong>, <strong>📊 Progress</strong>, and <strong>⚔️ Compete</strong> — sit below the typing area on desktop, or behind a "More ▾" toggle on mobile, keeping the interface clean without hiding anything.</p>

<h2>3. Your First Test — What to Expect</h2>
<p>Visit Typely and you will see a passage already loaded. Do not think about it — just start typing. The very first session is intentionally diagnostic. It will feel rough if you have not typed in a while, and that is fine. The data from that first attempt is what powers all subsequent improvements.</p>
<p>A typical beginner session produces 30–45 WPM with 75–85 % accuracy. An average office worker sits around 55–65 WPM. Professional typists exceed 90 WPM, and competitive typists push past 120 WPM. None of those numbers matter right now — your only job is to establish a baseline so Typely has something to improve.</p>
<p>After you finish, scroll down past the completion card. You will find the full analysis panel with finger heatmaps, slow-key highlights, and digraph data. Bookmark that view — it is your personalised roadmap.</p>

<h2>4. Understanding WPM — What the Number Really Means</h2>
<p>WPM stands for <em>words per minute</em>, where one "word" is defined as five characters (including spaces). This standard normalisation means a WPM score is comparable across any passage or language — a short word-heavy text and a technical jargon passage both resolve to the same unit.</p>
<p>The CPM figure Typely shows alongside WPM is simply WPM × 5. Some professionals prefer CPM because it more accurately reflects raw keystroke throughput, especially for languages with longer average word lengths like German or Urdu transliteration.</p>
<p>A common misconception is that WPM alone is the goal. It is not. A 90 WPM session with 80 % accuracy produces more errors per document than a 65 WPM session with 97 % accuracy. Typely's completion card always shows both metrics side-by-side and gives you a contextual nudge: if accuracy is below 90 % it suggests focusing on precision first; above 96 % it pushes you to increase speed.</p>

<h2>5. Understanding Accuracy — Why It Matters More Than Speed</h2>
<p>Accuracy is the percentage of correctly typed characters out of all characters attempted. It compounds: at 95 % accuracy you make one mistake every 20 keystrokes. At 90 % accuracy you make one mistake every 10 keystrokes — which means you spend a disproportionate amount of time hitting backspace, which dramatically reduces your real-world effective speed.</p>
<p>The fastest path to higher WPM is almost always to slow down and fix accuracy first. Counter-intuitive? Yes. But the muscle memory you build at 100 % accuracy transfers directly to higher speeds, while the muscle memory built while rushing and correcting errors entrenches bad habits. Typely's targeted drills are designed with this principle in mind — they load your slow and error-prone keys at a high enough frequency that your fingers learn the correct motion before speed is re-introduced.</p>

<h2>6. Difficulty Levels — Choosing the Right Challenge</h2>
<p>Typely offers five core difficulty levels plus two special modes:</p>
<ul>
  <li><strong>Easy</strong> — common English words, short sentences. Ideal for beginners and warm-up sessions.</li>
  <li><strong>Medium</strong> — mixed vocabulary, punctuation included. The sweet spot for most intermediate learners.</li>
  <li><strong>Hard</strong> — technical vocabulary, longer sentences, uncommon letter combinations. Great for pushing ceiling speed.</li>
  <li><strong>Timer (60 s)</strong> — a countdown timer replaces the passage length limit. Type as many words as possible in 60 seconds. Perfect for WPM benchmarking.</li>
  <li><strong>Numbers</strong> — number rows and numpad patterns. Targeted at data-entry roles.</li>
  <li><strong>Symbols</strong> — brackets, slashes, underscores, and punctuation. Essential for programmers.</li>
  <li><strong>Custom</strong> — paste any text you like. Use your actual work documents, code snippets, or scripts for ultra-relevant practice.</li>
</ul>
<p>Language and difficulty are co-located in a single compact row, so switching from "English / Hard" to "Urdu / Easy" takes one click each — no page navigation required.</p>

<h2>7. Language Support — Eight Scripts, One Interface</h2>
<p>Typely supports English, Urdu (phonetic), Arabic, French, Spanish, German, Turkish, and Punjabi. The text direction, font, and input handling all adapt automatically when you switch languages. Urdu uses a phonetic mapping — you type Roman characters on a standard keyboard and Typely renders the corresponding Urdu Unicode in real time, making it accessible without a dedicated Urdu keyboard layout.</p>
<p>Arabic follows the same phonetic principle. French, Spanish, German, and Turkish passages use their native alphabets with diacritics included so you practise the full character set, not a simplified version. Punjabi (Shahmukhi script) is included for learners in Pakistan who use it in professional or academic contexts.</p>
<p>Your language preference is saved to local storage and reloaded on your next visit, so returning users do not need to reconfigure anything.</p>

<h2>8. Kids Mode — Safe and Encouraging for Young Learners</h2>
<p>Toggle <strong>🧒 Kids</strong> in the Settings group and the interface transforms completely. The passage pool switches to age-appropriate vocabulary with short, familiar words. The result card replaces numeric stats with a five-star rating and a colourful "You did it! 🌟" celebration screen. All competitive features (Battle, Leaderboard, Tournament) are hidden so children are not exposed to adult content or pressure.</p>
<p>The star rating maps to accuracy: five stars for ≥ 95 % accuracy, down to one star for anything below 40 %. This teaches children that quality matters more than racing through the passage — a habit that transfers to adult typing practice.</p>

<h2>9. Career Readiness Mode — Vocabulary That Matches Real Work</h2>
<p>Career Readiness passages use professional vocabulary drawn from business communication, HR, finance, legal, and IT domains. Instead of typing "the quick brown fox", you practise "quarterly revenue projections", "non-disclosure agreement", and "pull request review". This means your muscle memory is tuned for the exact words you type most often at work, producing faster effective speeds for real documents even if raw WPM only improves slightly.</p>
<p>Career Readiness is designed for job seekers preparing for typing assessments, executive assistants, customer support agents, and any professional who wants to close the gap between their test speed and their work speed.</p>

<h2>10. Timer Mode — Benchmark Your True WPM</h2>
<p>The 60-second timer mode is the closest Typely gets to the standardised tests used by employers and typing certificate programmes. A countdown replaces the passage end-point, and when time expires the passage freezes mid-sentence and your final WPM is calculated on characters typed up to that point.</p>
<p>Timer mode removes the psychological effect of a "finishing line" that exists in passage mode — you cannot sprint at the end because you do not know where the end is. This produces a more honest measure of sustainable speed. Use it monthly as your primary benchmark, and use passage mode for day-to-day practice and analysis.</p>

<h2>11. Custom Passage Mode — Practice What You Actually Type</h2>
<p>Click the <strong>Custom</strong> difficulty option and a text area appears where you can paste any text. Use a project brief, a legal document, a code file, an email thread — anything that represents your real workload. The analysis engine runs on custom passages just as it does on built-in ones, so you get per-key data for the specific vocabulary of your job.</p>
<p>Tip: paste a 200–300 word excerpt rather than an entire document. Long passages create mental fatigue that skews the fatigue metric and makes each session harder to repeat for comparison.</p>

<h2>12. Virtual Keyboard — See Correct Finger Placement</h2>
<p>Toggle <strong>⌨️ Show Keys</strong> (available on desktop) and a colour-coded keyboard layout appears below the typing area. Each key is highlighted in the colour of the finger that should press it according to the standard touch-typing finger assignment: left pinky handles Q/A/Z, left ring handles W/S/X, and so on across all eight fingers.</p>
<p>As each character in the passage is highlighted, the corresponding key on the virtual keyboard lights up, giving you a visual cue for correct finger positioning without needing to look down at your physical keyboard. This is especially useful in the first few weeks when you are building muscle memory for the home-row position.</p>

<h2>13. Sound Effects — Auditory Feedback Reinforces Rhythm</h2>
<p>Toggle <strong>🔊 Sound</strong> in the Settings group to enable per-keystroke sound effects. The click sound provides immediate auditory confirmation of each keystroke, which has two benefits: it makes errors immediately noticeable (a mis-tap sounds different from a clean hit) and it reinforces rhythm — an even clickety-click cadence correlates strongly with consistent WPM rather than the uneven bursts-and-pauses pattern that limits many intermediate typists.</p>
<p>Sound is particularly helpful when practising in a distraction-free environment where you want to keep your eyes on the screen without relying entirely on visual feedback.</p>

<h2>14. Focus Mode — Type Without Distraction</h2>
<p>Press the small <strong>🎯 Focus mode</strong> toggle above the stats row. From that point on, the WPM and accuracy counters are hidden while you are actively typing. The stats reappear the moment you finish the passage. This prevents the common habit of glancing at the live WPM display mid-session, which breaks your rhythm and creates micro-pauses that inflate your error count.</p>
<p>Focus Mode is particularly valuable once you reach the intermediate plateau (55–70 WPM) where the psychological pressure of watching a stalling WPM counter is often the biggest barrier to improvement. Blind typing — trusting your fingers without constant numeric feedback — is how most typists break through that plateau. Your Focus Mode preference is saved to local storage so it persists across sessions.</p>

<h2>15. XP and Levelling System — Gamified Progress</h2>
<p>Every completed session earns XP based on your WPM, accuracy, and difficulty level. XP accumulates in a progress bar shown at the top of the interface. Reaching thresholds unlocks levels displayed as badges, and a <em>New Personal Best</em> badge appears on the completion card when you exceed your highest recorded WPM. A level-up animation fires when you cross a threshold, giving you a moment of celebration that encourages the next session.</p>
<p>The XP system is intentionally lightweight — it does not gate features or require sign-up. Its only job is to create a small psychological reward loop that makes returning for a second session tomorrow slightly more likely. Compounded over weeks, that is the difference between sporadic and consistent practice.</p>

<h2>16. Personal Stats and Leaderboard</h2>
<p>Click <strong>📊 Stats</strong> in the Progress group to open your personal history panel. It shows your last 50 sessions with WPM, accuracy, language, difficulty, and a sparkline of your trend over time. Clicking any session row drills down into its full analysis data.</p>
<p>Click <strong>🏆 Board</strong> to open the global leaderboard. Scores are anonymous by default — you can set a display name in the identity modal if you want to appear by a handle. The leaderboard is filtered by language and difficulty, so you are compared against peers under the same conditions rather than against a 130 WPM English typist when you are practising Urdu.</p>

<h2>17. Per-Key Analysis — Find Exactly Where You Are Slow</h2>
<p>After every session (except custom and timer modes), Typely runs a per-key timing analysis across every keystroke you made. For each unique character it calculates the average time between the preceding key-up and that key-down — your <em>reaction latency</em> per key. Keys where your latency exceeds 1.6× the session average are flagged as slow and appear in the <strong>🐌 Slowest Keys</strong> panel in red.</p>
<p>This is fundamentally different from a simple error count. A key can be typed correctly but slowly — and slow correct keystrokes reduce your WPM just as much as errors. The per-key view reveals those hidden bottlenecks that an accuracy-only report would miss entirely.</p>

<h2>18. Typing Exercise Analysis — Full Post-Session Breakdown</h2>
<p>Typely's analysis panel goes beyond a single slow-key list. It provides a comprehensive post-session breakdown designed to answer the question: <em>exactly where should I spend my next 20 minutes?</em></p>
<ul>
  <li><strong>WPM trend</strong> — your speed across the session divided into thirds shows whether you start fast and fatigue, start slow and warm up, or maintain consistency throughout. A drop of more than 15 % in the final third triggers the <em>Fatigue Detected</em> alert with advice on shorter burst training.</li>
  <li><strong>Slowest and fastest keys</strong> — every key you typed is ranked by average latency. The fastest keys confirm where your muscle memory is strongest; the slowest keys are your drill targets.</li>
  <li><strong>Slow key combos (digraphs)</strong> — pairs of consecutive keys where the transition is disproportionately slow. Common culprits include in-word sequences that cross hand boundaries, like <code>br</code>, <code>ct</code>, and <code>mn</code>. The digraph panel colour-codes severity: amber for mild, orange for moderate, red for severe.</li>
  <li><strong>Targeted drill generation</strong> — click <em>Start My Targeted Drill</em> and Typely constructs a passage in real time that weights your flagged keys and digraphs at three to four times their natural frequency, so every session does proportionally more work on your actual weaknesses.</li>
  <li><strong>Preset drills</strong> — if no significant weaknesses are found (lucky you), a set of curated drills appears: home row, top row, bottom row, numbers, symbols, and common programming patterns.</li>
</ul>
<p>The analysis runs entirely in-browser with no data sent to a server, so there is no latency and no privacy concern.</p>

<h2>19. Challenge a Friend — No Signup Required</h2>
<p>At the bottom of the completion card you will find the <strong>⚔️ Challenge a Friend</strong> button. Clicking it copies a unique link to your clipboard. That link encodes your passage index, language, difficulty, WPM, and accuracy. When your friend opens the link, Typely loads the exact same passage and, once they finish, displays a side-by-side comparison card showing both scores.</p>
<p>The challenge flow is entirely linkable — no accounts, no room codes, no real-time connection required. Your friend can accept the challenge hours later from a different device or country. The comparison card shows who won, by how many WPM, and includes a <em>Send Result to Challenger</em> button that generates a reply link so the original sender sees the outcome.</p>
<p>This asynchronous design means you can challenge colleagues over chat, family members over WhatsApp, or post a challenge link publicly — anyone who clicks it can compete on exactly your terms. It is the lowest-friction multiplayer experience in any typing tool available today.</p>

<h2>20. 1v1 Battle Mode — Real-Time Head-to-Head</h2>
<p>Click <strong>⚔️ 1v1 Battle</strong> in the Compete group to open a real-time battle. One player creates a room and shares the room ID; the other player enters the same ID to join. Both players type the same passage simultaneously. A live progress bar shows both cursors advancing through the passage, so you can see your opponent's position in real time.</p>
<p>The battle uses WebSocket connections through Supabase Realtime, giving sub-200 ms latency on most connections. When both players finish, the result screen shows the winner, margin of victory in WPM, and each player's accuracy. Rematching is a single click.</p>

<h2>21. Group Challenge and Tournament Mode</h2>
<p>For rooms of three or more, use <strong>👥 Group Challenge</strong> in the Compete group. The room creator sets the passage and difficulty; up to twelve participants join with a room code and type simultaneously. Results are collected in real time and displayed on a live leaderboard that updates as each participant finishes. The room creator can see all submissions and export results — useful for classroom typing competitions or corporate training sessions.</p>
<p>Tournament Mode (<strong>🎯 Tournament</strong>) adds an elimination bracket structure. Participants compete in pairs and the winners advance until a single champion remains. Tournaments are designed for structured events and require a slightly more deliberate setup, but the in-room flow is identical to Group Challenge once started.</p>

<h2>22. Finger Speed Breakdown — Per-Finger WPM</h2>
<p>Typely maps every key on a standard QWERTY keyboard to the finger that should type it according to the standard touch-typing finger assignment. During your session it records the latency per keystroke, then groups those latencies by finger to produce a per-finger average speed grid.</p>
<p>The finger grid shows eight cells — four per hand, from pinky to index — each colour-coded by relative performance:</p>
<ul>
  <li><strong>Green (Fast)</strong> — this finger is performing below 80 % of your session average latency. Strong muscle memory here.</li>
  <li><strong>Cyan (Good)</strong> — within 80–120 % of average. Solid but improvable.</li>
  <li><strong>Amber (Average)</strong> — 120–160 % of average. Worth including in drill sessions.</li>
  <li><strong>Red (Slow)</strong> — above 160 % of average. A significant bottleneck. The cell shows the specific keys assigned to this finger so you know exactly what to drill.</li>
</ul>
<p>Most learners discover their pinky fingers are 25–40 % slower than their index fingers — a gap that remains invisible if you only track overall WPM. The targeted drill generation uses finger data alongside key data, so if your left pinky is the bottleneck, the generated passage will contain a higher proportion of Q, A, Z, and their common neighbours.</p>
<p>The global average latency (ms per key) is shown below the grid as a reference point, so you can track absolute improvement across sessions rather than only relative finger comparisons.</p>

<h2>23. Slow Keys Detection — Targeted Drills on Your Exact Gaps</h2>
<p>The <strong>🐌 Slowest Keys</strong> panel shows every key whose average latency exceeded 1.6× your session average. Each slow key appears as a badge displaying the character and its latency in milliseconds. The thresholds are relative to your own performance — a 200 ms latency on a key is fine if your average is 180 ms, but flagged if your average is 110 ms. This means the detection is meaningful for beginners and experts alike.</p>
<p>The <strong>🔗 Slow Key Combos</strong> panel extends this to consecutive key pairs. Digraph latency is measured as the gap between finishing the first key and starting the second. Slow digraphs often reveal finger transition problems that individual key data misses: the key itself might be fast in isolation but slow when it follows a specific neighbour because the hand has to reposition.</p>
<p>Both panels feed directly into the targeted drill generator. The drill text is synthesised algorithmically — it is not a preset — so it is always tuned to your exact current weaknesses. Repeat the drill two or three times and re-run a standard session; in most cases the flagged keys drop off the slow list within a single practice hour because the repetition is concentrated precisely where it is needed.</p>

<h2>24. Building a Daily Practice Habit — Making Progress Last</h2>
<p>Speed gains from isolated sessions evaporate within days if practice stops. The research on motor skill learning is unambiguous: distributed practice — 20 minutes daily — outperforms massed practice — two hours on Saturday — by a factor of three to four for long-term retention.</p>
<p>A practical daily routine with Typely:</p>
<ol>
  <li><strong>Warm-up (3 min)</strong> — one Easy passage with sound on. Gets fingers warm and establishes a baseline mood for the session.</li>
  <li><strong>Diagnosis (5 min)</strong> — one Medium passage in Focus Mode. Note the flagged slow keys.</li>
  <li><strong>Targeted drill (10 min)</strong> — two or three passes of the auto-generated targeted drill. Slow and accurate, then gradually faster.</li>
  <li><strong>Benchmark (2 min)</strong> — one Timer (60 s) session at your target difficulty to measure the effect.</li>
</ol>
<p>The Typely XP system and personal stats leaderboard are designed to make this loop sustainable — you always have a number going up and a badge approaching. Combined with the social pressure of a pending friend challenge or an active tournament, most users find 20 minutes per day easier to maintain than they expected.</p>
<p>Set a weekly reminder, use the Timer mode result as your weekly KPI, and expect 10–15 WPM improvement within a month of consistent practice. At that rate, an average 50 WPM typist reaches professional 80 WPM in six to eight weeks — which can meaningfully change the pace of every document, email, and code file you produce for the rest of your career.</p>
`,
  },
]