# Rafiqy Operations Playbook

This is the **one operational document** to use for keeping `rafiqy.app` current.

Use this doc for:
- tool updates
- decision-system data refresh
- blog refresh
- SEO maintenance
- analytics review
- policy / legal / market-sensitive changes
- technical upkeep

If you only check one document to run the site properly, use this one.

---

## 1. Priority Order

If time is limited, work in this order:

1. `Pakistan tax cluster`
2. `Solar cluster`
3. `Investment cluster`
4. `Rent vs Buy cluster`
5. `EV / Hybrid / Petrol cluster`
6. `Salary / Freelance cluster`
7. everything else

Reason:
- these are the highest-risk freshness areas
- these are also the strongest SEO and business-value pages

---

## 2. Update Calendar

## Daily

No full review needed daily.

Only do something daily if:
- a user reports a broken tool
- a live API fails
- production deploy breaks
- a policy or rate change becomes obvious

Daily quick check when needed:
- homepage loads
- `/tools` loads
- top money pages load
- feedback form works
- GA4 / Search Console do not show sudden collapse

---

## Weekly

Review every week:

### A. Pakistan-sensitive tools
- Pakistan Tax Calculator
- Tax Shield Optimizer
- Salary Slip Generator
- Pakistan Solar Calculator
- Pakistan ID & Tax Hub
- Gold & Silver Calculator
- Currency Converter

### B. Check for real-world changes
- FBR or Finance Act changes
- filer / non-filer changes
- NEPRA / DISCO changes
- net billing / buyback changes
- fuel / electricity pricing shifts
- gold-related reference wording if any “today” copy is exposed

### C. SEO / content quick review
- inspect Search Console for top Pakistan pages
- check CTR drops on money pages
- watch for FAQ/schema issues
- check that sitemap is still reflecting the newest URLs

### Weekly actions
- update assumptions if something real changed
- update affected support blogs
- update visible “last updated” / freshness wording if needed
- request reindexing for materially changed pages

---

## Monthly

This is the main operating cycle.

### A. Review all decision systems

Review these every month:
- Pakistan Solar Calculator
- Rent vs Buy Pakistan Analyzer
- Petrol vs Hybrid vs EV Pakistan
- Salary Offer Evaluator Pakistan
- Freelance Tax and Reserve Planner
- Investment Allocation Planner Pakistan

For each one, check:
- assumptions
- presets
- guidance text
- decision-path wording
- support blog cluster
- internal links from tool to blogs and back
- metadata relevance

### B. Review all high-value Pakistan utility pages
- Pakistan Tax Calculator
- Salary Slip Generator
- Pakistan ID & Tax Hub
- Gold & Silver Calculator
- Kameti Tracker
- Driving Fine Tracker
- Expense Pattern Analyzer

For each one, check:
- factual correctness
- examples
- current-year references
- trust/disclaimer wording

### C. Review analytics and search
- top landing pages by sessions
- top landing pages by impressions
- low CTR pages with high impressions
- pages with rising impressions but weak engagement
- pages with traffic but weak conversion into deeper tool usage

### D. Monthly actions
- improve 1 to 2 best-performing clusters only
- do not spread effort evenly across everything
- publish or update support content where demand is already visible

---

## Quarterly

Review every quarter:

### A. Stable but important tools
- Typing Tutor
- Urdu Keyboard
- Word Counter
- Text Formatter
- Doc Composer
- Pomodoro
- World Time Converter
- Daily Planner
- Habit Tracker
- Voice Diary
- Loan EMI Calculator
- Loan Manager
- Bill Splitter
- Property Comp Adjuster
- Position Size Calculator
- Voice-to-Invoice
- Warranty Tracker
- AI Resume Builder
- Age Calculator
- Unit Converter
- QR Code Generator
- WhatsApp Tools

