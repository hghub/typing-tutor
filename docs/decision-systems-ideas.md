# Decision Systems Roadmap

This document defines how `Rafiqy` should evolve from a broad utility site into a focused `decision intelligence platform`.

It consolidates:
- earlier Rafiqy planning notes
- the extracted `decision-systems.docx` concepts
- the current flagship `Solar Planner`

The goal is not to ship many shallow calculators. The goal is to ship a small number of high-trust, high-utility systems that:
- solve real decisions people revisit often
- create strong Pakistan-first SEO wedges
- can later expand into reports, APIs, and AI-assisted guidance

## Product Thesis

Rafiqy should have three layers:

1. `Utility tools`
Small, fast, browser-based helpers.

2. `Decision systems`
Structured tools that compare options, model tradeoffs, explain why a recommendation changed, and expose assumptions.

3. `Decision intelligence platform`
A shared framework for scenarios, weighted scoring, confidence, sensitivity, risk flags, reports, saved states, and future AI explanation.

The decision-systems layer is where Rafiqy can become differentiated.

## Core Principles

- `Pakistan first, not Pakistan only`
Start with Pakistan-flavored economics, pricing, policies, and tradeoffs where competition is weaker and user need is sharper.

- `Decision support, not fake certainty`
Outputs must show assumptions, sensitivity, risk flags, and update dates. No tool should pretend to be official advice.

- `Text + engine together`
Each decision system needs both a tool page and supporting explanation content. Tools alone are weak SEO.

- `Shared engine`
The long-term win is not separate one-off calculators. It is a reusable decision framework with:
  - normalized inputs
  - market-data config
  - scenario engine
  - scoring model
  - recommendation rules
  - explanation layer

- `Update discipline`
If a tool depends on prices, tariffs, tax slabs, resale, lending rates, migration rules, or tuition assumptions, the update cadence must be defined before launch.

## Portfolio Prioritization

### Tier 1: Build These First

These have the best mix of demand, SEO potential, user utility, and reusable decision logic.

1. `Pakistan Solar Decision Engine`
Current tool evolution of `Solar Planner`.

Why:
- already exists
- high pain, high value, high conversion intent
- excellent support-content depth
- naturally becomes a decision system, not just a calculator

Primary decisions:
- should I go solar now?
- what system size fits my bill?
- on-grid vs hybrid?
- battery or no battery?
- payback under current net billing reality?

Update cadence:
- `monthly` for panel, inverter, battery, buyback, tariff assumptions
- `quarterly` for installer cost ranges and financing assumptions

2. `Rent vs Buy Pakistan Analyzer`

Why:
- classic recurring decision
- strong SEO if localized to Pakistan
- great for scenario comparison and explanation pages

Primary decisions:
- rent or buy in my city?
- buy now or wait?
- what if property prices rise faster than rent?
- what if I invest the down payment instead?

Update cadence:
- `monthly` for mortgage/markup assumptions
- `quarterly` for rent yield, property appreciation, and city cost benchmarks

3. `Petrol vs Hybrid vs EV Pakistan`

Why:
- strong recurring debate
- naturally shareable
- high-intent comparison keywords
- has a clear data-update model

Primary decisions:
- which powertrain is cheapest over 5 years?
- does EV still make sense with load shedding?
- does hybrid dominate for city driving?

Update cadence:
- `monthly` for fuel, electricity, financing, and broad maintenance assumptions
- `quarterly` for resale assumptions and model reference pricing

4. `Salary Offer Evaluator Pakistan`

Why:
- strong practical value
- links salary, tax, commute, inflation, city costs, benefits
- useful for students, professionals, and migration-adjacent users

Primary decisions:
- is this offer actually better after tax and commute?
- should I switch cities for this job?
- what does the offer mean in monthly take-home terms?

Update cadence:
- `monthly` for tax logic if active fiscal year changed
- `quarterly` for city cost-of-living and commute assumptions

5. `Freelance Tax and Reserve Planner`

Why:
- highly useful for Pakistan freelancers
- strong overlap with tax content cluster
- practical retention tool

