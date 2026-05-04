# Decision Systems Execution Briefs

This document converts the roadmap into build-ready briefs for the first portfolio wave on `rafiqy.app`.

## 1. Pakistan Solar Decision Engine

Current live route:
- `/tools/solar-planner`

Public positioning:
- product label: `Pakistan Solar Calculator`
- category: `Decision Systems`

Decision statement:
- Should I install solar now, and if yes, what size and configuration makes sense?

Primary user outputs:
- recommended system size
- install cost range
- monthly savings estimate
- post-solar bill estimate
- payback range
- battery recommendation
- net-billing vs self-consumption interpretation

Data dependencies:
- import tariff assumptions
- buyback assumptions
- panel/inverter/battery cost ranges
- city sun-hour presets

Update cadence:
- monthly: tariffs, buyback assumptions, equipment ranges
- quarterly: installer labor and financing assumptions
- event-driven: NEPRA / policy changes

Next implementation scope:
- add financing scenario
- add net-billing sensitivity slider
- add battery backup-hour estimate
- add installer quote comparison mode
- add stronger result-report export

SEO cluster:
- money page: `Pakistan Solar Calculator`
- support pages:
  - `5kW Solar System Price in Pakistan`
  - `Net Billing in Pakistan Explained`
  - `How Much Solar Do I Need for My Bill in Pakistan?`

## 2. Rent vs Buy Pakistan Analyzer

Live route:
- `/tools/rent-vs-buy-calculator-pakistan`

Decision statement:
- Is renting or buying the better financial move for my expected stay horizon in Pakistan?

Primary user outputs:
- owner net cost
- renter net cost
- monthly EMI
- owner net worth vs renter invested value
- rough break-even horizon
- recommendation trace

Critical assumptions:
- property appreciation
- rent growth
- markup rate
- transfer friction
- maintenance
- opportunity-cost return

Update cadence:
- monthly: markup defaults
- quarterly: city preset appreciation/rent baselines

V2 scope:
- city-specific presets by area tier
- cash purchase vs financed purchase
- down-payment financing stress test
- family-size scenario presets

SEO cluster:
- money page: `Rent vs Buy Calculator Pakistan`
- support pages:
  - `Rent vs Buy in Pakistan Guide`
  - `Home Loan vs Rent Pakistan`
  - `When Renting Is Better Than Buying in Pakistan`
  - `How Much Down Payment Do You Need in Pakistan?`

## 3. Petrol vs Hybrid vs EV Pakistan

Live route:
- `/tools/petrol-vs-hybrid-vs-ev`

Decision statement:
- Which powertrain is the best total decision for my daily usage and Pakistan infrastructure reality?

Primary user outputs:
- 5-year TCO by option
- monthly running cost
- recommendation
- confidence
- convenience/risk-aware score
- reason trace

Critical assumptions:
- fuel price
- electricity tariff
- purchase price by option
- maintenance
- resale
- charging availability
- load shedding

Update cadence:
- monthly: fuel, electricity, price and maintenance assumptions
- quarterly: resale assumptions

V2 scope:
- financing mode
- solar-at-home advantage mode
- model-specific presets
- charger-installation cost

SEO cluster:
- money page: `Petrol vs Hybrid vs EV Cost Calculator Pakistan`
- support pages:
  - `Is EV Worth It in Pakistan?`
  - `Hybrid vs Petrol Car Cost in Pakistan`
  - `EV Charging Cost in Pakistan`
  - `Best Car Type for City Driving in Pakistan`

## 4. Salary Offer Evaluator Pakistan

Live route:
- `/tools/salary-offer-calculator-pakistan`

Decision statement:
- Is this job offer actually better than my current role after tax, benefits, commute, and city costs?

Primary user outputs:
- annual gross
- estimated annual tax
- after-tax take-home
- total annual value including benefits
- discretionary buffer
- recommendation versus current role

Critical assumptions:
- tax year logic
- city living-cost baselines
- commute cost
- benefits valuation

Update cadence:
- monthly: tax logic if fiscal-year-sensitive
- quarterly: city-cost baselines

V2 scope:
- family-size adjustment
- child-schooling impact
- relocation-city comparison
- inflation-adjusted value view

SEO cluster:
- money page: `Salary Offer Calculator Pakistan`
- support pages:
  - `How to Evaluate a Job Offer in Pakistan`
  - `Take Home Salary Calculator Pakistan`
  - `Is a Higher Salary Worth a City Move?`

## 5. Freelance Tax and Reserve Planner

Live route:
- `/tools/freelance-tax-planner-pakistan`

Decision statement:
- How much should I reserve for tax, business volatility, and emergency runway before deciding what I can safely spend?

Primary user outputs:
- monthly tax reserve
- monthly operating reserve
- emergency-fund top-up
- suggested owner pay
- reserve-health score

Critical assumptions:
- annual revenue baseline
- monthly business costs
- monthly home costs
- reserve target
- emergency target

Update cadence:
- monthly: tax logic if changed
- quarterly: reserve heuristics and best-practice presets

V2 scope:
- dollar-income / PKR-expense mode
- irregular client scenario presets
- quarterly-tax calendar prompts
- save/export reserve plan

SEO cluster:
- money page: `Freelance Tax Planner Pakistan`
- support pages:
  - `How Much Tax Should Freelancers Reserve in Pakistan?`
  - `Freelance Emergency Fund Calculator`
  - `How Much Should a Freelancer Pay Themselves?`

## Shared Platform Work

These tools should converge over time on one reusable framework:
- shared result-report pattern
- shared scoring model primitives
- shared freshness/update banner
- shared scenario compare module
- shared export/share summary module

## Immediate Follow-ups

1. Validate the four new live routes and the updated solar positioning.
2. Add support content for each new money page.
3. Add freshness/update banners inside the decision-system pages.
4. Add a dedicated decision-systems landing page later if the cluster grows beyond five tools.
