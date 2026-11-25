# Tax-credit correctness review — 25 November 2026

Prepared on guarded `codex/rafiqy-tax-credit-review`, parent `8d773ba41c41fe13e077acba32804356b6b66880`. Not approved or deployed. This branch includes every earlier unpublished review batch, including solar, rental, payroll, demos, fund, PWA and homepage work. Isolate a tax-credit-only release onto approved production source `32484f5`, or obtain approval of the exact combined tree after its required checks. Do not deploy stale main `6c4651a`.

## Corrected behavior

The former optimizer recommended a supposedly exact allocation across VPS, life insurance and charity using historical salary slabs and unverified eligibility. FBR's current consolidation marks section 62 omitted by Finance Act 2022; historical footnotes reproduce the omitted insurance/share provision. That is not a current insurance credit.

The same `/tools/tax-optimizer` route is now named Tax Credit Planner. It computes one limited section 63 pension or section 61 donation scenario at a time using explicitly entered, reviewed taxable income B and assessed tax A before Part X credits for normal TY 2027 (1 July 2026–30 June 2027). No new salary rates or surcharge rules were imported. The main salary calculator and historical salary-offer engine remain separate and unchanged in behavior.

Contribution C is the lesser of qualifying entered payment and the implemented individual cap: 20% pension, 30% non-associate-only donation or 15% associate-only donation. Credit=(A/B) × C. This is an average assessed-tax basis, not a marginal-rate deduction. Shows amount above cap, credit, tax after this one credit and the full cash commitment. No automatic investment allocation, insurance credit, product recommendation, combined return or refund result. The obsolete insurance helper/constants and automatic split are removed from the legacy module, with no remaining caller; other legacy helpers are not newly certified current.

Bases require an explicit scenario confirmation, reset if amounts change. Positive payment requires eligibility confirmation, reset if payment/type/relationship changes. Example loading fills only synthetic amounts and leaves confirmations unchecked; checking them represents assumptions, not verification. Blanks, nonfinite/negative/malformed/overlarge amounts, unsupported modes and mixed/unknown donation relationships suppress results and exports. Zero must be explicit. This is not an eligibility checker or proof that a payment/fund/recipient qualifies.

Scope: individual, normal tax year, no AOP-member adjustments, special-year treatment, mixed associate/non-associate donations, non-cash gifts, alternative cash-donation payment methods, other credits, Zakat/housing/senior/teacher treatment or filing certification. Review subsequent changes and actual treatment separately. A benefit excluded from this tool is not thereby universally unavailable. One-credit results must not simply be added together to create a return.

Integer minor-unit/BigInt arithmetic: contribution cap rounded down to paisa; credit rounded half-up to paisa for planning. These are disclosed illustration conventions, not prescribed return rounding. Limits are PKR100M per amount, tax≤income and positive taxable income. No financial input is uploaded, persisted or added to analytics by this calculator. Reports contain only chosen scenario, numeric assumptions, dates, formula and limits; no names/document/identifier fields. Other site features remain separately scoped. The tax page's shared trust notice is bounded without claiming a completed site-wide privacy repair.

## Primary verification

Official index: https://fbr.gov.pk/Categ/Income-Tax-Ordinance/326

Current indexed consolidation, retrieved25 November 2026: https://download1.fbr.gov.pk/Docs/2026724177725705IncomeTaxOrdinanace2001.pdf

Consolidation amended through30 June 2026. Read operative text and omission/expiry notes together, not only historical footnotes. These consolidation/review dates are not assertions that all provisions first took effect in2026.

- Section61 printed120–121/PDF139–140: (A/B) × C; individual limits30% or15% for associate donor case; qualifying recipient categories; cash donation through crossed cheque drawn on a bank. Parsed text read and PDF140 visually checked. This version excludes mixed relationships/non-cash/other methods instead of guessing treatment.
- Section62 omission note printed122/PDF141: omitted byFinance Act 2022. Removed obsolete insurance feature; no alternative current insurance benefit is claimed.
- Section63 printed123–124/PDF142–143: eligible person, relevant income and approved fund;20% cap; historical age uplift through30 June 2019; specified existing-scheme transfers excluded. Parsed text read and PDF143 visually checked. User must review underlying eligibility; no automatic determination.
- Section65 printed128–129/PDF147–148: generally no refund/carryforward/back of unusedPart X credits; separateAOP-member provisions outside scope. A credit and settlement of actual withholding overpayment are different questions.