Primary decisions:
- how much of each payment should I reserve?
- what is safe monthly spending?
- what if client payments are irregular?

Update cadence:
- `monthly` for tax assumptions if needed
- `quarterly` for dollar/PKR sensitivity presets and reserve heuristics

### Tier 2: Build After Tier 1

6. `Car Financing vs Cash Decision Tool`

Why:
- useful, but narrower than powertrain choice
- can share logic with salary and cashflow tools

Update cadence:
- `monthly` for markup rates and inflation assumptions

7. `Move Abroad vs Stay Pakistan`

Why:
- emotionally powerful and shareable
- strong content potential
- but high complexity and higher trust risk

Why not Tier 1:
- too many non-financial variables
- needs careful scoping to avoid becoming shallow or misleading

Update cadence:
- `monthly` for FX assumptions
- `quarterly` for city salary/cost benchmarks
- `event-driven` when visa or policy assumptions materially change

8. `School Fee Planner`

Why:
- sticky household planning problem
- good Pakistan-market need
- less universal traffic than the top 5

Update cadence:
- `quarterly`
- `back-to-school seasonal refresh`

### Tier 3: Later or Conditional

- `Job vs Business Decision Engine`
- `Buy Now vs Wait Analyzer`
- `City Move Decision Tool`
- `Marriage Budget Decision Planner`
- `Study Abroad ROI Analyzer`
- `Appliance Upgrade / Energy Bill Optimizer`

These can be excellent later, but they should not dilute the first portfolio.

## Recommended Naming

Rafiqy should use explicit, search-friendly names on public pages.

- `Pakistan Solar Decision Engine`
SEO-facing variation:
`Pakistan Solar Calculator`

- `Rent vs Buy Pakistan Analyzer`
SEO-facing variation:
`Rent vs Buy Calculator Pakistan`

- `Petrol vs Hybrid vs EV Pakistan`
SEO-facing variation:
`Petrol vs Hybrid vs EV Cost Calculator Pakistan`

- `Salary Offer Evaluator Pakistan`
SEO-facing variation:
`Salary Offer Calculator Pakistan`

- `Freelance Tax and Reserve Planner`
SEO-facing variation:
`Freelance Tax Planner Pakistan`

Rule:
- product name can be slightly richer
- title tag, H1, and URL should stay close to search language

## Solar Planner: Promote It Into A Full Decision System

Current `Solar Planner` should be reframed as the first flagship decision system.

Recommended evolution:

### V1

- electricity bill based sizing
- city-based sun hours
- battery vs no battery recommendation
- on-grid vs hybrid comparison
- cost range
- savings estimate
- payback range
- assumptions panel
- update date
- shareable result summary

### V2

- cash vs financed solar
- battery backup hours estimate
- net billing sensitivity
- seasonal generation view
- appliance/load planner
- installer quote comparison input

### V3

- tariff scenario simulation
- rooftop suitability checklist
- city-specific installer benchmark dataset
- AI explanation of recommendation

Update cadence for solar base data:
- `monthly`: panel range, inverter range, battery range, buyback assumptions, tariff heuristics
- `quarterly`: install labor ranges, financing assumptions
- `event-driven`: NEPRA / policy changes, major tax or import changes

## Decision-System Architecture

All decision systems should follow the same shape.

### 1. Input Layer

- user profile inputs
- scenario toggles
- confidence or uncertainty inputs where relevant
- presets for common cases

### 2. Market Data Layer

This must be config-driven, not hardcoded across components.

Suggested fields:
- `last_updated`
- `refresh_frequency_days`
- `effective_from`
- `effective_to`
- `source_notes`
- `validation_range`

### 3. Calculation Layer

- deterministic formulas
- no silent magic numbers
- named intermediate variables

### 4. Scoring Layer

Shared concepts:
- cost score
- convenience score
- risk score
- resilience score
- optional lifestyle fit score

### 5. Recommendation Layer

Output should include:
- recommendation
- alternatives
- reason trace
- sensitivity note
- confidence level
- risk flags

### 6. Report Layer

Every decision system should eventually support:
- copy summary
- downloadable report
- scenario compare
- saved state

## Shared Data Refresh Policy

