# Directory and help review — 23 November 2026

Branch: `codex/rafiqy-directory-review`, based on the clean review commit `02bf4a45c79664a0590d78f149b053b641520a26`. Earlier branches and work preserved. Production publication is not authorized by this source review.

## What changed

- Removed ToolsHome's unsupported blanket claims: no uploads, guaranteed offline operation, no login ever, no server storage, no tracking and100% client-side processing. The replacement distinguishes file selection, browser storage, online services and optional cloud sync without certifying every tool. Removed the unverified Most Popular label.
- `src/data/toolsDirectory.js` now supplies directory metadata, data-handling notice and all15 canonical browse-topic links to React and static prerender. Stats show an exact visible-tool count (72 initially,60 with Pakistan tools hidden) and15 browse topics. The previous14 figure was already derived from the registry's14 primary tool groups; it was NOT a hard-coded-count bug. Topic pages and primary tool groups are different concepts. The displayed topic count now matches the directory links.
- Shrinkable directory grids preserve content on narrow viewports. SmartSearch's input can shrink within its flex row, keeping Clear inside the search container; the input and Clear button have stable accessible names. Search ranking and query processing are unchanged. Updated directory share metadata and PDF group wording without inventing new capabilities.
- Help's linked storage, recovery, backup, feedback and offline instructions now use bounded claims. Updated Export local data wording and actual typely-backup filename pattern. A sync preference/recovery identifier does not establish backend authorization, successful delivery or backup completeness. Turning sync off does not erase old cloud records. Help grids also shrink. React/static notices agree; directory/help sitemap dates updated.

## Verification

-83 existing planning/engine/navigation/privacy tests pass. Scoped lint and diff check pass; production build/QA verifies159 routes115 posts. No new tests for reversible copy/CSS changes. A separate static-render assertion confirms directory title, description, data notice and all15 canonical topic destinations agree with shared data.
- Actual internal Chromium browser: desktop1363px/document1348px;400% zoom340CSSpx/document337px;500% zoom272CSSpx/document269px. No horizontal document overflow observed. Clear remains within its search container (at272px, right231.6px vs container249.6px). These are zoom/reflow checks, not physical-phone or device-emulation tests and not WCAG certification.
- Directory search shows JSON Formatter first for JSON; clearing works. Pakistan filter changes72→60→72 and is restored. Both themes checked; topic link reaches the visible Typing & Learning category heading and returns to directory. Final Help copy/grids were source/lint/build checked after browser work; actual Help interactions were not re-tested. No feedback, upload, cloud sync, backup export/import or customer records used.
- Main remains stale6c4651a. Existing approved Vercel deployment dpl_AKEhcGpFGBMazQ289m6biR8T1puN was rechecked READY/production23Nov; this is metadata verification, not a fresh production interaction test. The codex/* automatic Git deployment guard is preserved. No production/default push, merge, deployment, public preview, database write, model call, public post or spending.

## Sources checked23November

- https://www.w3.org/WAI/WCAG22/Understanding/reflow — zoom and CSS viewport widths are valid reflow-testing concepts; a narrow screenshot alone is not a full accessibility assessment.
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API — localStorage persists across sessions and is scoped to an origin, not an application user. This supports bounded storage wording, not proof of a secure live backend.
- Repository source: registry/categoryPages, ToolsHome/SmartSearch, existing preferences, Supabase client initialization and SQL policy definitions. No key values were copied to this review. Existing unconditional anon/authenticated SQL remains unsafe source configuration, not proof it is deployed or customer data leaked. No live catalog or customer rows queried.

## Approval and remaining work

The branch inherits earlier unapproved tool/demo/PWA/homepage changes. Review the exact combined version and remaining gates before a production release, or isolate a smaller release. Directory-only approval must not silently release inherited work. Physical mobile, real downloads/printing, worker upgrades and other previously recorded checks remain open. Broader category, security-guide and privacy wording still needs its own source-backed review; this is not a site-wide privacy/security certification.

Supabase plugin remains available but not installed23Nov. Live metadata review needs the restricted connection or scrubbed schema/policies/grants export. Lead/email monitoring is not configured, Facebook connection unconfirmed/unaccessed. No enquiry count is inferred. Return to substantive solar/tax/rate correctness next; do not start a new growth app or repeatedly redesign discovery. Distribution/appointments remain queued.

## Final Facebook caption — HOLD

Find a useful tool by the task you need to finish.

Browse documents, Urdu writing, development, money planning and business workflow demos on Rafiqy. Check each tool's processing details and limitations before entering private information.

https://rafiqy.app/tools

Need your existing systems connected? Haider Raza can help scope a focused integration or automation pilot around a real workflow problem. Business demos use synthetic examples; live integrations require separate implementation.

Hold until the exact directory version is approved, released and verified. Posting needs separate approval. Existing rental/homepage/business captions remain held; nothing was posted or scheduled.
