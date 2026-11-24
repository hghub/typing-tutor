# Solar correctness review — 24 November 2026

Status: prepared on guarded `codex/rafiqy-solar-review`, based on `35acd585ef8f99b7f4438243f133c7156ff8833a`. Not approved or deployed. This branch inherits every earlier unpublished review batch. A solar-only approval must isolate this diff onto the approved production source `32484f5` before deployment; otherwise review the exact combined source. Do not deploy stale main `6c4651a`.

## What changed and why

The old solar wizard mixed unverified market/GST/DISCO/battery assertions with a December 2025 policy date and a fixed PKR 11 export rate. It inferred consumption from an assumed tariff, offered unsupported recommendations/confidence, excluded some costs from headline payback, and returned 30 years when recovery never occurred.

The same route now provides a transparent quote-based scenario. Users enter measured monthly kWh, quoted capacity, yield/loss/self-use assumptions, avoidable import-energy charge, optional verified export rate, complete installation quote, additional connection/battery costs, maintenance, annual generation decline and one optional replacement. Self-use is capped by consumption; surplus is either exported or unvalued/curtailed. Costs are counted once. The annual table shows nominal net cashflow and recovery sustained through year 30, including a later replacement that can reverse early recovery. No recovery is displayed as not reached.

Intentional scope change: removed automatic city/bill-to-size and appliance wizard, market price/battery brand tables, recommendation/confidence heuristics and the old PDF report. Copy and text download carry every entered assumption and model limitation. There is no replacement PDF feature. Battery price is counted without inventing dispatch, backup hours or extra self-use. No live tariff/price lookup, finance, discounted valuation, full bill, tax eligibility, roof/electrical design or legacy net-metering engine is supplied. Inputs remain in calculator page memory and reset on reload. Other site features retain separate data handling. Solar's shared trust notice is explicitly scoped; broader site badges/copy are not claimed repaired.

All eight directly paired solar markdown guides, generated articles, SEO/FAQs, tool registry, usage copy and sitemap dates agree. The existing canonical routes remain. The model repeats one 30-day month twelve times, with annual generation decline: seasonal/hourly variation is not simulated. Starting numbers are synthetic, not refreshed market evidence. No new market/tax/export-rate number is asserted.

## Primary source verification

NEPRA Legal index and final official PDFs were retrieved on 24 November 2026. The scanned 2 April notification was downloaded and visually checked. Base regulations PDF page 6 (printed page 5) was visually checked for meter procurement, metering and billing. April fee and August approval PDFs were read from official parsed text. See `src/data/solarPolicy.js` for exact official URLs, also linked in each guide.

- SRO 251, 9 February 2026: new net billing; imports at applicable tariff, exports at national average energy purchase price; regulation 14 permits next-cycle credit or quarterly payment, and the Authority may revise the export rate. No current numeric NAEPP has been verified/imported.
- SRO 547, 2 April 2026: valid pre-commencement agreements retain their old rate/mechanism until expiry, subject to the material-modification exception; deemed effective 9 February. Legacy billing is excluded from this engine.
- SRO 709, 28 April 2026, effective 9 February: Authority concurrence fee nil through 25 kW; PKR 1,000/kW above. These are not total connection charges.
- SRO 1330, 6 August 2026: facilities of 25 kW or below do not need Authority concurrence; the concerned licensee accords approval. Other applicable connection requirements remain.
- Regulations 5/13 allow one bidirectional meter or two meters; regulation 12 permits direct procurement when licensee meters are unavailable, subject to testing. Removed unsupported universal separate-meter/private-purchase-ban claims.

The legal summary is bounded to these instruments, not a guarantee of project approval, individual agreement interpretation or absence of later directions. No financial/regulatory update to other tax, fuel, gold, currency or finance tools is implied.

## Checks and observed results

- 91 combined tests pass, including 8 new solar tests. Coverage includes the synthetic golden calculation, 24 energy-conservation/load-cap/export-mode scenarios, additional costs, replacement counted once, degradation, negative benefit, unrecoverable investment, later reversal, invalid/blank/nonfinite/bounds, summary assumptions and input immutability.
- Guide regression test checks the complete official PDF hrefs in all eight generated guides. It caught markdown truncation at parentheses; source URLs now percent-encode those parentheses and the check passes.
- Scoped ESLint and diff whitespace checks pass. Full production build/QA checks 159 prerendered routes / 115 posts; final build repeated after source-link repairs.
- Actual local Chromium interactions: synthetic baseline 600 generated / 360 self-used / 240 unvalued kWh, PKR 850,000 upfront, PKR 162,800 first-year benefit and end-year 6 sustained recovery. Export rate 10 + battery cost 200,000 gives PKR 1,050,000 upfront and separate PKR 2,400 monthly credit, with no extra self-use invented. Clipboard contains matching inputs/results/limits. Blank kWh suppresses results and export controls. Zero avoided rate/no export reaches no recovery. Cashflow audit has 30 data rows.
- At ordinary browser zoom 400%, actual viewport 340 CSS px / document 337 px, every input spans x36.2–300.8 and the annual table has a bounded horizontal scroll region (~264.6 px); no document horizontal overflow. With load 100 and export rate 10: 100 self-used / 500 exported, PKR 4,000 avoided charge / 5,000 credit. Both themes were exercised. Desktop viewport 1363 / document 1348.
- Text download event completed and returned a browser download path; clipboard content was checked. Downloaded file bytes were not independently inspected. Main guide rendered its new heading and four official links; all eight full hrefs are additionally tested in generated content. Final percent-encoding fix was tested/build-checked after browser navigation, not re-clicked in the browser.
- This is zoom/reflow testing, not physical-phone/touch/device-emulation or assistive-technology certification. Existing inherited demo/printing/installed-worker upgrade gates remain. No organization restrictions were bypassed. Managed local preview stopped afterward.

## Held Facebook caption — final draft for this version

Thinking about solar? Compare the complete quote with the electricity you can actually use during the day. Rafiqy's Solar Planner separates self-use savings, export credit, connection and battery costs, maintenance and a replacement budget, with a cashflow you can inspect. Starting figures are illustrative; bring your own quote and verified rates. Existing agreements need their own billing review.

Tool: https://rafiqy.app/tools/solar-planner
Guide: https://rafiqy.app/blog/decision-support/solar-planner-pakistan

Need a quote-comparison or reporting workflow connected to your business systems? Haider Raza provides integration and automation consulting for Pakistan and international businesses.

#SolarPakistan #SolarPlanning #Automation #Integration

Publish only after the exact website release is approved, deployed and checked working. Caption publication requires separate explicit approval. No savings, installer endorsement or enquiry claim is made.

## Access and release boundary

24 November metadata: latest production deployment remains `dpl_AKEhcGpFGBMazQ289m6biR8T1puN`, READY/production. Main remains stale `6c4651a`. Git review guard `codex/*: false` is preserved. No production/default push/merge/deploy/public preview occurred.

Source-only Supabase re-review: client uses environment-provided anonymous client configuration; no key value printed. Unconditional anon/auth policies in repository SQL remain unsafe definitions, not evidence of live deployment or a leak. Supabase plugin is available/not installed on 24 November; metadata review remains blocked until a correctly scoped connection or scrubbed schema/policy/grant export is supplied. Read-only alone is not metadata-only. No customer rows/logs, new access or live DB writes. Lead/email monitoring remains unconfigured; no claim of no enquiries. Facebook unconfirmed and unaccessed. No model calls, new product, outreach or spending. Distribution and appointment work remain queued.