### B. Health / education / business tools
- Drug Interaction Checker
- Symptom Context Tracker
- Measurement Tracker
- Student Group Randomizer
- Timeline Builder
- Refrigerant Leak Calculator
- Freelancer Risk Analyzer

### Quarterly actions
- check UX quality
- check browser compatibility
- check examples / presets
- check if tool still deserves homepage/category prominence
- update internal links if better related tools now exist

### Quarterly SEO review
- refresh old support articles that still matter
- improve titles / descriptions of pages with poor CTR
- promote clusters that are starting to win
- de-emphasize pages with no traction if needed

---

## Every 6 Months

Review every 6 months:

### Developer / privacy / PDF utilities
- Regex Tester
- JSON Formatter
- Text Diff Checker
- Data Transformer
- Markdown Scraper
- Log Analyzer
- Config Converter
- Mock Data Generator
- Trace Correlator
- Schema Mapper
- Text Encryptor
- Data Leak Detector
- Smart Document Redaction
- Password Generator
- Compress PDF
- Merge PDF
- Split PDF
- PDF Convert
- Doc Converter
- Text Extractor (OCR)
- PDF Search
- Image Tools Suite

### 6-month actions
- dependency health review
- browser/API compatibility review
- performance review on larger inputs
- UI polish review
- no factual-content refresh needed unless the tool has live dependencies

---

## Annual

Do this once a year:
- full content architecture review
- category order review
- homepage positioning review
- decide which clusters deserve expansion next year
- archive or de-prioritize low-value tools
- review whether brand/message still reflects the product

Also do a yearly audit of:
- structured data coverage
- sitemap completeness
- privacy / disclaimer pages
- stale year labels
- screenshots / preview branding

---

## 3. Event-Driven Triggers

Act immediately when any of these happen.

### Pakistan tax trigger
- federal budget
- Finance Act
- FBR clarification
- filer / non-filer change
- salary tax slab change
- tax-credit treatment change

Affected first:
- Pakistan Tax Calculator
- Tax Shield Optimizer
- Salary Slip Generator
- Pakistan ID & Tax Hub
- Salary Offer Evaluator Pakistan
- Freelance Tax and Reserve Planner

### Solar / utility-cost trigger
- NEPRA update
- DISCO meter fee change
- net billing / buyback change
- electricity tariff regime change
- major installer-cost regime shift

Affected first:
- Pakistan Solar Calculator
- solar support blogs
- EV / Hybrid / Petrol tool if electricity / fuel economics moved materially

### Investment / category trigger
- MUFAP category framing change
- SECP guidance change
- material product-class change affecting mapping language

Affected first:
- Investment Allocation Planner Pakistan
- investment support cluster

### API / browser trigger
- API response changes
- speech / clipboard / PDF / OCR browser behavior change
- external service deprecation

Affected first:
- Currency Converter
- Drug Interaction Checker
- Voice Diary
- Voice-to-Invoice
- PDF tools
- OCR / extraction tools

---

## 4. Cluster-by-Cluster Playbook

## Tax Cluster

Main pages:
- Pakistan Tax Calculator
- Tax Shield Optimizer
- Salary Slip Generator
- Pakistan ID & Tax Hub

When:
- weekly in active tax season
- immediately on policy change

What to do:
- update slab logic
- update credit/deduction wording
- update FY labels
- update supporting tax blogs
- inspect schema / FAQ / title accuracy

---

## Solar Cluster

Main pages:
- Pakistan Solar Calculator
- solar support blogs

When:
- monthly
- immediately on NEPRA / DISCO / tariff shift

What to do:
- update tariff / buyback / cost assumptions
- update battery guidance if market pricing shifts
- refresh bill-based support pages
- refresh “smaller system vs NB” logic if policy changed

---

## Investment Cluster

Main pages:
- Investment Allocation Planner Pakistan
- investment support blogs

When:
- monthly
- immediately if category framing or tax treatment assumptions materially change

What to do:
- review category mapping
- review hedge guidance
- review multi-goal logic copy
- update support content for major use cases

