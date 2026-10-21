# Issue #14 / STD-001 — completed runtime verification

Date: 2026-10-22. Branch `codex/mvp-issue-14`; worktree `.worktrees/issue-14`.
Task base: `d173c5edd83159c20c54d274cbec6fad05168b5a`.
Product implementation: `631ab1641104658e94bb10d275cd3a62fed2f078`.
Runner/fixture checkpoint: `34959e26320f47383cc20259c196cd37ca46f23a`.
Verified runner fix: `ea4b36e7ff4be515cd673119b32c1b5f14169f6f`.
Policy source: current integration-root AGENTS.md / development-plan.md at
`e15ac1bc1150434bd8c9e15c18723b527a88f334`, with owner's full-five-hour-quota
override for this run. Quota codex/300: 11% at start, 17% after verification.

## Diagnosis and change

The existing runner failed before Next readiness. Directly exposing Next stderr
with the original quoted Windows preload path reproduced `MODULE_NOT_FOUND`:
Node's NODE_OPTIONS parser consumed the backslashes, leaving `C:UsersUser...`.
Normalize the test fixture path to forward slashes before quoting it. No product,
shared browser-runtime, dependency, Prisma or shared-contract change was needed.

The sandbox run after this fix reached a different failure, readiness timeout;
the identical runtime check with permitted local process/network access passed.
The unsuccessful sandbox process was stopped before the permitted run.

## New acceptance evidence

Environment: Windows, Node 24.19.0 from the configured bundled runtime, existing
production build, installed Chrome, real Nest and Next, separate PostgreSQL
`govolley_mvp_issue14_test`, ports 55840/55841. Database URL was read from root
`.mvp-local/resources.json` into TEST_DATABASE_URL without printing it.

Command: `TEST_DATABASE_URL=<resources.databases.issue14> node scripts/weather.browser.mjs`
(environment notation; executed through PowerShell, with permitted local access).
Result: **exit 0** on the exact runner state committed as `ea4b36e`:

| Controlled provider mode | Real site HTTP | Real browser outcome |
| --- | --- | --- |
| success | 200, exactly `{ temp: 29, icon: 'Rain' }` | `29°C` |
| failure (provider 401) | 503, exactly `{ error: 'Weather unavailable' }` | `Погода недоступна` |
| missing-key | 503, same generic response | `Погода недоступна` |

Each browser visit to `/training` recorded a same-origin `/api/weather` request;
no browser request URL contained OpenWeather, `appid=` or the synthetic server
credential. The credential was absent from rendered HTML and there were zero
page errors. The controlled transport runs only in the Next child; browser,
frontend/backend HTTP and PostgreSQL are real. No real provider key or external
OpenWeather call was used.

Recursive scan of `.next/static`: **40 client files, zero matches** for
`issue14-server-sentinel|OPENWEATHER_API_KEY|api\.openweathermap\.org|appid=`.
The existing production build had the distinct synthetic build credential,
also covered by this pattern.

`node --check scripts/weather.browser.mjs`,
`node --check scripts/weather-provider-fixture.cjs` and `git diff --check`: pass.

## Reused evidence and integration

[Original checkpoint](../2026-10-21/issue-14-implementation.md) records the
unchanged product checks on `631ab164`: targeted unit/component 8/8, frontend
typecheck, lint (zero errors, seven existing warnings), production build and
backend/shared runtime builds. Nine existing migrations were applied to the
dedicated test database. These passed checks were not repeated because their
inputs did not change; only the previously unproven runtime check and runner
syntax were run here.

Existing independent product reviews at `631ab164` have zero findings:
[Standards](../2026-10-21/reviews/issue-14-standards.md) and
[Spec](../2026-10-21/reviews/issue-14-spec.md), retained in integration commit
`e9d547a` (not an ancestor of this worktree). Coordinator owns the remaining
changed-part review of `scripts/weather.browser.mjs` and
`scripts/weather-provider-fixture.cjs` against the task base, integration and
closure of issue #14 / STD-001. Neither is closed by this executor report.

Remaining limitations: live OpenWeather and production deployment were outside
this acceptance; the external-provider boundary was deliberately controlled.
Keep this worktree. No migration, dependency or shared-interface integration is
required. Product runtime acceptance is now complete; no product change remains.