Use this as the operating rule.

### Monthly updates

Use monthly refresh for:
- fuel prices
- electricity tariffs
- broad lending/markup assumptions
- tax slab references when fiscal-year-sensitive
- solar equipment price ranges
- FX-sensitive assumptions where the tool depends on imports

### Quarterly updates

Use quarterly refresh for:
- resale assumptions
- city benchmark costs
- rent yield ranges
- school fee benchmarks
- salary benchmark presets
- maintenance-cost ranges

### Event-driven updates

Update immediately when:
- fiscal year tax slabs change
- net billing / solar policy changes
- major lending or fuel policy changes
- visa or migration rules change in tools that depend on them

### Per-tool freshness banner

Every decision-system page should show:
- `Last updated`
- `Data cadence`
- `What was refreshed`
- `What is still estimated`

## SEO Plan

Decision systems need a different SEO playbook than generic utilities.

### Tool-page SEO rules

Every decision system should have:
- one primary intent page
- one exact-search-friendly slug
- visible H1 matching intent
- assumptions section
- FAQ section
- comparison language
- clear disclaimer
- related-tool links
- related-guide links

### Supporting content cluster

Each decision system should have at least:
- `1 money page`
- `3 to 5 supporting explainers`
- `1 scenario page`
- `1 comparison page`

Example for rent vs buy:
- `/tools/rent-vs-buy-calculator-pakistan`
- `/blog/rent-vs-buy-in-pakistan-guide`
- `/blog/home-loan-vs-rent-pakistan`
- `/blog/down-payment-vs-investment-pakistan`
- `/blog/when-renting-is-better-than-buying-in-pakistan`

### Pakistan-first keyword framing

Prefer:
- `... Pakistan`
- city-specific variants where useful
- fiscal year / current-year titles where appropriate

Avoid leading with broad global terms first when the local wedge is stronger.

### Content under each tool

Minimum sections:
- what this tool decides
- how it works
- assumptions
- examples
- when the recommendation changes
- FAQs

### Internal linking

Every decision system must link to:
- adjacent decision tools
- supporting explainers
- glossary/reference content

Example:
- Solar links to electricity bill optimizer and battery explainers
- Rent vs buy links to home-loan and salary tools
- EV tool links to financing and salary tools

## Best First Build Order

This is the recommended implementation sequence.

1. `Upgrade Solar Planner` into a proper decision engine
2. `Build Rent vs Buy Pakistan Analyzer`
3. `Build Petrol vs Hybrid vs EV Pakistan`
4. `Build Salary Offer Evaluator Pakistan`
5. `Build Freelance Tax and Reserve Planner`

Why this order:
- solar already exists
- rent/buy and EV create strong adjacent decision categories
- salary and freelance tax deepen the finance/work cluster

## Scope Definition For Each New System

Before building any new decision tool, write these six things first:

1. `Decision statement`
What exact question is this tool helping the user decide?

2. `Output promise`
What specific output will the user get?

3. `Input burden`
Can a first-time user complete it in under 90 seconds?

4. `Data dependency`
What needs monthly, quarterly, or event-driven refresh?

5. `Trust risk`
Could stale data materially mislead the user?

6. `SEO support`
What supporting pages will launch with it?

If a concept is weak on those six points, do not build it yet.

## Immediate Next Steps

1. Reposition `Solar Planner` publicly as the first decision system.
2. Define a shared JSON/config pattern for market-data-driven tools.
3. Write product briefs for:
   - `Rent vs Buy Pakistan Analyzer`
   - `Petrol vs Hybrid vs EV Pakistan`
   - `Salary Offer Evaluator Pakistan`
4. Pair each brief with an SEO cluster brief before implementation.
5. Build a reusable result-report pattern so all decision systems feel like one product family.

## Final Direction

Rafiqy should stop looking like only a tool shelf and start looking like:

- a practical decision-support brand
- rooted in Pakistan realities first
- expandable to global comparisons later
- capable of becoming an API and AI-assisted platform later

That means:
- fewer random tools
- more depth
- stronger update discipline
- stronger explanation content
- stronger trust signals
- one reusable decision framework across products