Tool, two direct markdown guides, their generated content, SEO/FAQs, registry and sitemap agree. Corrected tax-credit sections and the inaccurate main-salary-credit claim in pakistan-tools-guide; its other finance/privacy/regulatory claims remain pending. Added matching topic tags so both direct tax guides outrank unrelated category matches; no global discovery redesign/new app.

## Checks and actual browser evidence

99 combined tests pass, including 8 new tax-credit tests. Includes golden formula, 3 cap cases,zero tax/payment,confirmation/unsupported exclusions,invalid money/size limits,144 exact-money conservation scenarios,rounding,summary integrity/input immutability and removed insurance/split exports. Scoped ESLint and git diff --check pass. Full build/QA159 routes / 115 posts passes, repeated after final wording/tag changes. Separate source checks verify full official PDF hrefs and both direct guides ranking first for this tool.

Actual local Chromium, synthetic data only:
- Initial blanks and loaded-but-unconfirmed example do not produce credit/export controls. Reviewed assumption example B3M,A276000,payment300000 =>credit27600,taxafter248400,cap600000,fullcashcommitment300000.
- Editing payment invalidates eligibility confirmation. Payment1M with donation/non-associate =>eligible900000,credit82800,taxafter193200; associate=>eligible450000,credit41400,taxafter234600. Mixed relationship blocks results/exports. Blank assessed tax also blocks. Native checkbox Space toggles confirmation and suppresses/restores results.
- Copy status and actual clipboard text checked after bringing the proper tab into focus. Clipboard includes matching numbers,period,source and limits. Download completed with a browser path; file bytes not independently inspected. No feedback, share-button publication, cloud sync, private record or external form submission.
- Desktop1363CSSpx/document1348;400%ordinary browserzoom340CSSpx/document337, number inputs x36.2–300.8, checkboxes x36.2–56.2. No horizontal document overflow. Both light/dark exercised. This is reflow testing, not physical-phone/touch/device-emulation or assistive-technology certification.
- Direct paired-guide navigation/new title/full official PDF href verified. Final cap-rounding wording and related-guide topic-tag adjustment were source/lint/build checked afterward, not re-clicked in browser. Earlier inherited demo/print/installed-worker and physical-device gates remain. No restriction bypass. Local preview stopped.

## Final held Facebook caption for this version

A contribution is not the same as a tax credit—and a tax credit is not cash already received. Rafiqy's Tax Credit Planner lets you inspect one reviewed pension or qualifying donation scenario, with a visible formula, contribution cap, tax-year label and source limits. It does not decide eligibility, recommend an investment split or calculate a refund. Use reviewed amounts and keep taxpayer documents private.

Tool: https://rafiqy.app/tools/tax-optimizer
Guide: https://rafiqy.app/blog/decision-support/how-tax-shield-optimizer-helps-you-see-what-actually-saves-tax

Need a reviewed calculation, reporting or approval workflow connected to your business systems? Haider Raza provides integration and automation consulting for Pakistan and international businesses.

#TaxPlanningPakistan #WorkflowAutomation #Integration

Hold until the exact website release is approved, deployed and checked working. Separate explicit approval is required to publish this caption. No savings, client activity or enquiry claim.

## Access and approval boundary

25 November metadata: latest production dpl_AKEhcGpFGBMazQ289m6biR8T1puN remains READY/production. Main6c4651a remains stale, not updated. Guard codex/* automatic Git deployments disabled and preserved. No production/default push/merge/deploy/public preview/social publication/liveDB change/newcustomer access/model call/spending.

Supabase plugin freshsearch25 November available/notinstalled. Source client initialization and unconditional SQL policies re-reviewed without printing configuration values. These unsafe repository definitions are not proof of deployed policies/exposure. No customer rows/logs or live metadata accessed; restricted metadata connection or scrubbed schema/policy/grant export remains needed. No new permissions requested. Lead/email monitoring unconfigured; no claim of no enquiries. Facebook connection unconfirmed and unaccessed. No new growth app; distribution/appointments remain queued. Other financial/rate clusters and remaining required QA remain open.
