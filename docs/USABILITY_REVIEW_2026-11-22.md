# Rental cash and navigation review — 22 November 2026

Base: remote review snapshot `bd6681ddaa60680fabc2148924e373804bbb0807`. Local working branch: `codex/rafiqy-usability-review`, created from that snapshot, not from stale main. Original local homepage branch/history is preserved. No production release is authorized by this review.

## Focused changes

1. Rental results labelled "Owner upfront cash" previously displayed only the down payment. The existing projection already included entry costs. Added explicit `purchaseCosts` and `ownerUpfrontCash` outputs; the latter equals down payment plus assumed entry costs and is reused as the existing investment principal. The projection is not charged a second time. The English card, new Urdu total card, both copy/download summary payloads, paired guide, FAQ and sitemap now agree. Emergency reserves and unentered fees remain additional; no statutory rate or market input was refreshed.
2. Preferences now use keyboard-operable button switches with stable labels, descriptions and `aria-checked`. Opening the nonmodal dialog focuses its Close button. Escape closes an open navigation panel and restores its trigger; Escape on an unrelated input leaves focus alone. The Preferences trigger no longer reopens its panel when clicked to close it. Pointer dismissal excludes the trigger, and the panel has bounded width/height and internal scrolling.
3. Removed "Data saved to cloud" and "Local only" assertions from a preference that cannot prove either. Added explicit cloud-save/security limitations and accurate scope for the existing local backup export. No cloud sync was enabled and no backup data was imported/exported during QA.

## Evidence

-83 planning/engine/navigation/privacy tests pass, including an independent upfront-cash example: PKR12M price,25% down payment and5% entry costs require PKR3.6M, not PKR3M. Zero entry costs/full-cash cases covered; projected rent-side initial capital reconciles to the same total. No pricing data came from a source feed.
- Scoped ESLint and diff checks pass. Full production build/QA verifies159 prerendered routes115 posts. Existing legacy lint debt remains outside this batch.
- Actual internal browser at340 CSS-pixel width via Chromium400% zoom: homepage and rental document width337px, rental layout one305px column, no horizontal overflow observed. At desktop1363px homepage document width1348px. Earlier454px zoom layout also rendered. Browser menu shows zoom explicitly; these are narrow CSS viewport/zoom checks, not an emulated or physical phone.
- Menu opens/closes and Escape returns focus; All tools navigation reaches the directory with menu collapsed. Preferences opens with Close focused, Urdu Labels Space toggles false/true/false, Escape returns to Preferences, and clicking Preferences twice closes it. Desktop Close/Enter returns focus; Escape on homepage search preserves the search field. Both themes checked. Final backup-label font changes were lint/build checked after these interactions; no new interaction behavior changed.
- Rental synthetic35M default: down8.75M + entry2.45M = upfront11.2M. After entering28M, down7M + entry1.96M = upfront8.96M; both English/Urdu cards and clipboard summaries agree. Language switching preserves28M. No customer/property records were used. Physical mobile keyboard/touch, actual file downloads, printing, installed-worker upgrade and broad assistive-technology coverage remain separate gates.
- DevTools device emulation is blocked by this browser's organization policy; it was not bypassed. Zoom used the ordinary browser menu. No public preview was created. The internal preview URL is not a production review link.

## Source checks — 22 November 2026

- https://www.w3.org/WAI/ARIA/apg/patterns/switch/ — switch labels remain stable; Space toggles; role/checked/label/description semantics inform the Preferences implementation. This is not a WCAG certification or an assistive-technology compatibility guarantee.
- https://www.bankalfalah.com/personal-banking/loans/hybrid-home-finance/ — product still describes initial fixed pricing followed by variable market-linked pricing. No current numeric rates or eligibility thresholds were imported. The calculator's single-rate simplification and illustrative presets remain disclosed; this check does not validate them as lender offers.

## Release boundary and blockers

The base review snapshot includes all earlier unapproved rental/demo/offer/slip/fund/PWA/homepage work, while approved production remains32484f5 via Vercel dpl_AKEhcGpFGBMazQ289m6biR8T1puN (READY metadata rechecked22Nov). Do not deploy stale main6c4651a or silently release inherited work under approval of this small diff. Either approve the exact combined version after its gates pass or isolate an exact release. `vercel.json` keeps codex/* automatic Git deployments disabled. No production push, merge, deployment, public preview, Facebook publication or spending.

Supabase plugin is available but not installed22Nov. Repository SQL still defines unconditional anon/authenticated policies; no live metadata or customer rows were accessed, and those definitions are not evidence of a live leak. A restricted metadata connection or scrubbed schema/policy/grant export is needed. Lead/email monitoring is not configured. Facebook connection remains unconfirmed and was not accessed.

Follow-up found during directory navigation: ToolsHome still advertises "No Uploads", "works offline" and "No Login ever", although tools have different data/network behavior; review those claims and the hard-coded category statistic in a separate focused pass. No new app started; distribution/appointments stay queued. Broader tax/solar/rate accuracy work is still open.

## Final rental Facebook draft — HOLD

Monthly EMI is only one part of buying a home. What cash do you need before the repayments begin?

Rafiqy's Rent vs Buy tool separates the down payment, assumed purchase costs and total upfront cash. Explore renting and buying scenarios, then review the assumptions in English or Urdu.

Try it: https://rafiqy.app/tools/rent-vs-buy-calculator-pakistan

Illustrative planning inputs, not live bank rates or financial advice. Keep emergency savings and additional fees separate.

Publish only after this exact tool version is approved, released and verified. This caption requires separate posting approval. Existing homepage/business demo captions remain held; no social post was sent or scheduled.