---

## Rent vs Buy Cluster

Main pages:
- Rent vs Buy Pakistan Analyzer
- rent vs buy support blogs

When:
- monthly

What to do:
- review city presets
- review markup assumptions
- review down-payment / liquidity framing
- refresh stay-horizon support content

---

## EV / Hybrid / Petrol Cluster

Main pages:
- Petrol vs Hybrid vs EV Pakistan
- support blogs

When:
- monthly

What to do:
- review petrol baseline
- review electricity baseline
- review charging practicality copy
- add support pages for rising real queries

---

## Salary / Freelance Cluster

Main pages:
- Salary Offer Evaluator Pakistan
- Freelance Tax and Reserve Planner
- support blogs

When:
- monthly

What to do:
- review city-cost baselines
- review reserve heuristics
- review negotiation / cross-city guidance
- review owner-pay / reserve-separation guidance

---

## 5. What to Check Per Page Type

## For every tool page
- title still strong?
- meta description still accurate?
- current year / current policy wording still valid?
- FAQs still true?
- internal links still the right ones?
- support cluster still exists and is relevant?
- if assumptions changed, update visible freshness wording

## For every blog post
- does it still reflect current reality?
- are examples outdated?
- does it link to the right tool?
- does the tool link back?
- is the CTA still the best next step?
- does the title still match the real search intent?

## For category pages
- are the best tools still featured first?
- are low-value tools taking too much space?
- does the category reflect current strategy?

## For homepage and `/tools`
- do the right flagship tools appear first?
- are the decision systems ordered correctly?
- do featured blogs support current priorities?
- does brand positioning still match the product?

---

## 6. Monthly Workflow

Run this once per month:

1. Open Search Console.
2. Review top impression pages.
3. Review low-CTR high-impression pages.
4. Open GA4.
5. Review top landing tools and engagement.
6. Pick 1 or 2 clusters only.
7. Update assumptions or content in those clusters.
8. Update sitemap if URLs changed.
9. Request indexing for materially changed pages.
10. Log what was updated and why.

Do not try to refresh everything every month.

---

## 7. Quarterly Workflow

1. Review all non-sensitive tools for UX and technical health.
2. Reorder homepage / tools / category surfaces if user behavior changed.
3. Refresh older support content that still matters.
4. Decide which cluster gets the next deepening pass.

---

## 8. Technical Maintenance

Review regularly:
- build still passes
- GA4 still tracking
- sitemap still current
- `llms.txt` still matches the platform
- manifest / PWA naming still correct
- CSP still allows required services
- feedback form still works

Cadence:
- monthly for production checks
- after any major deploy

---

## 9. Content / SEO Maintenance

Every month:
- inspect new queries in Search Console
- tighten titles/descriptions where CTR is weak
- refresh blog intros if query intent has sharpened
- improve internal linking between tool and support pages

Every quarter:
- update the winning clusters
- merge or de-prioritize weak content patterns
- review whether categories still make sense

---

## 10. Decision Rule

If you are unsure whether a page needs updating, ask:

1. Has the underlying fact changed?
2. Has user demand changed?
3. Has the product ordering changed?
4. Is the page getting impressions but underperforming?
5. Is the page important enough to deserve immediate attention?

If the answer is “yes” to any of the first four and the page is high-priority, update it now.

---

## 11. Fast Summary

### Update weekly
- tax
- solar
- ID/tax hub
- currency
- gold copy if any live implication exists

### Update monthly
- all decision systems
- Pakistan money pages
- top blogs in active clusters

### Update quarterly
- stable flagship tools
- support clusters
- homepage / tools / category ordering

### Update every 6 months
- developer tools
- privacy tools
- PDF tools
- other stable utilities

### Update immediately on trigger
- budget
- FBR change
- NEPRA / DISCO change
- MUFAP / SECP change
- browser / API breakage

This is the maintenance rhythm for keeping Rafiqy current without guessing.
