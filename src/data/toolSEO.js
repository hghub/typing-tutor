// src/data/toolSEO.js
// Central SEO data for all 54 Rafiqy tools.
// Used by ToolLayout to auto-inject descriptions + FAQ sections.

const TOOL_SEO = {
  'typing-tutor': {
    metaTitle: 'Free Typing Tutor Online — Improve WPM | Rafiqy',
    metaDesc: 'Free online typing test and tutor. Improve your WPM with targeted drills, accuracy tracking, and Urdu support. No sign-up required.',
    heading: 'Free Typing Speed Test & Tutor — Improve Your WPM Online',
    paras: [
      'Typely is a free online typing tutor and speed test that helps you measure and improve your typing speed in words per minute (WPM). Whether you\'re a complete beginner or an experienced typist looking to push past 80 WPM, Typely adapts to your skill level and tracks your progress over time.',
      'Unlike other typing tests that just show your speed, Typely provides a full training environment: targeted drills for problem keys, customizable difficulty levels, accuracy tracking, and a leaderboard to compete with others. Practice with real English passages, code snippets, and even Urdu text.',
      'The average person types at 40 WPM. Touch typists average 60–70 WPM. Professional typists reach 80–100 WPM. Top competitive typists exceed 120 WPM. With consistent daily practice using Typely, most users see measurable improvement within 2–3 weeks.',
      'Typely runs entirely in your browser — no download, no account, no subscription. Your typing history is saved locally so you can track your progress without ever signing up. Works on desktop and tablet with a physical keyboard.',
    ],
    faqs: [
      { q: 'What is a good typing speed in WPM?', a: 'The average is 40 WPM. Above 60 WPM is proficient. 80+ WPM is excellent. Professional typists typically reach 75–100 WPM. Speed above 120 WPM is elite-level.' },
      { q: 'How long does it take to improve typing speed?', a: 'With 20–30 minutes of daily practice, most people improve by 10–15 WPM within 2–3 weeks. Touch typing — not looking at the keyboard — is the key technique to develop first.' },
      { q: 'Does this work for beginners?', a: 'Yes. Typely includes beginner modes with simpler words, slower pacing, and key-by-key guidance. Start with the Beginner lesson and work your way up.' },
      { q: 'Can I practice Urdu typing?', a: 'Yes. Typely includes Urdu text passages and Urdu keyboard layout support. Switch to Urdu mode in the settings to practice Roman Urdu or native Urdu script.' },
      { q: 'Is my typing data private?', a: 'Yes. All data is stored only in your browser\'s localStorage. Nothing is sent to any server. Your typing history, scores, and progress stay on your device only.' },
    ],
  },

  'pomodoro': {
    metaTitle: 'Free Pomodoro Timer Online — Focus Engine | Rafiqy',
    metaDesc: 'Stay focused with our free Pomodoro timer. Track sessions, set daily targets and beat distraction. Works offline. No account needed.',
    heading: 'Free Pomodoro Timer — Focus Engine for Deep Work',
    paras: [
      'The Pomodoro Technique is one of the most effective time management methods in the world. Work for 25 minutes, take a 5-minute break, and repeat. After 4 cycles, take a longer 15–30 minute break. Rafiqy\'s Pomodoro Focus Engine brings this technique to your browser with zero setup.',
      'Unlike basic countdown timers, this tool tracks your full session: how many pomodoros you complete per day, which tasks you worked on, and your focus streaks over time. Set daily targets and watch your productivity compound.',
      'The timer works fully offline in your browser. No ads, no premium tier, no account required. Session data is saved locally so your history persists across browser restarts. Works best with a physical keyboard shortcut to start/stop.',
    ],
    faqs: [
      { q: 'What is the Pomodoro Technique?', a: 'A time management method by Francesco Cirillo: work for 25 minutes (one "pomodoro"), take a 5-minute break, repeat 4 times, then take a 15–30 minute long break. It trains focused attention and prevents burnout.' },
      { q: 'Can I customise the timer durations?', a: 'Yes. You can adjust the work interval, short break, and long break durations to suit your workflow. Some people prefer 50/10 or 90/20 for deeper work sessions.' },
      { q: 'Does it work without internet?', a: 'Yes. The Pomodoro timer is fully browser-based and works offline after the first load. No internet connection required during your focus sessions.' },
      { q: 'Does the timer make a sound?', a: 'Yes. An audio alert plays when a session ends. You can mute it in settings if you prefer a silent notification or use it alongside a visual alert.' },
      { q: 'Is my session data saved?', a: 'Yes. All session history is stored in your browser\'s localStorage. It persists across browser restarts. Use the export option to back up your productivity data.' },
    ],
  },

  'word-counter': {
    metaTitle: 'Free Word Counter Online — Count Words Instantly',
    metaDesc: 'Instantly count words, characters, sentences and reading time. Supports Urdu, Arabic and all Unicode. 100% private, runs in your browser.',
    heading: 'Free Online Word Counter & Character Counter Tool',
    paras: [
      'Whether you\'re writing an essay, crafting a tweet, or preparing a professional report, knowing your exact word count matters. Rafiqy\'s Word Counter instantly counts words, characters (with and without spaces), sentences, paragraphs, and estimates reading time — all without any server upload.',
      'Unlike other word count tools that require you to paste text and hit submit, this tool updates in real-time as you type or paste. It works with English, Urdu, Arabic, and any Unicode language — ideal for multilingual writers and students.',
      'The tool also identifies the most frequently used words in your text, helping you spot repetition or check keyword density for SEO. Everything runs in your browser — your content is never sent to any server, making it 100% private.',
    ],
    faqs: [
      { q: 'How do I count words in a document?', a: 'Paste or type your text into the area above. Word count, character count, sentence count, and reading time update instantly. No buttons to press.' },
      { q: 'Does this work with Urdu and Arabic text?', a: 'Yes. The tool supports all Unicode languages including Urdu, Arabic, Chinese, and more.' },
      { q: 'Is there a word limit?', a: 'There is no hard limit. The tool handles essays, blog posts, and long documents. Very long texts (50,000+ words) may slow slightly on older devices.' },
      { q: 'What counts as a word?', a: 'Words are sequences of non-whitespace characters separated by spaces. Numbers, hyphenated words, and contractions each count as one word.' },
      { q: 'Is my text saved or sent anywhere?', a: 'No. All processing happens in your browser. Your text is never uploaded, stored, or transmitted.' },
    ],
  },

  'text-cleaner': {
    metaTitle: 'Free Text Formatter & Cleaner Online | Rafiqy',
    metaDesc: 'Clean and format text instantly — remove extra spaces, fix capitalization, strip HTML. Supports Urdu. 100% browser-based, no uploads.',
    heading: 'Free Text Formatter & Cleaner — Fix Spacing, Case & Special Characters',
    paras: [
      'Rafiqy\'s Text Formatter is the fastest way to clean up messy text. Remove extra spaces, fix line breaks, convert case, strip special characters, or normalize Unicode — all in one click, entirely in your browser.',
      'Whether you\'re cleaning pasted text from a PDF, fixing capitalization in a dataset, or stripping invisible characters from a CSV, this tool handles it without any server upload. Your text never leaves your device.',
      'Common use cases include: removing double spaces, converting ALL CAPS to title case, stripping HTML tags from text, normalizing Urdu text encoding, and cleaning data before import into Excel or a database.',
    ],
    faqs: [
      { q: 'What can this text cleaner do?', a: 'It removes extra spaces and blank lines, converts text case (upper/lower/title/sentence), strips special characters, removes HTML tags, and normalizes Unicode. All transformations happen instantly.' },
      { q: 'Does it support Urdu text?', a: 'Yes. The tool supports Unicode text including Urdu, Arabic, and other right-to-left scripts. Use it to normalize Urdu text encoding or strip unwanted characters.' },
      { q: 'Is there a character limit?', a: 'No hard limit. The tool handles large blocks of text efficiently. Processing happens entirely in your browser.' },
      { q: 'Can I undo a transformation?', a: 'Yes. Your original text remains in the input field. You can revert by clearing the output or applying a different transformation.' },
      { q: 'Is my text uploaded anywhere?', a: 'No. All transformations happen locally in your browser. Your data is never sent to any server.' },
    ],
  },

  'doc-composer': {
    metaTitle: 'Free Document Composer Online — Write & Export | Rafiqy',
    metaDesc: 'Write and export documents to PDF, DOCX or plain text. Supports Urdu and RTL. No account, no subscription. Runs in your browser.',
    heading: 'Free Document Composer — Write & Export Documents Online',
    paras: [
      'Rafiqy\'s Doc Composer is a clean, distraction-free document editor that lets you write, format, and export documents directly from your browser. No Word installation needed, no subscription — just write and download.',
      'Export your documents as PDF, DOCX, or plain text. The editor supports rich formatting: headings, bold, italic, lists, and tables. Everything is processed locally — your documents never touch a cloud server.',
      'Ideal for quick letters, reports, meeting notes, or any document you need to write fast without opening a heavy word processor. Works on any device with a modern browser.',
    ],
    faqs: [
      { q: 'What formats can I export to?', a: 'You can export as PDF, DOCX (Word), or plain text (.txt). Choose the format that suits your use case — PDF for sharing, DOCX for further editing.' },
      { q: 'Does it support Urdu and RTL text?', a: 'Yes. The editor supports right-to-left text including Urdu and Arabic. You can mix LTR and RTL text in the same document.' },
      { q: 'Are my documents saved?', a: 'Documents are auto-saved to your browser\'s localStorage as you type. They persist between sessions. Use the export option to save a permanent copy.' },
      { q: 'Can I open an existing Word document?', a: 'You can paste content from an existing document into the editor. For full import support, use the Doc Converter tool.' },
      { q: 'Is this tool free?', a: 'Yes. Completely free with no account required, no watermarks, and no page limits.' },
    ],
  },

  'urdu-keyboard': {
    metaTitle: 'Free Urdu Keyboard Online — Type Urdu Phonetically',
    metaDesc: 'Type Urdu using English phonetics on any device. No special keyboard needed. Copy and paste anywhere. Free and private.',
    heading: 'Free Online Urdu Keyboard — Type Urdu Without Installing Software',
    paras: [
      'Rafiqy\'s Urdu Keyboard lets you type in Urdu on any device without installing any software or keyboard layout. Works on Windows, Mac, Android, and iOS — just open the browser and start typing in Urdu script.',
      'The keyboard supports both Phonetic Urdu (type "aap" to get آپ) and the standard Urdu keyboard layout. It includes a full on-screen keyboard for reference. Copy your Urdu text to paste into WhatsApp, email, Word, or any other app.',
      'This tool is particularly useful for Pakistanis using a device without Urdu keyboard support, students writing in Urdu, or anyone who needs to type occasional Urdu text without switching system keyboard settings.',
    ],
    faqs: [
      { q: 'How do I type Urdu without a physical Urdu keyboard?', a: 'Use the phonetic mode: type Roman Urdu (e.g. "pakistan" → "پاکستان") and the tool converts it automatically. Alternatively, click the on-screen Urdu keyboard keys.' },
      { q: 'Can I type Urdu on a mobile phone?', a: 'Yes. The on-screen keyboard works on touchscreen devices. Tap the letters on the virtual keyboard to compose Urdu text.' },
      { q: 'What keyboard layout does this use?', a: 'It supports both Phonetic Urdu (based on English pronunciation) and the standard NLA (National Language Authority) Urdu keyboard layout. Switch between them in settings.' },
      { q: 'How do I use the Urdu text I type?', a: 'Click "Copy" to copy your text to clipboard, then paste it anywhere — WhatsApp, email, Word, or social media.' },
      { q: 'Does this support Urdu numerals?', a: 'Yes. You can type both Arabic-Indic numerals (۱۲۳) and Western numerals. Toggle the numeral style in the keyboard settings.' },
    ],
  },

  'tax-calculator': {
    metaTitle: 'Pakistan Income Tax Calculator 2025-26 | Rafiqy',
    metaDesc: 'Calculate Pakistan income tax for FY 2025-26 using latest FBR slabs. Covers VPS, Zakat and senior rebate. Free, private, no sign-up.',
    heading: 'Pakistan Income Tax Calculator — FBR Slab Rates 2025-26',
    paras: [
      'Calculate your Pakistan income tax accurately for Tax Year 2026 (Financial Year 2025-26) using the latest FBR slab rates from the Finance Act 2025. This tool covers salaried individuals, business individuals, and includes all major deductions and rebates.',
      'The calculator uses official FBR tax slabs: 0% for income up to Rs 600,000; 1% on Rs 600,001–1,200,000; 11% on Rs 1,200,001–2,200,000; 23% on Rs 2,200,001–3,200,000; 30% on Rs 3,200,001–4,100,000; and 35% above Rs 4,100,000.',
      'Beyond basic slabs, the tool supports a surcharge of 10% on tax exceeding Rs 1,500,000, VPS deductions, Zakat/charitable donations, and the senior citizen (60+) rebate. Your data stays on your device — nothing is sent to FBR or any server.',
    ],
    faqs: [
      { q: 'Which tax year does this calculator cover?', a: 'Tax Year 2026 — income earned from July 1, 2025 to June 30, 2026 (FY 2025-26). Slab rates are from the Finance Act 2025.' },
      { q: 'What is the current tax-free income limit in Pakistan?', a: 'For Tax Year 2026, income up to Rs 600,000 per year is tax-free (0% slab) for salaried individuals.' },
      { q: 'Can I use this for business income?', a: 'Yes. The tool covers both salaried and business individuals. Select the appropriate income type at the top of the calculator.' },
      { q: 'What is the surcharge and who pays it?', a: 'A 10% surcharge applies when total tax liability exceeds Rs 1,500,000. Applied on the portion of tax above that threshold, not on income itself.' },
      { q: 'Is this tool approved by FBR?', a: 'This is an unofficial estimation tool for planning purposes. Always verify your final return on the official IRIS portal at iris.fbr.gov.pk.' },
    ],
  },

  'loan-emi': {
    metaTitle: 'Free Loan EMI Calculator — Monthly Payments | Rafiqy',
    metaDesc: 'Calculate your monthly EMI for any loan. Enter principal, rate and tenure to get instant results. Free, fast and private.',
    heading: 'Free Loan EMI Calculator — Monthly Instalment Planner',
    paras: [
      'Planning to buy a house, car, or take a personal loan? Use Rafiqy\'s Loan EMI Calculator to instantly calculate your monthly instalment (EMI), total payment, and total interest payable — all in your browser, with zero data uploaded.',
      'Our calculator uses the standard reducing-balance (diminishing balance) method — the same formula used by Pakistani banks including HBL, UBL, MCB, and others. Enter principal amount, annual interest rate, and tenure to see full results.',
      'The tool shows your monthly EMI, a complete amortisation schedule (month-by-month breakdown of principal vs interest), and the total cost of the loan. Compare different interest rates and tenures to find the most affordable option.',
    ],
    faqs: [
      { q: 'What is EMI?', a: 'EMI (Equated Monthly Instalment) is the fixed monthly payment to repay a loan. It includes both principal repayment and interest, split into equal monthly amounts over the loan tenure.' },
      { q: 'Which EMI formula does this use?', a: 'The standard reducing-balance method: EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months.' },
      { q: 'Can I calculate Pakistani bank loan EMI?', a: 'Yes. Enter the loan amount in PKR, the bank\'s annual interest rate, and tenure. Works for any Pakistani bank or currency.' },
      { q: 'Is a longer tenure better?', a: 'A longer tenure reduces monthly EMI but significantly increases total interest. Compare options in the calculator to find the right balance.' },
      { q: 'Is my data private?', a: 'Yes. All calculations happen in your browser. No loan or personal data is ever sent to any server.' },
    ],
  },

  'salary-slip': {
    metaTitle: 'Free Salary Slip Generator Online | Rafiqy',
    metaDesc: 'Generate professional salary slips with FBR tax and EOBI deductions. Print or save as PDF. 100% private, browser-based. No sign-up.',
    heading: 'Free Salary Slip Generator Pakistan — Professional Payslip Maker',
    paras: [
      'Create professional salary slips in minutes with Rafiqy\'s Salary Slip Generator. Enter employee details, basic salary, and deductions — the tool generates a formatted, printable salary slip following Pakistani payroll conventions.',
      'The generator automatically calculates provident fund (PF), EOBI, income tax deductions, and net take-home pay. Export as PDF or print directly. No account, no subscription, no data uploaded — everything runs in your browser.',
      'Ideal for small business owners, HR departments, freelancers, and contractors who need to issue payslips without expensive payroll software. Supports PKR formatting and Pakistani company details.',
    ],
    faqs: [
      { q: 'What deductions are calculated automatically?', a: 'The generator calculates Provident Fund (PF at 8.33% of basic), EOBI contribution, income tax based on current FBR slabs, and any custom deductions you add.' },
      { q: 'Can I save or reuse employee templates?', a: 'Yes. Employee profiles are saved in your browser\'s localStorage. Load a saved profile to generate next month\'s payslip in seconds.' },
      { q: 'What format can I export the salary slip in?', a: 'Export as PDF (for email/printing) or download as an image. The output follows a professional Pakistani payslip format.' },
      { q: 'Is this compliant with Pakistani labour law?', a: 'The calculations follow standard Pakistani payroll conventions and current FBR tax rates. Always verify with a qualified HR or tax professional for compliance.' },
      { q: 'Is employee data stored on a server?', a: 'No. All employee data is stored only in your browser\'s localStorage. Nothing is uploaded or transmitted.' },
    ],
  },

  'world-time': {
    metaTitle: 'Free World Time Converter — Compare Timezones | Rafiqy',
    metaDesc: 'Compare time zones worldwide and find perfect meeting windows. Includes PKT, Dubai, London and more. Free, accurate and private.',
    heading: 'World Time Converter — Compare Timezones Instantly',
    paras: [
      'Coordinating across timezones is one of the biggest challenges for remote teams, freelancers, and anyone working internationally. Rafiqy\'s World Time Converter lets you compare multiple timezones simultaneously and find the perfect overlap for meetings.',
      'Select any cities around the world and see their current local times side-by-side. Drag the time slider to find a meeting window that works for everyone. Includes all major Pakistani cities and cities with large Pakistani diaspora communities.',
      'The tool works entirely in your browser using the standard Intl API — accurate timezone data with automatic daylight saving time adjustments. No account, no data collection.',
    ],
    faqs: [
      { q: 'How do I find a good meeting time across timezones?', a: 'Add all participants\' cities, then drag the time slider to find a window where everyone is within working hours (typically 9am–6pm). The tool highlights overlapping business hours.' },
      { q: 'Does it handle daylight saving time automatically?', a: 'Yes. The tool uses the browser\'s Intl API which automatically applies correct DST offsets for each timezone, including countries that observe DST.' },
      { q: 'Is Pakistan time (PKT) included?', a: 'Yes. Pakistan Standard Time (UTC+5) is included. Common cities for Pakistani diaspora — Dubai, London, Toronto, New York — are also available.' },
      { q: 'Can I share my timezone comparison with others?', a: 'Use the copy/export feature to share a summary of the selected cities and times. Useful for scheduling emails or calendar invites.' },
      { q: 'How accurate is the time shown?', a: 'The time is based on your device\'s clock and the browser\'s timezone database. It updates in real time and is accurate to the second.' },
    ],
  },

  'voice-diary': {
    metaTitle: 'Free Voice Diary Online — Private Journal | Rafiqy',
    metaDesc: 'Record voice entries that are transcribed and stored privately in your browser. Supports Urdu and English. No cloud, no account needed.',
    heading: 'Voice Diary — Private Voice Journal That Lives on Your Device',
    paras: [
      'Record your thoughts, ideas, and daily reflections with your voice — Rafiqy\'s Voice Diary transcribes your speech and stores your entries privately in your browser. No cloud backup, no app installation, no subscription.',
      'Unlike voice journal apps that upload recordings to servers, this tool uses your device\'s built-in speech recognition API. Your voice never leaves your device. Entries are stored as text in your browser\'s localStorage.',
      'Browse past entries by date, search by keyword, and export your journal as a text file. Ideal for daily journaling, capturing ideas on the go, or keeping a personal log without privacy concerns.',
    ],
    faqs: [
      { q: 'Is my voice recorded and stored?', a: 'Your voice is processed by your device\'s built-in speech recognition (not a cloud server in most cases). The resulting text is stored in your browser\'s localStorage only.' },
      { q: 'What languages does voice recognition support?', a: 'The tool uses your browser\'s Web Speech API, which supports Urdu, English, Arabic, and many other languages depending on your browser and OS language settings.' },
      { q: 'Can I edit voice entries after recording?', a: 'Yes. After transcription, you can edit the text directly before saving. This is useful to fix any recognition errors.' },
      { q: 'What happens if I clear my browser data?', a: 'All diary entries stored in localStorage will be deleted. Use the export feature regularly to save a backup copy of your journal as a text file.' },
      { q: 'Does this work on mobile?', a: 'Yes. Voice recording and speech recognition work on modern mobile browsers. Tap the microphone button to start recording.' },
    ],
  },

  'kameti': {
    metaTitle: 'Free Kameti Tracker Online — Manage Committees | Rafiqy',
    metaDesc: 'Track Kameti (committee/ROSCA) rotations, contributions and payouts digitally. All data stored locally. Free, private, no sign-up.',
    heading: 'Kameti Tracker — Manage Rotating Savings Circles Online',
    paras: [
      'Kameti (also called committee, chit fund, or ROSCA) is a traditional Pakistani savings system where a group of people contribute a fixed amount regularly and each member takes turns collecting the pot. Rafiqy\'s Kameti Tracker helps you manage your rotating savings group digitally.',
      'Track all members, monthly contributions, payout rotation, and payment status. The tool calculates who has paid, who is owed the next payout, and how much is collected each cycle. Perfect for family committees, office committees, or any ROSCA group.',
      'All data is stored locally in your browser — no need to share financial data with any app or cloud service. Export a summary to share with your group via WhatsApp or email.',
    ],
    faqs: [
      { q: 'What is a kameti?', a: 'Kameti (committee) is a rotating savings and credit association (ROSCA). A group of trusted people each contribute a fixed amount monthly. Each month, one member takes the entire pot. It\'s a common savings practice in Pakistan.' },
      { q: 'How many members can I add?', a: 'There is no fixed limit. You can manage committees with any number of members. Larger groups (20+) are well supported.' },
      { q: 'Can I track multiple committees at once?', a: 'Yes. The tool supports multiple active committees. Switch between them from the main screen.' },
      { q: 'How is the payout order determined?', a: 'You set the payout order when creating the committee. It can be sequential (as joined) or by lot (random). You can also manually reorder members.' },
      { q: 'Is my committee data shared with anyone?', a: 'No. All data is stored only in your browser\'s localStorage. Use the export feature to share a summary with your group if needed.' },
    ],
  },

  'daily-planner': {
    metaTitle: 'Free Daily Planner Online — Plan Your Day | Rafiqy',
    metaDesc: 'Organize your day with tasks and time blocks in under 2 minutes. Rolls over incomplete tasks. Free, offline, no account needed.',
    heading: 'Free Daily Planner — Organize Your Day Without an App',
    paras: [
      'Rafiqy\'s Daily Planner is a simple, fast task planner that helps you structure your day in under 2 minutes. Add tasks, assign time blocks, set priorities, and check them off as you go — all in your browser without any account.',
      'Unlike heavy project management tools, this planner is designed for individuals who want a clean daily to-do list. It focuses on today. No complex features, no friction — just a clear view of what you need to do and when.',
      'Your planner data is saved locally in your browser. It persists between sessions and rolls forward what wasn\'t completed. Works offline, no subscription, no ads.',
    ],
    faqs: [
      { q: 'Does the daily planner carry forward incomplete tasks?', a: 'Yes. Tasks marked as incomplete at end of day are automatically moved to the next day\'s list so nothing falls through the cracks.' },
      { q: 'Can I set recurring tasks?', a: 'Yes. Mark any task as recurring (daily, weekly) and it will appear automatically on future days without re-entry.' },
      { q: 'Is there a mobile app?', a: 'No app needed. The planner is a web tool that works on any browser including mobile. Bookmark it for quick daily access.' },
      { q: 'Can I share my plan with others?', a: 'Use the export/print option to share your daily plan. The tool is currently designed for individual use.' },
      { q: 'Is my planner data backed up?', a: 'Data is stored in your browser\'s localStorage. Use the export feature to save a backup. Note: clearing browser data will erase your plans.' },
    ],
  },

  'habit-tracker': {
    metaTitle: 'Free Habit Tracker Online — Build Streaks | Rafiqy',
    metaDesc: 'Track daily habits, build streaks and view heatmaps. Supports up to 20 habits. 100% private, browser-based. No sign-up required.',
    heading: 'Free Habit Tracker — Build Streaks & Track Daily Habits',
    paras: [
      'Building habits is the foundation of long-term success. Rafiqy\'s Habit Tracker helps you define your habits, mark daily completions, and visualize your streaks over time. The classic "don\'t break the chain" method, built into your browser.',
      'Add up to 20 habits, track them daily, and view weekly/monthly heatmaps to see patterns in your consistency. The tool also shows your longest streak for each habit — a powerful motivator to keep going.',
      'Data is stored locally in your browser — private and always accessible without an account. Works offline after first load.',
    ],
    faqs: [
      { q: 'How do I build a new habit with this tracker?', a: 'Add the habit, mark it every day you complete it, and watch your streak grow. Research shows 66 days of consistency helps form a lasting habit. The tracker makes your streak visible and motivating.' },
      { q: 'Can I track negative habits (habits to break)?', a: 'Yes. Add a "break" habit (e.g. "No social media before 10am") and mark the days you successfully avoided it.' },
      { q: 'What is the maximum number of habits I can track?', a: 'The tool supports up to 20 habits simultaneously. Focus on 3–5 habits at a time for best results — too many habits at once lowers completion rates.' },
      { q: 'What happens if I miss a day?', a: 'Your streak resets to 0 for that habit, but all previous history is preserved. You can see your best streak and restart.' },
      { q: 'Is my habit data private?', a: 'Yes. All habit data is stored only in your browser\'s localStorage. Nothing is sent to any server.' },
    ],
  },

  'color-palette': {
    metaTitle: 'Free Color Palette Generator Online | Rafiqy',
    metaDesc: 'Generate complementary, analogous and triadic color palettes. Export as CSS variables or image. Free, instant, no sign-up required.',
    heading: 'Free Color Palette Generator — Create & Export Color Schemes',
    paras: [
      'Rafiqy\'s Color Palette Generator helps designers, developers, and creatives build harmonious color schemes instantly. Generate complementary, analogous, triadic, or monochromatic palettes from any seed color — with hex, RGB, and HSL values.',
      'Pick a color, choose a harmony rule, and the tool generates a full 5-color palette. Copy hex codes directly, export as CSS variables, or download as an image. Perfect for web design, branding, presentations, or app UI development.',
      'All processing is done in the browser. No account required, no watermarks, and the tool is completely free for personal and commercial use.',
    ],
    faqs: [
      { q: 'What color harmony types are supported?', a: 'Complementary (opposite colors), analogous (adjacent colors), triadic (three equidistant colors), split-complementary, and monochromatic (shades of one hue).' },
      { q: 'Can I export the palette as CSS variables?', a: 'Yes. Click "Export CSS" to get ready-to-use CSS custom properties (--color-primary, --color-secondary, etc.) that you can paste directly into your stylesheet.' },
      { q: 'How do I check contrast ratios for accessibility?', a: 'The tool shows WCAG contrast ratios between each color pair. Aim for 4.5:1 for normal text and 3:1 for large text to meet WCAG AA standards.' },
      { q: 'Can I input a hex code directly?', a: 'Yes. Type any hex code (#RRGGBB), RGB value, or HSL value into the color picker to use it as the base for your palette.' },
      { q: 'Is the generated palette saved?', a: 'Your current palette is saved in the browser session. Use the export or copy feature to save it permanently.' },
    ],
  },

  'pk-id-tax-hub': {
    metaTitle: 'Pakistan ID & Tax Hub — CNIC Decoder Online | Rafiqy',
    metaDesc: 'Decode Pakistan CNIC, look up NTN info, check filer status and understand tax obligations. Free, browser-based and fully private.',
    heading: 'Pakistan ID & Tax Hub — CNIC Decoder, NTN Lookup & Tax Info',
    paras: [
      'Pakistan\'s ID & Tax Hub consolidates multiple Pakistan-specific identity and tax tools in one place. Decode your CNIC to get birth year, gender, and home province. Look up NTN details, check tax filer status, and understand your withholding tax obligations.',
      'The CNIC decoder analyzes the 13-digit National Identity Card number format used by NADRA. It extracts the province code, district code, birth year, and gender without contacting any government server — all logic runs locally.',
      'This tool is for informational purposes. For official CNIC or NTN verification, use NADRA\'s official portals or FBR\'s IRIS system.',
    ],
    faqs: [
      { q: 'What information is encoded in a Pakistani CNIC?', a: 'A CNIC encodes: province code (first digit), district code (digits 2-5), family/serial number (digits 6-12), and gender (last digit — 1/3/5/7/9 for male, 0/2/4/6/8 for female).' },
      { q: 'Can I look up someone else\'s CNIC details?', a: 'The tool decodes publicly known structural information (province, gender) from the CNIC number format. It does not access NADRA databases or reveal personal information.' },
      { q: 'What is NTN in Pakistan?', a: 'NTN (National Tax Number) is a unique identifier issued by FBR to taxpayers in Pakistan. Individuals, companies, and AOP entities all have NTNs for filing tax returns.' },
      { q: 'How do I check if I am on the Active Taxpayers List?', a: 'Visit fbr.gov.pk and use the ATL (Active Taxpayers List) search, or check through the FBR\'s official Maloomat portal. This tool provides guidance on the process.' },
      { q: 'Is my CNIC number safe to enter here?', a: 'Yes. The CNIC is decoded entirely in your browser. It is never sent to any server. Clear your browser data afterward if using a shared computer.' },
    ],
  },

  'loan-manager': {
    metaTitle: 'Free Loan Manager Online — Track All Your Loans | Rafiqy',
    metaDesc: 'Track all active loans in one dashboard. See outstanding balances, monthly obligations and interest. Free, private, no sign-up needed.',
    heading: 'Free Loan Manager — Track All Your Loans in One Place',
    paras: [
      'Rafiqy\'s Loan Manager helps you track all your active loans — personal loans, car loans, home loans, credit card debt — in one dashboard. See your total debt, monthly obligations, and remaining balances at a glance.',
      'Add each loan with its principal, interest rate, tenure, and start date. The tool calculates outstanding balance, months remaining, total interest paid so far, and total interest remaining. Compare loans to decide which to pay off first.',
      'All loan data is stored locally in your browser. Export a full report for sharing with a financial advisor. No account, no cloud sync.',
    ],
    faqs: [
      { q: 'How many loans can I track?', a: 'There is no limit. Add all your active loans — mortgages, car loans, personal loans, credit cards, family loans — and see your complete debt picture.' },
      { q: 'Which loan should I pay off first?', a: 'The tool highlights which loans cost the most in interest. The avalanche method (highest interest rate first) saves the most money. The snowball method (smallest balance first) builds momentum.' },
      { q: 'Can I track informal loans (from family/friends)?', a: 'Yes. Add any loan with 0% interest rate to track informal family loans. The tool will track outstanding balance and agreed payment schedule.' },
      { q: 'Does it calculate early repayment savings?', a: 'Yes. Enter an extra payment amount and the tool shows how much interest you save and how many months earlier you pay off the loan.' },
      { q: 'Is my loan data secure?', a: 'All data is stored only in your browser\'s localStorage. Nothing is sent to any server or cloud. Your financial data stays on your device.' },
    ],
  },

  'regex-tester': {
    metaTitle: 'Free Regex Tester Online — Test Patterns Instantly',
    metaDesc: 'Test and debug regular expressions in real time. Highlights matches, groups and indices. JavaScript regex syntax. Free, private, instant.',
    heading: 'Free Regex Tester — Test Regular Expressions Online Instantly',
    paras: [
      'Rafiqy\'s Regex Tester lets you write, test, and debug regular expressions in real time. See matches highlighted instantly as you type your pattern and test string — no "Run" button needed. Supports JavaScript regex syntax.',
      'The tool shows all matches, capture groups, named groups, and match indices. Hover over a match to see which group it belongs to. Great for developers, data analysts, and anyone working with pattern matching.',
      'All regex processing happens in your browser using JavaScript\'s native regex engine. Your patterns and test data never leave your device.',
    ],
    faqs: [
      { q: 'What regex flavour does this tool use?', a: 'JavaScript (ECMAScript) regex syntax. This is compatible with most modern languages. Note: some features like lookbehind assertions require a modern browser.' },
      { q: 'Can I test regex flags?', a: 'Yes. Toggle flags directly: g (global), i (case-insensitive), m (multiline), s (dotall), and more. Flags are applied in real time.' },
      { q: 'How do I test named capture groups?', a: 'Use (?<name>...) syntax for named groups. The tool displays named group values in the match details panel.' },
      { q: 'Does it explain what my regex does?', a: 'The tool highlights matches and groups visually. For a plain-English explanation of a regex pattern, consider combining this with a regex documentation reference.' },
      { q: 'Can I share my regex test?', a: 'Use the copy/export feature to save your pattern and test string. Useful for sharing with teammates or saving for future reference.' },
    ],
  },

  'gold-price': {
    metaTitle: 'Live Gold Price Pakistan Today — PKR Rates | Rafiqy',
    metaDesc: 'Check live gold and silver prices in Pakistan in PKR per tola, gram and ounce. 24K, 22K, 21K and 18K. Free gold value calculator.',
    heading: 'Live Gold & Silver Price Pakistan — PKR Rates Today',
    paras: [
      'Check today\'s live gold and silver prices in Pakistan in PKR (Pakistani Rupee). See prices per tola, per gram, and per ounce for 24K, 22K, 21K, and 18K gold. Rates are updated regularly and sourced from reliable market data.',
      'Use the built-in calculator to convert any weight of gold to its current PKR value — perfect for buying/selling jewelry, evaluating gold loans, or tracking investments. Silver prices in per tola and per gram are also shown.',
      'The tool also shows price trends over the past 7 and 30 days, helping you see whether gold is trending up or down before making a purchase or sale decision.',
    ],
    faqs: [
      { q: 'How often are gold prices updated?', a: 'Prices are updated throughout the day based on international spot prices converted to PKR at the current exchange rate. Check back for the latest rates.' },
      { q: 'What is the difference between 24K and 22K gold?', a: '24K gold is pure gold (99.9% purity). 22K gold is 91.7% pure (the rest is alloy for durability). Most Pakistani jewelry is 22K or 21K.' },
      { q: 'How do I calculate the value of my gold jewelry?', a: 'Enter the weight in tolas or grams and select the purity (24K/22K/21K/18K). The tool instantly shows the current market value in PKR.' },
      { q: 'Are gold prices different in different cities?', a: 'Spot gold price is a global benchmark, but local jewelry shop prices vary slightly by city due to local making charges and margins. This tool shows the bullion/spot price.' },
      { q: 'Is gold a good investment in Pakistan?', a: 'Gold has historically served as a hedge against inflation and PKR devaluation. However, investment decisions should be based on your full financial situation. This tool provides price data, not investment advice.' },
    ],
  },

  'tax-optimizer': {
    metaTitle: 'Pakistan Tax Optimizer — Reduce Your Tax Bill | Rafiqy',
    metaDesc: 'Find legal deductions (VPS, Zakat, donations) to reduce Pakistan income tax. FBR 2025-26 compliant. Free, private, no sign-up needed.',
    heading: 'Pakistan Tax Shield Optimizer — Legally Reduce Your Tax Bill',
    paras: [
      'The Tax Shield Optimizer helps Pakistani taxpayers identify legal deductions and allowances that can significantly reduce their income tax liability. Enter your income and the tool shows you every deduction you qualify for under Pakistani tax law.',
      'Deductions covered include: Voluntary Pension Scheme (VPS) contributions, Zakat, charitable donations (Section 60), senior citizen rebate, medical allowance exemptions, house rent allowance, and more.',
      'Compare your tax before and after applying all available shields. For many salaried individuals, proper use of VPS and charitable deductions can reduce tax by 20-40%. All calculations follow FBR rules for Tax Year 2026.',
    ],
    faqs: [
      { q: 'What is a tax shield?', a: 'A tax shield is any legally allowed deduction or exemption that reduces your taxable income. Examples include VPS contributions, Zakat, and charitable donations under Section 60 of the Income Tax Ordinance.' },
      { q: 'How much can I save with VPS?', a: 'Salaried individuals can deduct up to Rs 500,000 per year invested in a Voluntary Pension Scheme from taxable income. At a 23% marginal rate, that\'s up to Rs 115,000 saved in taxes.' },
      { q: 'Is Zakat tax-deductible in Pakistan?', a: 'Yes. Zakat paid is deductible from income under Section 60 of the Income Tax Ordinance 2001. Keep receipts from recognized Zakat collection institutions.' },
      { q: 'Who qualifies for the senior citizen tax rebate?', a: 'Individuals aged 60 years or above qualify for a 50% rebate on income tax payable (subject to conditions). This is a significant benefit for retired salaried individuals.' },
      { q: 'Are these calculations FBR-approved?', a: 'The calculations follow the official Income Tax Ordinance 2001 and Finance Act 2025 provisions. For final tax planning, always consult a registered tax consultant.' },
    ],
  },

  'text-encryptor': {
    metaTitle: 'Free Text Encryptor Online — AES-256 Privacy | Rafiqy',
    metaDesc: 'Encrypt and decrypt messages with AES-256. Share sensitive text safely over WhatsApp or email. 100% browser-based. No sign-up needed.',
    heading: 'Free Text Encryptor — Encrypt & Decrypt Messages Privately',
    paras: [
      'Rafiqy\'s Text Encryptor lets you encrypt any text message with a password using AES-256 encryption — one of the strongest encryption standards available. Share the encrypted text safely; only someone with the password can decrypt it.',
      'Use it to send sensitive information over WhatsApp, email, or SMS without worrying about interception. The encrypted output is a base64 string that looks like gibberish without the password.',
      'All encryption and decryption happen entirely in your browser using the Web Crypto API. Your original text and password never leave your device. Zero server involvement.',
    ],
    faqs: [
      { q: 'What encryption does this use?', a: 'AES-256-GCM (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode). This is the same standard used by governments and financial institutions for securing sensitive data.' },
      { q: 'Is this end-to-end encrypted?', a: 'The encryption itself is end-to-end: only someone with the correct password can decrypt the message. However, how you transmit the encrypted text (email, WhatsApp) is a separate security consideration.' },
      { q: 'What if I forget the password?', a: 'There is no recovery mechanism. If you lose the password, the encrypted text cannot be decrypted. Store your password safely.' },
      { q: 'Can encrypted text be cracked?', a: 'AES-256 is computationally infeasible to crack by brute force. However, a weak password makes it vulnerable to dictionary attacks. Use a strong, unique passphrase.' },
      { q: 'Does the encrypted output change each time?', a: 'Yes. AES-GCM uses a random IV (initialization vector) each time, so the same text encrypted twice produces different outputs. Both can be decrypted with the correct password.' },
    ],
  },

  'data-leak-detector': {
    metaTitle: 'Data Leak Detector — Check Breached Emails | Rafiqy',
    metaDesc: 'Check if your email or password was exposed in a data breach. Uses k-anonymity — your credentials never leave your browser. Free.',
    heading: 'Data Leak Detector — Check If Your Emails & Passwords Were Exposed',
    paras: [
      'Data breaches happen constantly — millions of usernames, passwords, and email addresses are leaked online every year. Rafiqy\'s Data Leak Detector lets you check whether your email address or passwords appear in known breach databases, without ever sending your actual credentials to any server.',
      'Most breach-checking tools send your email or password hash directly to their API. Rafiqy uses a k-anonymity approach: only the first 5 characters of your password\'s SHA-1 hash are sent to the Have I Been Pwned API — making it mathematically impossible for the server to know your actual password.',
      'If your password appears in a breach database, change it immediately on every site where you use it. Enable two-factor authentication (2FA) wherever available.',
    ],
    faqs: [
      { q: 'Does this tool send my password to a server?', a: 'No. Your full password never leaves your browser. Only the first 5 characters of its SHA-1 hash are sent to the Have I Been Pwned API (k-anonymity model).' },
      { q: 'What is k-anonymity?', a: 'A privacy technique where only a partial hash prefix is sent to a remote server. The server returns all hashes starting with that prefix, and your browser checks for a full match locally.' },
      { q: 'My password appeared in a breach — what should I do?', a: 'Change that password immediately on every site where you use it. Enable two-factor authentication (2FA). Use a unique password for each site.' },
      { q: 'My email appeared in a breach — what data was exposed?', a: 'The tool shows which service was breached and what data types were included (email, password, phone, address). Change your password on that service immediately.' },
      { q: 'Is this tool affiliated with Have I Been Pwned?', a: 'No. Rafiqy is an independent tool using the public Have I Been Pwned API. HIBP is run by security researcher Troy Hunt.' },
    ],
  },

  'currency-converter': {
    metaTitle: 'Free Currency Converter Online — Live Rates | Rafiqy',
    metaDesc: 'Convert between 30+ currencies with live exchange rates. PKR, USD, GBP, AED and more. Free, fast and works offline.',
    heading: 'Free Currency Converter — Live Exchange Rates Including PKR',
    paras: [
      'Rafiqy\'s Currency Converter provides live exchange rates for all major currencies including Pakistani Rupee (PKR), UAE Dirham (AED), Saudi Riyal (SAR), US Dollar (USD), and more. Convert any amount between currencies instantly.',
      'The tool is particularly useful for Pakistanis sending or receiving remittances, freelancers getting paid in foreign currencies, and travelers. See the interbank rate alongside the typical market rate to understand the spread.',
      'Exchange rates are fetched from a reliable public API and updated regularly. All conversions are calculated in your browser — your amounts are never stored or transmitted.',
    ],
    faqs: [
      { q: 'How often are exchange rates updated?', a: 'Rates are updated multiple times daily from a public exchange rate API. For real-time interbank rates, always verify with your bank or exchange service before transacting.' },
      { q: 'Does this show the Pakistani open market rate?', a: 'The tool shows market reference rates. Pakistani open market rates (from money changers) may differ slightly from the interbank rate shown.' },
      { q: 'Can I convert PKR to AED or SAR for remittances?', a: 'Yes. Enter any PKR amount and select AED, SAR, or any other currency to see the conversion. Compare with your bank\'s rate to understand the exchange cost.' },
      { q: 'How many currencies are supported?', a: 'The tool supports 150+ world currencies including all major and most minor currencies.' },
      { q: 'Is my conversion history saved?', a: 'Recent conversions are saved in your browser session for quick reference. They are not sent to any server.' },
    ],
  },

  'packing-list': {
    metaTitle: 'Free Smart Packing List Generator Online | Rafiqy',
    metaDesc: 'Generate a customized packing checklist for any trip. Covers clothes, documents, Pakistan essentials and more. Free, private, offline.',
    heading: 'Free Smart Packing List — Never Forget Anything When Traveling',
    paras: [
      'Rafiqy\'s Smart Packing List generates a customized packing checklist based on your destination, trip type, duration, and season. Stop forgetting important items — get a comprehensive list tailored to your specific trip.',
      'Select your trip type (beach holiday, business trip, hiking, etc.) and the tool generates a list covering clothes, toiletries, electronics, travel documents, medications, and Pakistan-specific items like prayer essentials and Urdu documents.',
      'Check off items as you pack, save multiple trip lists, and export as PDF or WhatsApp message. Never overpack or underpack again.',
    ],
    faqs: [
      { q: 'How is the packing list customized?', a: 'The tool generates recommendations based on trip duration, destination weather, trip type (beach, business, hiking), and whether you\'re traveling with family or solo.' },
      { q: 'Are Pakistan-specific items included?', a: 'Yes. The list includes Pakistan travel essentials: prayer mat, CNIC/passport, Urdu phrasebook, power adapters, and items specific to visiting family.' },
      { q: 'Can I save lists for multiple trips?', a: 'Yes. Save up to 10 named trip lists in your browser. Load a previous trip as a template for similar future trips.' },
      { q: 'Can I add custom items?', a: 'Yes. Add any custom item to any category. Your additions are saved and suggested on future similar trips.' },
      { q: 'Can I share my packing list?', a: 'Export as a PDF or copy as plain text to share via WhatsApp, email, or print.' },
    ],
  },

  'budget-splitter': {
    metaTitle: 'Free Trip Budget Splitter Online | Rafiqy',
    metaDesc: 'Split shared travel or group expenses fairly and calculate who owes who. WhatsApp-shareable summary. Free, private, no sign-up.',
    heading: 'Free Trip Budget Splitter — Split Expenses Fairly Among Friends',
    paras: [
      'Rafiqy\'s Trip Budget Splitter makes it easy to split shared expenses fairly among a group — whether it\'s a road trip, dinner, holiday, or office outing. Add expenses, assign who paid, and see exactly who owes who at the end.',
      'The tool uses a smart debt simplification algorithm: instead of everyone paying everyone else, it calculates the minimum number of transfers to settle all debts. Perfect for Pakistani family trips, friend groups, and work events.',
      'All calculations happen in your browser. No account needed. Export a final settlement summary to share on WhatsApp with your group.',
    ],
    faqs: [
      { q: 'How does the expense splitter work?', a: 'Add each shared expense with who paid and who was involved. The tool tracks the running balance for each person and shows a final simplified settlement.' },
      { q: 'What is debt simplification?', a: 'Instead of multiple back-and-forth payments, the algorithm finds the minimum set of one-way transfers to settle all debts. Fewer transactions for everyone.' },
      { q: 'Can some expenses be split unequally?', a: 'Yes. For each expense, you can split equally or assign custom amounts to specific people (useful when some ordered more expensive items).' },
      { q: 'Does it support PKR?', a: 'Yes. The tool supports PKR as the default currency. You can also use any other currency — just be consistent throughout the calculation.' },
      { q: 'How do I share the settlement summary?', a: 'Click "Share Settlement" to copy a WhatsApp-friendly text summary showing each person\'s balance and who should pay who.' },
    ],
  },

  'drug-checker': {
    metaTitle: 'Drug Interaction Checker Pakistan — Free Online',
    metaDesc: 'Check medication interactions for Pakistani brand and generic drugs. Browser-based, private. Always consult your doctor. Free tool.',
    heading: 'Drug Interaction Checker — Check Medication Safety in Pakistan',
    paras: [
      'Before taking multiple medications together, it\'s critical to know whether they interact. Some combinations reduce effectiveness, cause side effects, or in rare cases can be dangerous. Rafiqy\'s Drug Interaction Checker lets you check common interactions instantly.',
      'The tool covers hundreds of commonly prescribed medications in Pakistan including antibiotics, antihypertensives, diabetes medications, pain relievers, and psychiatric drugs. Enter drug names and see known interactions, their severity, and what to watch for.',
      'All checks happen in your browser using a built-in interaction database. No personal health data is ever transmitted. This tool is a reference aid — it does not replace professional medical advice.',
    ],
    faqs: [
      { q: 'How accurate is this drug interaction checker?', a: 'The tool uses a curated database of well-documented interactions. It is intended as a quick reference tool. Always consult a qualified pharmacist or physician for complete accuracy.' },
      { q: 'Does this cover Pakistani brand names?', a: 'Yes. The tool supports both generic names (paracetamol) and common Pakistani brand names (Panadol, Brufen, Augmentin). Try the generic name if a brand isn\'t found.' },
      { q: 'My two drugs show an interaction — should I stop taking them?', a: 'Do not stop any prescribed medication without consulting your doctor. Some interactions are manageable under medical supervision. Use this to have an informed conversation with your healthcare provider.' },
      { q: 'Can I check more than two drugs at once?', a: 'Yes. Enter multiple drugs to check all combination pairs at once. The tool lists each pair with its interaction status and severity.' },
      { q: 'Is my health data stored or shared?', a: 'No. All checks happen locally in your browser. No medication names or personal data is stored on any server.' },
    ],
  },

  'symptom-tracker': {
    metaTitle: 'Free Symptom Tracker Online — Log Health Patterns',
    metaDesc: 'Log symptoms with severity and context to share with your doctor. Export a clean PDF timeline. Private, browser-based. No sign-up.',
    heading: 'Symptom Context Tracker — Log & Track Health Symptoms Over Time',
    paras: [
      'Rafiqy\'s Symptom Context Tracker helps you maintain a detailed log of health symptoms, medications, and possible triggers — creating a timeline you can share with your doctor. Useful for chronic conditions, recurring headaches, digestive issues, or any health pattern you want to understand.',
      'Log symptoms with date, time, severity (1–10), location, and contextual notes (what you ate, weather, stress level). The tool generates a visual timeline and identifies patterns — helping you connect symptoms to potential triggers.',
      'Your health data never leaves your device. Export a clean summary to show your doctor at your next appointment, or save as PDF for your medical records.',
    ],
    faqs: [
      { q: 'How does this help with doctor visits?', a: 'Instead of trying to recall symptoms verbally, you can export a clear timeline PDF showing symptom history, severity ratings, and contextual notes. Doctors find this far more useful than general descriptions.' },
      { q: 'What conditions is this useful for?', a: 'Particularly useful for: migraines, IBS, allergies, diabetes monitoring, blood pressure tracking, chronic pain, and any condition where pattern identification matters.' },
      { q: 'Can I track medications alongside symptoms?', a: 'Yes. Log medications taken and their timing alongside symptom entries. This helps identify whether a medication is helping or potentially causing a symptom.' },
      { q: 'Can I share this with my doctor?', a: 'Yes. Export your symptom history as a PDF or print directly. The export is formatted for medical review.' },
      { q: 'Is my health data private?', a: 'Yes. All symptom data is stored only in your browser\'s localStorage. Nothing is uploaded to any server.' },
    ],
  },

  'measurement-tracker': {
    metaTitle: 'Free Measurement Tracker — Log Weight & BMI | Rafiqy',
    metaDesc: 'Track weight, BMI, body measurements and health metrics over time. Private charts, CSV export. Free, browser-based, no account needed.',
    heading: 'Free Measurement Tracker — Log Weight, BMI & Body Measurements',
    paras: [
      'Rafiqy\'s Measurement Tracker helps you log and visualize your health metrics over time: weight, BMI, body measurements (waist, chest, arms), blood pressure, and blood sugar. Track your fitness journey without a subscription app.',
      'Log any metric with date and optional notes. View progress charts showing trends over weeks and months. The tool automatically calculates BMI from your height and weight and shows whether you\'re in the healthy range.',
      'All data stays in your browser — no fitness app accounts, no data sharing with advertisers. Export your progress as a CSV for analysis or as a chart image to share.',
    ],
    faqs: [
      { q: 'What measurements can I track?', a: 'Weight, BMI, waist circumference, chest, arms, hips, blood pressure (systolic/diastolic), blood sugar (fasting/post-meal), and any custom metric you add.' },
      { q: 'How is BMI calculated?', a: 'BMI = weight (kg) / height² (m²). The tool automatically calculates your BMI from your logged weight and stored height. WHO BMI categories are shown for reference.' },
      { q: 'Can I track multiple people?', a: 'Yes. Create separate profiles for each family member — useful for tracking children\'s growth or elderly parents\' health metrics.' },
      { q: 'How do I export my progress?', a: 'Export your measurement history as a CSV file or view a chart image. Useful for sharing with a doctor or fitness trainer.' },
      { q: 'Is my health data secure?', a: 'Yes. All measurements are stored only in your browser\'s localStorage on your device. Nothing is sent to any server.' },
    ],
  },

  'data-transformer': {
    metaTitle: 'Free Data Transformer Online — CSV & JSON | Rafiqy',
    metaDesc: 'Transform, convert and clean CSV, JSON and TSV data locally. Apply custom JS expressions. No uploads, fully private. No sign-up.',
    heading: 'Privacy-First Data Transformer — Convert & Clean Data Locally',
    paras: [
      'Rafiqy\'s Data Transformer lets developers and analysts transform, convert, and clean datasets entirely in the browser. No uploading sensitive data to cloud transformation services — process CSVs, JSON, and text files locally.',
      'Apply transformations: rename columns, filter rows, aggregate values, convert formats (CSV ↔ JSON ↔ TSV), and apply custom JavaScript expressions. All processing uses your browser\'s JavaScript engine — zero data leaves your device.',
      'Ideal for: cleaning exported data before database import, transforming API responses, anonymizing data for sharing, or any ETL task you\'d rather not run through a cloud service.',
    ],
    faqs: [
      { q: 'What input formats are supported?', a: 'CSV, JSON (arrays), TSV, and plain text. Paste data directly or upload a file. The tool auto-detects the format.' },
      { q: 'Can I write custom transformation logic?', a: 'Yes. Apply JavaScript expressions to transform column values. For example: row.price * 1.17 to add 17% tax to a price column.' },
      { q: 'Is there a file size limit?', a: 'No hard limit. Processing happens in the browser, so very large files (100MB+) may be slow on older devices. For most datasets (under 10MB), it\'s fast.' },
      { q: 'Can I join two datasets?', a: 'Basic join operations (matching on a key column) are supported. For complex multi-table joins, consider using a local SQLite tool.' },
      { q: 'Why use this instead of uploading to a cloud tool?', a: 'If your data contains PII, financial records, or confidential business data, you should not upload it to cloud transformation services. Processing locally keeps your data private.' },
    ],
  },

  'markdown-scraper': {
    metaTitle: 'Free Markdown Scraper — Web to LLM-Ready Markdown',
    metaDesc: 'Convert any web page to clean Markdown for AI tools and RAG pipelines. Strips ads and boilerplate. Free, fast, no sign-up needed.',
    heading: 'LLM-Ready Markdown Scraper — Convert Web Pages to Clean Markdown',
    paras: [
      'Rafiqy\'s Markdown Scraper converts any web page into clean Markdown text — perfectly formatted for feeding into LLMs (ChatGPT, Claude, Gemini), building RAG pipelines, or creating documentation from web content.',
      'Enter a URL and the tool fetches the page, strips ads, navigation, and boilerplate, and returns the main content as structured Markdown with headings, lists, tables, and code blocks preserved. Output is immediately paste-able into any LLM chat.',
      'Useful for: summarizing articles with AI, building knowledge bases from web pages, converting documentation to Markdown, or feeding context to AI coding assistants.',
    ],
    faqs: [
      { q: 'What is this tool used for?', a: 'Converting web pages to clean Markdown for use with AI tools (ChatGPT, Claude, Gemini) as context, for RAG (Retrieval-Augmented Generation) pipelines, or for documentation.' },
      { q: 'Can it scrape any website?', a: 'The tool can scrape publicly accessible web pages. Some sites block scraping via CORS or robots.txt. For those, you may need to use a browser extension or local scraping method.' },
      { q: 'Is JavaScript-rendered content supported?', a: 'The tool fetches raw HTML. JavaScript-rendered content (SPAs) may not be fully captured. Static HTML pages like documentation sites work best.' },
      { q: 'What is "LLM-ready" Markdown?', a: 'Markdown that\'s clean, well-structured, and free of navigation/footer noise — so when you paste it into an LLM chat, the AI receives only the relevant content without irrelevant boilerplate.' },
      { q: 'Is the scraped content stored?', a: 'No. Fetched content is processed and displayed locally. It\'s not stored on any server.' },
    ],
  },

  'log-analyzer': {
    metaTitle: 'Free Log Analyzer Online — Parse Logs Privately',
    metaDesc: 'Parse, filter and search application logs locally. Auto-detects Apache, JSON and Node formats. No uploads. Free, private, no sign-up.',
    heading: 'Smart Log Analyzer — Parse & Search Application Logs Instantly',
    paras: [
      'Rafiqy\'s Smart Log Analyzer helps developers parse, filter, and analyze application logs without uploading sensitive production data to cloud log services. Paste or upload your log files and search, filter, and highlight patterns instantly.',
      'The tool auto-detects common log formats (Apache, Nginx, JSON logs, Python logging, Node.js) and structures them for easy browsing. Filter by log level (ERROR, WARN, INFO), time range, or custom pattern. Highlight stack traces automatically.',
      'All log processing happens in your browser. No log data leaves your device — critical for production logs that may contain customer data or security information.',
    ],
    faqs: [
      { q: 'What log formats are supported?', a: 'Apache/Nginx access logs, JSON structured logs, Python logging format, Node.js/Express logs, custom delimited logs. The tool auto-detects the format.' },
      { q: 'Can I filter logs by error level?', a: 'Yes. Filter by ERROR, WARN, INFO, DEBUG instantly. Click any level badge to see only those entries. Multiple levels can be selected simultaneously.' },
      { q: 'How do I find a specific error in a large log?', a: 'Use the search box to find any text pattern. Combine with log level filters. Stack traces are collapsed by default but expand on click.' },
      { q: 'Why not use a cloud log tool?', a: 'Production logs often contain customer IDs, IP addresses, and sensitive data. Uploading them to cloud tools creates privacy and security risks. Processing locally keeps your data private.' },
      { q: 'What is the maximum log file size?', a: 'No hard limit, but very large files (1GB+) may be slow. For best performance, analyze specific time ranges rather than full log files.' },
    ],
  },

  'config-converter': {
    metaTitle: 'Free Config Converter — JSON, YAML, TOML & ENV',
    metaDesc: 'Convert config files between JSON, YAML, TOML and .ENV formats instantly. Validates syntax. Browser-based, private. No sign-up needed.',
    heading: 'Config Polyglot Converter — Convert Between JSON, YAML, TOML & ENV',
    paras: [
      'Rafiqy\'s Config Converter translates configuration files between JSON, YAML, TOML, and .ENV formats instantly. Convert your Docker Compose file to JSON, your .env to YAML, or your TOML config to JSON with one click.',
      'The tool validates the syntax of your input and output, highlighting any errors. It preserves comments where possible and formats output with proper indentation. All conversion happens in your browser.',
      'Essential for: DevOps engineers working across different config formats, developers migrating between frameworks, or anyone who needs to quickly translate config between tools.',
    ],
    faqs: [
      { q: 'What formats are supported?', a: 'JSON, YAML (1.1 and 1.2), TOML (v1.0), and .ENV (dotenv format). Convert between any pair of these formats.' },
      { q: 'Does it preserve comments?', a: 'YAML and TOML support comments; JSON and ENV do not. Comments in YAML/TOML input are preserved in YAML/TOML output but lost when converting to JSON or ENV.' },
      { q: 'Does it validate the config syntax?', a: 'Yes. The input is validated before conversion. Any syntax errors are highlighted with the line and column number.' },
      { q: 'Can I convert a multi-document YAML file?', a: 'Multi-document YAML (separated by ---) is supported. Each document is converted independently.' },
      { q: 'Is my config data sent to a server?', a: 'No. All conversion happens in the browser. Config files often contain secrets (API keys, passwords) — they never leave your device.' },
    ],
  },

  'mock-data': {
    metaTitle: 'Free Mock Data Generator — Test Data Online | Rafiqy',
    metaDesc: 'Generate realistic fake test data in JSON, CSV or SQL. Pakistani names, CNICs and phone numbers. Free, no limits, no sign-up needed.',
    heading: 'Mock Data Generator — Create Fake Test Data Instantly',
    paras: [
      'Rafiqy\'s Mock Data Generator creates realistic fake data for testing and development. Generate names, emails, phone numbers, addresses, UUIDs, dates, or any custom schema — in JSON, CSV, or SQL INSERT format.',
      'Use Pakistani locale data: generate Pakistani names, CNIC numbers (dummy format), Pakistani phone numbers (+92 format), Pakistani cities, and bank account numbers — realistic test data that fits Pakistan-specific systems.',
      'Specify the number of records, select your fields, and download instantly. No account, no rate limits, all generation happens in your browser.',
    ],
    faqs: [
      { q: 'What types of data can be generated?', a: 'Names (Pakistani, English), emails, phone numbers (+92 format), CNICs (dummy format), Pakistani cities, addresses, dates, UUIDs, booleans, numbers, and custom string patterns.' },
      { q: 'What output formats are supported?', a: 'JSON (array or object), CSV, and SQL INSERT statements. Choose the format that matches your testing framework or database.' },
      { q: 'Is there a limit on how many records I can generate?', a: 'The tool supports up to 10,000 records per generation. For larger datasets, run multiple batches and combine the output.' },
      { q: 'Can I create a custom schema?', a: 'Yes. Define custom field names, types, and constraints (min/max for numbers, regex patterns for strings). Save schemas for reuse.' },
      { q: 'Are the generated CNICs real?', a: 'No. Generated CNICs are structurally valid (follow NADRA format) but are not real or registered. Use them only for testing purposes.' },
    ],
  },

  'trace-correlator': {
    metaTitle: 'Free Distributed Trace Correlator Online | Rafiqy',
    metaDesc: 'Correlate microservice logs by trace ID and see the full request timeline. Paste logs from up to 10 services. Private, free, no sign-up.',
    heading: 'Distributed Trace Correlator — Correlate Logs Across Microservices',
    paras: [
      'Rafiqy\'s Distributed Trace Correlator helps developers correlate log entries across multiple microservices using trace IDs, correlation IDs, or request IDs. Paste logs from multiple services and see the full request flow stitched together in chronological order.',
      'Modern distributed systems generate logs across dozens of services for a single user request. Finding where a request failed means searching through multiple log files manually. This tool automates that correlation locally.',
      'Paste log excerpts from up to 10 services, specify your trace ID field, and the tool builds a unified timeline showing each log entry in order with its source service — all in your browser with no data uploaded.',
    ],
    faqs: [
      { q: 'What is distributed tracing?', a: 'In microservices, a single user request passes through multiple services (auth, API, database, cache). Distributed tracing assigns a unique trace ID to the request and logs it at each service hop.' },
      { q: 'What log formats are supported?', a: 'JSON structured logs, common text formats with extractable fields. The tool looks for trace_id, correlation_id, request_id, or X-Request-ID fields.' },
      { q: 'How many services can I correlate?', a: 'Up to 10 different service log streams can be pasted and correlated simultaneously.' },
      { q: 'Is this a replacement for Jaeger or Zipkin?', a: 'No. This is a quick local debugging tool for when you have raw logs but no full observability stack. For production tracing, use a dedicated system like Jaeger, Zipkin, or Datadog.' },
      { q: 'Is my log data sent to a server?', a: 'No. All correlation happens in your browser. Logs may contain sensitive data — they never leave your device.' },
    ],
  },

  'schema-mapper': {
    metaTitle: 'Free Schema Field Mapper Online — ETL & APIs | Rafiqy',
    metaDesc: 'Map fields between data schemas for ETL, API integrations and migrations. Export as JSON, Python or SQL. Free, private, no sign-up.',
    heading: 'Schema Field Mapper — Map Fields Between Different Data Schemas',
    paras: [
      'Rafiqy\'s Schema Field Mapper helps developers map fields between two different data schemas — for ETL pipelines, API integrations, database migrations, or data normalization. Define source and target schemas and the tool suggests mappings based on name similarity.',
      'Drag and drop to connect source fields to target fields, add transformations (rename, type cast, format change), and export the mapping as JSON, a Python dict, or SQL CASE statement. All field matching logic runs in your browser.',
      'Useful for: integrating third-party APIs with your own data model, migrating from one database schema to another, or building transformation logic for data pipelines.',
    ],
    faqs: [
      { q: 'What is schema mapping?', a: 'Connecting fields from a source data structure (e.g. an API response) to a target structure (e.g. your database). For example: mapping API\'s "first_name" to your DB\'s "fname" field.' },
      { q: 'How does auto-mapping work?', a: 'The tool compares source and target field names using fuzzy matching (Levenshtein distance). It suggests mappings for fields with similar names. You review and adjust each suggestion.' },
      { q: 'What transformation types are supported?', a: 'Rename (source field → different target name), type cast (string → int), format change (date format conversion), string transforms (upper/lower/trim), and null handling.' },
      { q: 'What can I export the mapping as?', a: 'Export as a JSON mapping file, Python dictionary, SQL CASE statement, or JavaScript object. Use the output to implement the transformation in your preferred language.' },
      { q: 'Is my schema data private?', a: 'Yes. All field matching and mapping happens in your browser. Your schema definitions never leave your device.' },
    ],
  },

  'json-formatter': {
    metaTitle: 'Free JSON Formatter Online — Validate & Explore',
    metaDesc: 'Format, validate and explore JSON data instantly. Prettify or minify JSON in your browser. Free, fast, no sign-up required.',
    heading: 'Free JSON Formatter & Validator — Beautify & Minify JSON Online',
    paras: [
      'Rafiqy\'s JSON Formatter instantly beautifies, minifies, and validates JSON. Paste any JSON — even minified or slightly malformed — and the tool formats it with proper indentation, highlights syntax, and shows any errors with their exact line and position.',
      'The tool supports JSON Path queries to extract specific values from large JSON objects, tree view for navigating nested structures, and one-click minification for production use. All processing is local — your JSON data never leaves your browser.',
      'Essential for: API development, debugging API responses, validating configuration files, or cleaning up data exports.',
    ],
    faqs: [
      { q: 'What does "beautify" JSON mean?', a: 'Beautify (or pretty-print) reformats compact JSON with proper indentation and line breaks so it\'s human-readable. Useful for reading API responses or config files.' },
      { q: 'What does "minify" JSON do?', a: 'Minify removes all whitespace and newlines, making JSON as compact as possible. Used in production to reduce data transfer size.' },
      { q: 'Does it validate JSON?', a: 'Yes. Any syntax error is highlighted with the exact position (line:column). Common errors like missing quotes, trailing commas, and unmatched brackets are all detected.' },
      { q: 'Can I query JSON with JSONPath?', a: 'Yes. Use JSONPath syntax (e.g. $.store.book[*].title) to extract specific values from nested JSON. Results are shown instantly.' },
      { q: 'Is my JSON data sent to a server?', a: 'No. All formatting, validation, and querying happens in your browser. Paste confidential API keys or data without privacy concerns.' },
    ],
  },

  'student-groups': {
    metaTitle: 'Free Student Group Randomizer — Fair Groups | Rafiqy',
    metaDesc: 'Create fair random student groups in seconds with constraints. Save class lists, regenerate instantly. Free, private, no sign-up needed.',
    heading: 'Free Student Group Randomizer — Fair Random Group Maker for Teachers',
    paras: [
      'Rafiqy\'s Student Group Randomizer helps teachers create fair, random student groups in seconds. Enter your class list and specify group size — the tool shuffles and assigns students into balanced groups, avoiding the awkward manual grouping process.',
      'Ensure diversity by preventing same-gender groups, balancing skill levels, or ensuring each group has at least one student with certain attributes. All randomization is truly random using the browser\'s crypto API.',
      'Save class lists for reuse, regenerate groups with one click, and export group assignments as a list or table to share with students.',
    ],
    faqs: [
      { q: 'How random is the grouping?', a: 'The tool uses the browser\'s cryptographically secure random number generator (crypto.getRandomValues) for truly unbiased random group assignments.' },
      { q: 'Can I set constraints on grouping?', a: 'Yes. Add attributes to students (e.g. gender, skill level, language) and set rules like "each group must have both genders" or "no two advanced students in the same group".' },
      { q: 'Can I save my class list?', a: 'Yes. Class lists are saved in your browser\'s localStorage. Load a saved class with one click to quickly generate new random groups.' },
      { q: 'What if the class size doesn\'t divide evenly?', a: 'The tool handles uneven division: some groups will have one extra member. You can specify whether larger groups should have more or fewer than the target size.' },
      { q: 'Can I lock certain students together?', a: 'Yes. Mark students who must be in the same group (e.g. students who need to work together for accessibility reasons). The randomizer respects these locks.' },
    ],
  },

  'timeline-builder': {
    metaTitle: 'Free Timeline Builder Online — Visual Events | Rafiqy',
    metaDesc: 'Build visual event timelines for legal cases, research or projects. Export as PDF or image. Free, private, browser-based. No sign-up.',
    heading: 'Contextual Timeline Builder — Build Visual Event Timelines',
    paras: [
      'Rafiqy\'s Contextual Timeline Builder helps researchers, lawyers, journalists, and project managers create clear visual timelines of events. Add events with dates, descriptions, and categories — the tool arranges them chronologically with optional context notes.',
      'Timelines are essential for legal cases (documenting sequence of events), research (historical chronologies), project retrospectives, and personal life documentation. Export as PDF or image to share or include in presentations.',
      'All timeline data is stored locally in your browser. Export your timeline at any time. No account required.',
    ],
    faqs: [
      { q: 'What can I use a timeline builder for?', a: 'Legal case documentation, research chronologies, project timelines, historical event mapping, incident post-mortems, and personal milestone tracking.' },
      { q: 'Can I add supporting evidence or documents to events?', a: 'Yes. Attach notes, URLs, or file references to any event entry. The contextual notes appear when you hover or click on the event in the timeline view.' },
      { q: 'What date formats are supported?', a: 'Full dates (day/month/year), year-only, and approximate dates (circa/approx). Useful for historical research where exact dates may be unknown.' },
      { q: 'Can I export the timeline as a visual?', a: 'Yes. Export as a PDF document or as an image (PNG/SVG) for including in presentations or reports.' },
      { q: 'Is my timeline data private?', a: 'Yes. All timeline data is stored only in your browser\'s localStorage. Nothing is uploaded to any server.' },
    ],
  },

  'position-size-calc': {
    metaTitle: 'Free Position Size Calculator — Trade Risk | Rafiqy',
    metaDesc: 'Calculate correct trade size based on account risk. Supports PSX, forex and crypto. Free, browser-based, private. No sign-up needed.',
    heading: 'Position Size Calculator — Risk-Based Trade Sizing for Investors',
    paras: [
      'Rafiqy\'s Position Size Calculator helps traders and investors determine the correct trade size based on their risk tolerance. Enter your account size, risk percentage per trade (e.g. 1-2%), entry price, and stop loss — the tool calculates the exact position size to stay within your risk limit.',
      'Proper position sizing is the most critical aspect of trading risk management. Over-sizing a single trade is the fastest way to blow a trading account. Use this tool before every trade to ensure you\'re risking the right amount.',
      'Supports Pakistani stock market (PSX), forex, commodities, and crypto. Works in PKR, USD, or any currency. All calculations happen in your browser.',
    ],
    faqs: [
      { q: 'What is position sizing?', a: 'Deciding how many shares/units to buy so that if your stop loss hits, you lose only a predetermined amount (e.g. 1% of your account). It\'s how professional traders manage risk.' },
      { q: 'What is the recommended risk percentage per trade?', a: 'Most professional traders risk 0.5%–2% per trade. At 1% risk, you need 100 consecutive losing trades to lose your whole account — making it nearly impossible to be wiped out.' },
      { q: 'Can I use this for PSX (Pakistan Stock Exchange)?', a: 'Yes. Enter your account in PKR, set a stop loss in PKR, and the tool calculates how many shares to buy. It works for any stock exchange or asset class.' },
      { q: 'What is a stop loss?', a: 'A stop loss is the price at which you exit a trade to limit losses. E.g. you buy at Rs 100 with a stop loss at Rs 95 — if the price falls to Rs 95, you sell automatically.' },
      { q: 'Does this give investment advice?', a: 'No. This is a mathematical sizing calculator based on your inputs. Investment decisions depend on many factors beyond position sizing. Always do your own research.' },
    ],
  },

  'voice-invoice': {
    metaTitle: 'Voice-to-Invoice Generator — Free Online | Rafiqy',
    metaDesc: 'Create professional invoices by speaking in English or Urdu. JazzCash/EasyPaisa support. Export as PDF. Free, browser-based.',
    heading: 'Voice-to-Invoice — Create Professional Invoices by Speaking',
    paras: [
      'Rafiqy\'s Voice-to-Invoice lets you create professional invoices by speaking naturally. Say "Invoice for web design, 3 hours at 5000 rupees" and the tool fills in the invoice form automatically. Export as PDF and send to clients.',
      'Designed for Pakistani freelancers and small business owners who find manual invoice creation tedious. Speak in English or Urdu (mixed input supported) and the tool extracts line items, amounts, and client details.',
      'Customize with your business name, logo, and payment details (bank account, JazzCash/EasyPaisa). All invoice data stays in your browser — export directly as PDF.',
    ],
    faqs: [
      { q: 'What languages can I use for voice input?', a: 'The tool supports English and Roman Urdu voice input. You can mix both languages naturally. Say "3 ghante ka kaam, 5000 rupees" and it will parse correctly.' },
      { q: 'Can I add my company logo and details?', a: 'Yes. Set up your business profile once (name, address, logo, bank details) and it auto-fills every invoice you create. Profile is saved in your browser.' },
      { q: 'What payment methods can I show on the invoice?', a: 'Bank transfer, JazzCash, EasyPaisa, Nayapay, and cash. Add your account numbers for each and toggle which ones appear on the invoice.' },
      { q: 'Can I add tax (GST/Sales Tax) automatically?', a: 'Yes. Set your applicable tax rate (e.g. 17% for GST) and it\'s applied automatically to the invoice total.' },
      { q: 'Is invoice data saved?', a: 'Yes. Past invoices are saved in your browser\'s localStorage. You can view invoice history, duplicate past invoices, and export any as PDF.' },
    ],
  },

  'property-comp': {
    metaTitle: 'Free Property Comp Adjuster — CMA Online | Rafiqy',
    metaDesc: 'Compare property values and estimate market price using comparable sales. Supports Marla/Kanal. Free, private, browser-based.',
    heading: 'Property Comp Adjuster — Compare Property Values for Valuation',
    paras: [
      'Rafiqy\'s Property Comp Adjuster helps real estate professionals, investors, and homebuyers perform comparative market analysis (CMA) to estimate a property\'s fair market value based on comparable sales.',
      'Enter details of the subject property and 3–5 comparable properties (comps). The tool guides you through adjustments for differences in size, age, condition, location, and features — producing an adjusted price per square foot and estimated value range.',
      'Particularly useful for Pakistan\'s property market where formal appraisals are expensive. Run your own quick CMA before making an offer or listing a property.',
    ],
    faqs: [
      { q: 'What is a property comp adjuster?', a: 'A tool for comparative market analysis (CMA). You compare a subject property to recently sold similar properties, adjusting for differences in features to estimate the subject property\'s market value.' },
      { q: 'What adjustments can I make?', a: 'Adjust for: square footage difference, number of bedrooms/bathrooms, age, condition (renovated vs original), floor level (in apartments), parking, location premium, and extra features.' },
      { q: 'How accurate is the valuation?', a: 'The accuracy depends on the quality and recency of your comparable sales data. Use recent sales (within 6 months, within 1km) for the most accurate results.' },
      { q: 'Is this useful for Pakistani property market?', a: 'Yes. The tool works for any property market. Pakistan-specific metrics like Marla/Kanal sizing are supported alongside square feet/meters.' },
      { q: 'Should I use this instead of a professional valuator?', a: 'This is a guidance tool for preliminary analysis. For formal valuations (bank mortgage, legal purposes), you need a licensed property valuator.' },
    ],
  },

  'refrigerant-calc': {
    metaTitle: 'Free Refrigerant Calculator — HVAC Charge Tool | Rafiqy',
    metaDesc: 'Calculate refrigerant charge requirements and leak rates for AC systems. Supports R-22, R-410A, R-32. Free, private, no sign-up.',
    heading: 'Refrigerant Leak Calculator — HVAC Refrigerant Charge & Leak Rate Tool',
    paras: [
      'Rafiqy\'s Refrigerant Leak Calculator helps HVAC technicians and engineers calculate refrigerant charge requirements, estimate leak rates, and determine refill schedules for AC systems and refrigeration units.',
      'Enter system specifications (refrigerant type, system capacity, current charge) and observed pressure readings to calculate estimated leak rate, time to critical undercharge, and refrigerant quantity needed for top-up.',
      'Supports common refrigerants used in Pakistan: R-22, R-410A, R-32, R-134a, and R-407C. All calculations use standard ASHRAE pressure-temperature charts built into the tool.',
    ],
    faqs: [
      { q: 'Which refrigerants are supported?', a: 'R-22, R-410A, R-32, R-134a, R-407C, and R-404A — the most common refrigerants in Pakistani residential and commercial HVAC systems.' },
      { q: 'How do I calculate the correct refrigerant charge?', a: 'Enter the system\'s rated capacity (BTU/hr or tons), pipe length, indoor/outdoor unit details, and current subcooling/superheat readings. The tool calculates the correct charge.' },
      { q: 'How is leak rate estimated?', a: 'Compare current refrigerant weight or pressure readings against the original spec. The tool calculates the percentage lost per unit time and estimates when critical undercharge will occur.' },
      { q: 'What is subcooling and superheat?', a: 'Subcooling is how much the liquid refrigerant is cooled below its condensing temperature. Superheat is how much the vapor is heated above its evaporating temperature. Both are used to verify correct charge.' },
      { q: 'Is this a replacement for professional HVAC gauges?', a: 'No. This tool performs calculations based on your inputs. Actual pressure readings must still be taken with proper manifold gauges. Use this alongside your equipment, not instead of it.' },
    ],
  },

  'freelancer-risk': {
    metaTitle: 'Free Freelancer Risk Analyzer — Client Risk | Rafiqy',
    metaDesc: 'Assess client and project risk before starting. Get a risk score and red flags. Built for Pakistani freelancers. Free, private.',
    heading: 'Freelancer Risk Analyzer — Assess Client & Project Risk Before You Start',
    paras: [
      'Rafiqy\'s Freelancer Risk Analyzer helps Pakistani freelancers evaluate the risk profile of a client or project before committing time and resources. Answer a series of questions about the client and project — the tool produces a risk score and specific red flags to watch for.',
      'Based on hundreds of freelancer experiences, the tool checks: payment history signals, contract clarity, scope definition, client communication patterns, platform reputation, and whether the project is in a high-chargeback category.',
      'The higher the risk score, the more protective measures you should take: larger upfront payment, milestone-based payments, signed contract, or simply declining the project. Protect your freelance income before disputes arise.',
    ],
    faqs: [
      { q: 'What makes a client high-risk?', a: 'Red flags include: no upfront payment offered, vague project scope, pressure to start before contract, unusually low budget, asking to move off-platform, inconsistent communication, and new/unverified accounts.' },
      { q: 'What platform risk factors are checked?', a: 'For Upwork, Fiverr, and Freelancer.com: payment verification status, account age, review count and rating, and history of disputes or chargebacks.' },
      { q: 'How much upfront payment should I ask for?', a: 'At low risk: 25-30% upfront. Medium risk: 50% upfront. High risk: 100% upfront or decline. The tool recommends appropriate upfront percentages based on the risk score.' },
      { q: 'Does this guarantee I won\'t have problems?', a: 'No tool can guarantee that. The analyzer identifies patterns associated with high-risk engagements based on common freelancer experiences. Use it as one input in your decision.' },
      { q: 'Is this specific to Pakistani freelancers?', a: 'It\'s calibrated for Pakistani freelancers working on international platforms, including considerations around payment methods (Payoneer, Wise, JazzCash) and common client types.' },
    ],
  },

  'warranty-tracker': {
    metaTitle: 'Free Warranty Tracker Online — Never Miss Expiry',
    metaDesc: 'Track product warranties and get alerts before they expire. Attach receipts, log model numbers. Free, browser-based. No sign-up.',
    heading: 'Free Warranty Tracker — Never Miss a Product Warranty Expiry',
    paras: [
      'Rafiqy\'s Warranty Tracker helps you log product warranties and get notified before they expire. Add your appliances, electronics, furniture, and vehicles with their purchase date and warranty period — the tool shows days remaining and upcoming expirations.',
      'Pakistani consumers often miss warranty windows on appliances, mobile phones, laptops, and vehicles — losing out on free repairs or replacements. This tool keeps all your warranties in one place so you never miss a claim deadline.',
      'Attach receipt photos, model numbers, and service center contacts to each item. All data is stored locally in your browser — no account needed.',
    ],
    faqs: [
      { q: 'What types of warranties can I track?', a: 'Any product: mobile phones, laptops, home appliances (AC, refrigerator, washing machine), vehicles, furniture, tools, and custom items with any warranty period.' },
      { q: 'How far in advance does it alert me?', a: 'You set the alert window: 30, 60, or 90 days before expiry. Items nearing expiry are highlighted in the dashboard.' },
      { q: 'Can I attach receipt photos?', a: 'Yes. Attach receipt images or documents to each warranty entry. Stored locally in your browser\'s localStorage.' },
      { q: 'What happens when a warranty expires?', a: 'Expired warranties are moved to an "Expired" section and kept for reference (useful for knowing the age of appliances). You can delete them when no longer needed.' },
      { q: 'Can I track extended warranties?', a: 'Yes. Add the extended warranty as a separate entry with its own start and end dates and provider information.' },
    ],
  },

  'driving-fines': {
    metaTitle: 'Pakistan Driving Fine Tracker Online | Rafiqy',
    metaDesc: 'Log and track Pakistan traffic fines by city and authority. Never miss a payment deadline. Free, private, offline-capable.',
    heading: 'Pakistan Driving Fine Tracker — Log & Track Traffic Violations',
    paras: [
      'Rafiqy\'s Driving Fine Tracker helps Pakistani drivers log traffic fines, track due dates, and manage payment status across different cities and traffic authorities. Never miss a fine payment deadline again.',
      'Add fines from Islamabad Traffic Police, Punjab Traffic Police, Lahore TEVTA, Karachi Traffic Police, or any other authority. Log the violation type, amount, issue date, and due date. The tool shows outstanding fines and upcoming deadlines.',
      'Keep a history of all your fines for records, insurance purposes, or license renewal documentation. All data is stored locally.',
    ],
    faqs: [
      { q: 'Which traffic authorities are supported?', a: 'Islamabad Traffic Police (ITP), Punjab Traffic Police, Lahore, Karachi, Rawalpindi, Peshawar, and a custom entry for any other authority in Pakistan.' },
      { q: 'Can I track fines for multiple vehicles?', a: 'Yes. Add multiple vehicles (by registration number) and filter fines by vehicle.' },
      { q: 'Does it show payment deadlines?', a: 'Yes. Each fine shows the due date and days remaining. Overdue fines are highlighted in red. Upcoming deadlines appear in your dashboard.' },
      { q: 'Can I attach fine notices or receipts?', a: 'Yes. Attach photos of fine notices and payment receipts to each entry for complete records.' },
      { q: 'Is this connected to any government system?', a: 'No. This is an offline tracking tool. It does not connect to any traffic authority database. You enter your fine information manually.' },
    ],
  },

  'expense-analyzer': {
    metaTitle: 'Free Expense Analyzer Online — Track Spending | Rafiqy',
    metaDesc: 'Analyze spending patterns by category with PKR support. Month-over-month comparisons. Private, browser-based. No sign-up needed.',
    heading: 'Expense Pattern Analyzer — Track & Understand Your Spending',
    paras: [
      'The Expense Pattern Analyzer helps you make sense of where your money goes each month. Add your income and expenses, categorize them, and the tool shows breakdowns by category, spending trends over time, and flags unusual spikes — all privately in your browser.',
      'Unlike banking apps that require account linking, Rafiqy\'s Expense Analyzer stores everything in your browser\'s localStorage. Your financial data never leaves your device — not even a single transaction.',
      'The tool supports PKR natively and understands common Pakistani spending categories: groceries, rent, utilities, school fees, phone bills, and more. Month-over-month comparisons show whether your spending is increasing or decreasing.',
    ],
    faqs: [
      { q: 'Is my financial data stored on a server?', a: 'No. All expense data is stored only in your browser\'s localStorage. Nothing is uploaded, synced, or transmitted.' },
      { q: 'Can I use this for PKR?', a: 'Yes. The tool defaults to PKR and formats amounts in Pakistani style.' },
      { q: 'How do I export my expense data?', a: 'Use the Export button to download your data as a JSON or CSV file. Import it back later or on another browser.' },
      { q: 'What spending categories are supported?', a: 'Food, rent, utilities, transport, health, education, entertainment, shopping, and more. Custom categories can be added.' },
      { q: 'Can I track monthly budgets?', a: 'Yes. Set a monthly budget per category and see colour-coded indicators for over-budget categories.' },
    ],
  },

  'doc-redaction': {
    metaTitle: 'Free Document Redaction Online — Remove Sensitive Info',
    metaDesc: 'Redact sensitive info from PDFs locally. Auto-detects CNICs, emails and phone numbers. Files never leave your browser. Free.',
    heading: 'Smart Document Redaction — Remove Sensitive Information from Files',
    paras: [
      'Rafiqy\'s Smart Document Redaction tool lets you black out (redact) sensitive information from PDFs and documents before sharing. Redact names, CNICs, NTNs, phone numbers, addresses, or any custom pattern — in your browser without uploading to a cloud service.',
      'Select text regions to redact manually, or use pattern-based auto-redaction to find and remove all instances of CNICs, email addresses, phone numbers, or custom regex patterns throughout the document.',
      'Redaction is permanent in the output file — the original text cannot be recovered from the redacted document. Your original file is never uploaded to any server.',
    ],
    faqs: [
      { q: 'What is document redaction?', a: 'Replacing sensitive text or areas in a document with black boxes or blank spaces so the information cannot be read. Used for GDPR compliance, legal submissions, and sharing documents publicly.' },
      { q: 'Can it auto-detect Pakistani CNICs for redaction?', a: 'Yes. The auto-redact feature detects 13-digit CNIC patterns (XXXXX-XXXXXXX-X format) and redacts them automatically throughout the document.' },
      { q: 'Is the redaction truly permanent?', a: 'Yes. The tool replaces redacted content in the output PDF with solid black rectangles. The original text is not present in the output file in any form.' },
      { q: 'What file formats are supported?', a: 'PDF is the primary format. Plain text files and some DOCX files are also supported for text-based redaction.' },
      { q: 'Is my document uploaded to a server?', a: 'No. All redaction processing happens in your browser using pdf-lib. Your document never leaves your device.' },
    ],
  },

  'compress-pdf': {
    metaTitle: 'Compress PDF Online Free — Reduce File Size | Rafiqy',
    metaDesc: 'Compress PDF files online for free. Reduce file size without losing quality. 100% browser-based — your files never leave your device.',
    heading: 'Compress PDF Online Free — Reduce File Size Without Uploading',
    paras: [
      'Need to shrink a PDF before emailing it or uploading to a government portal? Rafiqy\'s PDF Compressor reduces file sizes instantly — entirely in your browser, with nothing uploaded to any server.',
      'Most online PDF compressors upload your files to a remote server, raising privacy concerns for sensitive documents. Rafiqy processes your PDF locally using pdf-lib — your files never leave your device.',
      'Simply drop your PDF, choose a compression quality level, and download. Typical compression reduces file size by 40–70% depending on content. Works on any modern browser.',
    ],
    faqs: [
      { q: 'Does my PDF get uploaded to a server?', a: 'No. Rafiqy\'s PDF compressor runs entirely in your browser using pdf-lib. Your file is processed locally and never leaves your device.' },
      { q: 'How much can it compress a PDF?', a: 'Typically 40–70% for image-heavy PDFs. Text-only PDFs may see 10–30% reduction.' },
      { q: 'Will compression affect PDF quality?', a: 'Higher compression = smaller file but lower image quality. Lower compression keeps quality nearly identical. Choose your balance.' },
      { q: 'What is the maximum PDF size supported?', a: 'No hard limit. Very large PDFs (100MB+) may be slow on older devices. Most use cases (under 50MB) work smoothly.' },
      { q: 'Can I compress a scanned PDF?', a: 'Yes. Scanned (image-based) PDFs often compress significantly. The compressor works on both native and scanned PDFs.' },
    ],
  },

  'merge-pdf': {
    metaTitle: 'Free PDF Merger Online — Combine PDFs | Rafiqy',
    metaDesc: 'Merge multiple PDFs into one file instantly. Reorder pages, no file size limit. 100% browser-based — files never leave your device.',
    heading: 'Free PDF Merger — Combine Multiple PDFs Into One',
    paras: [
      'Rafiqy\'s PDF Merger combines multiple PDF files into a single document instantly — entirely in your browser. No server upload, no account, no file size limits imposed by cloud services.',
      'Upload multiple PDFs, drag to reorder them, then click merge. The output PDF preserves all pages from all input files in your chosen order. Download the merged PDF immediately.',
      'Ideal for: combining scanned documents, merging chapters of a report, assembling application packages, or joining multiple receipts into one file. All processing uses pdf-lib locally.',
    ],
    faqs: [
      { q: 'How many PDFs can I merge at once?', a: 'There is no hard limit. You can merge 2–50+ files. Total processing time depends on combined file size and your device\'s memory.' },
      { q: 'Does it preserve bookmarks and hyperlinks?', a: 'Bookmarks and internal hyperlinks within individual PDFs are preserved. Cross-document links need to be updated manually after merging.' },
      { q: 'Can I reorder pages from different PDFs?', a: 'Yes. After adding all PDFs, you can drag them to reorder the documents. Page-level reordering is available using the Split PDF tool first.' },
      { q: 'Is there a file size limit?', a: 'No cloud-imposed limit. Browser memory is the practical limit. Merging very large PDFs (each 50MB+) may require a modern device with sufficient RAM.' },
      { q: 'Are my PDFs sent to a server?', a: 'No. All merging happens in your browser. Your PDF contents never leave your device.' },
    ],
  },

  'split-pdf': {
    metaTitle: 'Free PDF Splitter Online — Extract Pages | Rafiqy',
    metaDesc: 'Split PDFs by page range, bookmarks or extract every page. Download as ZIP. Browser-based, files stay private. No sign-up.',
    heading: 'Free PDF Splitter — Split a PDF Into Pages or Ranges',
    paras: [
      'Rafiqy\'s PDF Splitter lets you extract specific pages or ranges from a PDF and save them as separate files. No account, no cloud upload, no file size restrictions — all processing in your browser.',
      'Choose how to split: extract a single page, a range of pages (e.g. pages 5–12), every page as a separate file, or split at bookmarks. Download individual pages or all splits as a ZIP file.',
      'Useful for: extracting a single chapter from an ebook, separating scanned pages, extracting a specific form from a multi-page document, or splitting a large report into sections.',
    ],
    faqs: [
      { q: 'How do I extract specific pages from a PDF?', a: 'Upload the PDF, enter the page range (e.g. "5-12" or "3,7,15"), and click Extract. The selected pages are saved as a new PDF.' },
      { q: 'Can I split every page into a separate file?', a: 'Yes. Choose "Split all pages" and the tool creates one PDF file per page. Download all as a ZIP file.' },
      { q: 'Can I split at bookmarks/chapters?', a: 'Yes. If the PDF has bookmarks (chapters), you can split at each bookmark — creating one PDF per chapter automatically.' },
      { q: 'Is there a page limit?', a: 'No. Split PDFs with any number of pages. Very large files may be slow on older devices.' },
      { q: 'Are my PDFs uploaded to a server?', a: 'No. All splitting happens locally in your browser using pdf-lib. Your document never leaves your device.' },
    ],
  },

  'pdf-convert': {
    metaTitle: 'Free PDF Converter Online — To Word & Images | Rafiqy',
    metaDesc: 'Convert PDF to Word, images or text — and vice versa. All conversions run locally. Files never leave your browser. No sign-up.',
    heading: 'Free PDF Converter — Convert PDF to Word, Images & More',
    paras: [
      'Rafiqy\'s PDF Converter transforms PDF files into other formats and converts other files to PDF — entirely in your browser without uploading to a cloud service. Convert PDF to Word (DOCX), images (PNG/JPG), or plain text.',
      'Convert images, Word documents, or text files to PDF. All conversions use client-side libraries — pdf-lib, mammoth, and canvas — so your files never leave your device.',
      'Ideal for: extracting text from PDFs for editing, converting scanned pages to images for web use, or creating PDFs from documents for sharing.',
    ],
    faqs: [
      { q: 'What conversions are supported?', a: 'PDF → Word (DOCX), PDF → Images (PNG/JPG per page), PDF → Text, Images → PDF, Word (DOCX) → PDF, and Text → PDF.' },
      { q: 'Does PDF to Word preserve formatting?', a: 'Basic text formatting (headings, paragraphs, bold/italic) is preserved. Complex layouts with tables, columns, and graphics may need manual adjustment after conversion.' },
      { q: 'What image formats can be converted to PDF?', a: 'JPG, PNG, WEBP, and BMP. Multiple images can be combined into a single PDF in your chosen order.' },
      { q: 'Is there a file size limit?', a: 'No cloud-imposed limit. Large files (50MB+) may be slow depending on your device.' },
      { q: 'Are my files uploaded to a server?', a: 'No. All conversions happen in your browser. Your files never leave your device.' },
    ],
  },

  'doc-converter': {
    metaTitle: 'Free Document Converter — DOCX, PDF & More | Rafiqy',
    metaDesc: 'Convert between DOCX, PDF, RTF and plain text in your browser. No Office or Acrobat needed. Free, private. No sign-up required.',
    heading: 'Free Document Converter — Convert Between Word, PDF, and Text Formats',
    paras: [
      'Rafiqy\'s Doc Converter handles document format conversions that you\'d normally need Microsoft Word or Adobe Acrobat for — right in your browser. Convert DOCX to PDF, PDF to DOCX, RTF to DOCX, or plain text to formatted document.',
      'The tool uses mammoth.js for Word document processing and pdf-lib for PDF operations — both running locally so your documents never leave your browser. No cloud service account required.',
      'Particularly useful in Pakistan where not everyone has Office 365 or Adobe Acrobat licenses. Get professional document conversions for free.',
    ],
    faqs: [
      { q: 'What document formats are supported?', a: 'DOCX (Word), PDF, RTF, ODT, and plain text (.txt). Convert between any supported pair.' },
      { q: 'Does DOCX to PDF preserve styles and fonts?', a: 'Standard styles (headings, body text, lists) are preserved. Custom fonts may fall back to system fonts. Complex page layouts are preserved with best effort.' },
      { q: 'Can I convert a scanned PDF to Word?', a: 'Scanned PDFs (image-based) require OCR first. Use the Text Extractor (OCR) tool to extract text, then the Doc Converter to create a Word document.' },
      { q: 'Is there a page or file size limit?', a: 'No cloud-imposed limits. Processing is done locally. Very large files may be slow on older devices.' },
      { q: 'Are my documents uploaded to a server?', a: 'No. All conversion processing happens in your browser using JavaScript libraries. Your documents never leave your device.' },
    ],
  },

  'text-extractor': {
    metaTitle: 'Free OCR Text Extractor — Images to Text | Rafiqy',
    metaDesc: 'Extract text from images and scanned PDFs using OCR. Supports Urdu, English, Arabic. Files never leave your browser. Free.',
    heading: 'Free OCR Text Extractor — Extract Text from Images & Scanned PDFs',
    paras: [
      'Rafiqy\'s Text Extractor uses OCR (Optical Character Recognition) to extract text from images and scanned PDFs directly in your browser. Upload a photo of a document, receipt, or scanned page — the tool converts it to editable text.',
      'Powered by Tesseract.js running locally, the OCR engine supports English, Urdu, Arabic, and 100+ languages. Your document images never leave your browser — privacy-critical for scanned IDs, financial documents, and medical records.',
      'Use extracted text to copy into documents, search for information, feed into other tools, or build searchable archives from scanned document collections.',
    ],
    faqs: [
      { q: 'What file types are supported?', a: 'JPG, PNG, WEBP, BMP, and scanned PDF files. For best results, use high-resolution images (300 DPI or higher).' },
      { q: 'Does it support Urdu OCR?', a: 'Yes. Urdu OCR is supported using Tesseract\'s Urdu language model. Accuracy is best with clear, printed Urdu text. Handwritten Urdu may have lower accuracy.' },
      { q: 'How accurate is the OCR?', a: 'For clear, high-resolution printed English text: 95%+ accuracy. For Urdu/Arabic printed text: 85-90%. Handwritten text, decorative fonts, and low-resolution scans reduce accuracy.' },
      { q: 'Is my document uploaded to a server for OCR processing?', a: 'No. Tesseract.js runs entirely in your browser. Your documents are never uploaded or processed on any server.' },
      { q: 'Can I extract text from a multi-page PDF?', a: 'Yes. Upload a scanned PDF and the tool processes each page. Text from all pages is combined in the output.' },
    ],
  },

  'pdf-search': {
    metaTitle: 'Free PDF Search Online — Find Text in PDFs | Rafiqy',
    metaDesc: 'Search inside PDFs without uploading. OCR support for scanned documents. Supports Urdu. Free, browser-based, fully private.',
    heading: 'PDF Search — Search Text Inside PDF Files Without Uploading',
    paras: [
      'Rafiqy\'s PDF Search lets you search for any text inside a PDF file directly in your browser. Upload a PDF, type your search term, and instantly see all matching pages with context — no cloud upload required.',
      'For native PDFs (text-based), search is instant. For scanned PDFs (image-based), the tool uses OCR (Tesseract.js) to extract and index the text first, then searches across all pages.',
      'Useful for: searching large reports, finding specific clauses in contracts, locating information in scanned documents, or searching across multiple PDFs on your device.',
    ],
    faqs: [
      { q: 'Does this work on scanned (image-based) PDFs?', a: 'Yes. The tool uses OCR to extract text from scanned PDFs before searching. This takes a moment for large files but is done entirely in your browser.' },
      { q: 'How do I search across multiple PDFs?', a: 'Upload multiple PDFs one by one. Each is indexed locally. Search queries return results from all indexed PDFs with the source filename shown.' },
      { q: 'Does search support Urdu text?', a: 'For native PDFs with embedded Urdu text: yes. For scanned Urdu PDFs: OCR extracts Urdu text using the Urdu language model, then search works on the extracted text.' },
      { q: 'Are my PDFs uploaded to a server?', a: 'No. All PDF parsing, OCR, and search happens entirely in your browser. Your documents never leave your device.' },
      { q: 'Is there a file size limit?', a: 'No hard limit. Very large PDFs (100+ pages) take longer for OCR but work correctly. Native text PDFs search instantly regardless of size.' },
    ],
  },
  'image-suite': {
    metaTitle: 'Free Image Tools Online — Compress & Convert | Rafiqy',
    metaDesc: 'Compress, convert, rotate and watermark images in your browser. JPG, PNG and WebP. Files stay private. Free, instant, no sign-up.',
    heading: 'Free Online Image Tools — Compress, Convert & Watermark',
    paras: [
      'Rafiqy Image Tools Suite gives you four powerful image editing capabilities in one privacy-first tool: compression, format conversion, rotation/flip, and watermarking — entirely in your browser with zero server uploads.',
      'Use the quality slider to reduce JPEG file sizes by up to 80% while maintaining visual clarity. Perfect for compressing product photos, profile pictures, or blog images before uploading them to websites or WhatsApp.',
      'Convert between JPG, PNG and WebP with a single click. WebP offers the best compression for web use, while PNG preserves transparency for logos and graphics.',
      'Add professional watermarks to protect your photography or brand your images. Choose from 9 placement positions, adjust font size, opacity, and color to match your style.',
    ],
    faqs: [
      { q: 'Are my images uploaded to any server?', a: 'No — all processing happens entirely in your browser using HTML5 Canvas. Your images never leave your device.' },
      { q: 'What image formats are supported?', a: 'You can upload JPG, PNG, WebP, GIF, and BMP. Output formats are JPG, PNG, and WebP.' },
      { q: 'How much can I compress an image?', a: 'JPEG quality can be reduced from 100% down to 10%. Typical 80% quality gives great visual results at 40-60% smaller file size.' },
      { q: 'Can I watermark multiple images at once?', a: 'Currently one image at a time. Batch processing is on the roadmap.' },
    ],
  },
  'resume-builder': {
    metaTitle: 'Free Resume Builder Online — Professional CV | Rafiqy',
    metaDesc: 'Build a professional resume with live preview. ATS-friendly templates for Pakistan. Export to PDF. Free, private, no sign-up needed.',
    heading: 'Free Resume Builder — Professional CV in Minutes',
    paras: [
      'Rafiqy Resume Builder helps you create a polished, professional resume without any account or subscription. Fill in your details using the structured form and watch your resume take shape in real-time with the live preview panel.',
      'Choose between the Modern template (bold colored header, clean typography) or the Classic template (two-column layout, traditional styling). Both are ATS-friendly and designed for Pakistani job markets.',
      'Your resume data is auto-saved to your browser — come back any time and pick up where you left off. When ready, export to PDF with one click using your browser\'s built-in print engine.',
      'Add unlimited experience entries, education, skills as chips, projects with tech stacks, and certifications. The builder is structured to match what Pakistani recruiters and international hiring managers look for.',
    ],
    faqs: [
      { q: 'Is my resume data stored on your servers?', a: 'No — everything is saved to your browser\'s localStorage. Rafiqy never sees your personal information.' },
      { q: 'How do I export my resume to PDF?', a: 'Click the "Export PDF" button. Your browser\'s print dialog will open — select "Save as PDF" as the destination.' },
      { q: 'Can I use this for Pakistani job applications?', a: 'Absolutely. The form includes fields relevant to Pakistani CVs and the templates are widely accepted by local and international companies.' },
      { q: 'Can I have multiple resumes?', a: 'Currently one resume is saved at a time. You can export to PDF and start a new one anytime.' },
    ],
  },
  'whatsapp-tools': {
    metaTitle: 'Free WhatsApp Tools Online — Format & Links | Rafiqy',
    metaDesc: 'Format WhatsApp messages, create templates and generate wa.me links. Pakistan number support. Free, private, no sign-up needed.',
    heading: 'WhatsApp Tools — Format, Template & Link Generator for Pakistan',
    paras: [
      'Rafiqy WhatsApp Tools is a free toolkit for power users and small business owners who rely on WhatsApp for communication. Format messages with bold, italic, and strikethrough before sending, so you always get the look right without trial and error.',
      'The Template Builder lets you create reusable message templates with {{variable}} placeholders — perfect for order confirmations, appointment reminders, or bulk outreach. Fill in the variables and copy the final message in seconds.',
      'Generate professional wa.me links for your business with Pakistan number auto-formatting. Share your WhatsApp link on websites, Instagram bios, or business cards — customers click once and start a conversation.',
      'The Message Counter tells you exactly how many characters and message parts your text uses, including special handling for Urdu/Arabic RTL text which encodes differently than Latin characters.',
    ],
    faqs: [
      { q: 'Does Rafiqy WhatsApp Tools send messages on my behalf?', a: 'No — this is a formatting and utility tool only. You copy the text and send it yourself through WhatsApp.' },
      { q: 'How does Pakistan number formatting work?', a: 'Enter your number in any common format (03xx-xxxxxxx, 03xxxxxxxxx, +923xxxxxxxxx) and the tool automatically converts it to the international wa.me format (+92...).' },
      { q: 'How many templates can I save?', a: 'You can save up to 5 templates locally in your browser.' },
      { q: 'Does the formatter work with Urdu text?', a: 'Yes — WhatsApp formatting (bold, italic, etc.) works the same way for Urdu text. The character counter also detects RTL text.' },
    ],
  },
}

export default TOOL_SEO
