# GitHub source synchronization — 21 November 2026

Haider requested committing the prepared work after repository write access was restored. This authorizes source synchronization to a review branch, not a production release or merge to main.

## Source scope

- Application checkpoint before this synchronization: local `62b5d820fd44aceaa1edd7fdc5d4c102569b43ee`, branch `codex/rafiqy-homepage-navigation`.
- Remote main last checked: `6c4651ad17b2f63f76d2b4b383373896bd2798d1`. Previously approved production source is `32484f5c85ad8b88dce5b1295fbeed204fc65c76` and must not be overwritten by stale main.
- Synchronization includes prior approved stock/forecast/tax/bilingual sources and all prepared rental, order/migration demos, salary offer/slip, community fund, PWA privacy and homepage/navigation updates. It does not approve those unpublished changes for website release.
- All source updates are already committed locally; the working tree was clean before adding this deployment guard and synchronization record. No Windows checkout/history was read.
- `vercel.json` sets `git.deploymentEnabled` to `{ "codex/*": false }`. Only guarded review branches may be created remotely. This prevents automatic Git preview deployment for these branch names without changing production project settings or main.
- Reference checked21Nov: https://vercel.com/docs/project-configuration/git-configuration . The documented branch filter supports minimatch and unspecified branches retain their default behavior.

## Checks and remaining release gates

82 planning/engine/navigation/privacy tests passed again21Nov. The previous complete build verified159 routes115 posts; a fresh build is run before source synchronization. Check tree identity after uploading sources. No customer rows, secret files, external model requests or live database writes belong to this batch.

Actual phone/menu, demo download/interaction, payroll printing and installed-worker upgrade checks remain as recorded in HOMEPAGE_REVIEW and RELEASE_REVIEW. Existing captions remain drafts and need separate approval. Homepage links unpublished demos, so a release must explicitly cover the combined version or isolate the intended scope first.

GitHub provider permissions and ChatGPT action approval settings are separate. The successful blob write is not evidence of Facebook/Supabase access. Live Supabase metadata and private lead/email monitoring are still unconfigured; no claim of no enquiries is made.
