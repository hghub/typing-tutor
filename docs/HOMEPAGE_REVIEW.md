# Homepage and navigation review — 21 November 2026

Local branch: `codex/rafiqy-homepage-navigation`, based on unpublished8d1f9e4. Focused homepage diff is everything after that parent. No deployment, push, public preview, public post, new customer-data access or database write.

## What changed

- Replaced the repeated tool lists, long introductions and sweeping privacy claims with a clear hero, local task search, eight task categories, six starting points, four explicitly labelled business demos, three relevant guides, practical FAQs and a complete footer.
- Kept all15 existing category destinations accessible through the expanded category directory. Canonical tool links resolve from registry IDs, blog links use the sectioned helper. Counts are derived from the registry rather than the old68 label.
- Shared navigation now prioritizes All tools, Business, Guides, About, Help and Privacy. A narrow-screen Menu disclosure, Escape handling, visible focus and tool breadcrumbs are provided. Preferences/theme controls remain. Homepage adds a keyboard skip link and section jumps.
- Shared search scoring now prioritizes direct tool-name matches; JSON Formatter wins for JSON. English/Roman Urdu vocabulary is reused rather than duplicated.
- Shared homepage data drives both React and static prerender metadata, category/demo/guide destinations and FAQ copy. Homepage sitemap date updated. No financial rates or policy claims refreshed by this layout change.
- Light/dark presentation uses the existing brand, stronger light-theme link contrast, readable body text, shrinking grids and wrapping labels. No unverified popularity/traffic/benefit metrics.

## Supporting readiness repair

The internal preview initially rendered blank because eager Typing Tutor/Supabase initialization required missing local configuration on every route. Typing Tutor is now lazy-loaded like other tool pages; feedback initializes its existing client only on a submission attempt. A returned Supabase error is no longer displayed as successful delivery; generic failure guidance appears. No feedback was submitted, no credentials copied and no customer data accessed. Other cloud tools still require their appropriate configuration; this is not a live database/security fix or a new enquiry system.

## Verification

-82 combined tests pass, including homepage route/category membership, canonical static links, shared-search ranking, empty/unmatched searches and Roman Urdu discovery.
- Scoped lint passes for changed components/data. Entry point checked with its existing component-export/refresh rule excluded; global legacy lint debt is not claimed resolved.
- Production build/QA passes159 prerendered routes115 posts; diff check passes.
- Actual internal managed preview now renders. Desktop browser checks at1363px: both themes, search including JSON/Urdu/no-match states, business category, tool directory and guides navigation, section jumps (business starts96px below top), all-category expansion, keyboard skip link and no horizontal overflow (document1348px/viewport1363px).
- Actual phone-width viewport/menu interaction and comprehensive keyboard/focus tests remain pending. Zoom shortcuts did not resize the cloud viewport, so they are not mobile evidence. No browser-policy bypass or public preview was used. Do not reuse this desktop check as phone verification.

## Publication boundary

The branch inherits earlier unapproved rental, order/migration, salary-offer/slip, fund and PWA work. The homepage also links the unpublished order/migration/fund routes. Before publishing, either review/approve the exact combined source and required checks, or isolate the homepage onto published32484f5 and remove/hold unavailable demo destinations. Approval for homepage styling alone must not silently release unrelated dependencies. Existing GitHub source-sync403 remains unresolved; stale remote main must not replace production.

No consultation intake/contact destination is newly invented or enabled; Business/About links use existing pages. Private lead/email monitoring remains unconfigured. No social action is authorized by this redesign request.

## Held homepage caption

Find the right tool without digging through a long list.

Rafiqy's redesigned homepage groups everyday tools by task, adds English/Roman Urdu search, and gives business workflow demos a clear place of their own. Explore documents, writing, money planning, development and more.

Intended release link: https://rafiqy.app/

Business demos use synthetic examples. POS/ERP integration, private AI and custom automation need separate scoping and implementation.

Hold until the exact approved version is live and required checks pass; this caption needs separate approval before posting.
