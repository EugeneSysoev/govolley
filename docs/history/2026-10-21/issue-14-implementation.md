# Issue #14 / STD-001 — implementation checkpoint

Date: 2026-10-21. Worktree `.worktrees/issue-14`, branch `codex/mvp-issue-14`.
Policy source: integration root AGENTS.md / docs/agents/development-plan.md at
`d173c5edd83159c20c54d274cbec6fad05168b5a`; task_base_sha is the same.
Issue body/comments: root `.mvp-local/issue-14.json` supplied by coordinator; no comments.
Implementation commit: `631ab1641104658e94bb10d275cd3a62fed2f078`.

**Incomplete: do not close issue #14 or STD-001.** Real HTTP/browser/network
acceptance has not completed. Stopped at codex/300 usedPercent=45, per policy.
Start=32; completed implementation slice=38; coordinator reported 40/41/44;
final direct measurement=45. No new scope or checks should start this run.

## Changes

Next route `/api/weather` owns OPENWEATHER_API_KEY and the fixed Phuket provider
URL. It returns only rounded temperature and condition, validates provider JSON,
uses a 5-second timeout and Next fetch revalidation of 600 seconds. Missing key,
HTTP failures, network failure, JSON failure or invalid provider payload return
503 with a generic response and no-store. Provider errors are not logged because
their URL may contain the key. The widget requests the same-origin relative API
and shows «Погода недоступна» on failure, clearing this state after later success.
README and frontend env example explain server-only configuration.

No dependency, lockfile, Prisma/schema, shared contract or shared runtime changes.
No external OpenWeather/Telegram call or real provider credential was used.

## Red → green evidence

Pre-agreed seams: provider transport, site HTTP and browser (issue criteria).
Applied implement/tdd/diagnosing-bugs; latest development plan supersedes skill
instructions that ask for redundant confirmation/review/full unrelated suites.

1. Component red against original widget: expected `/api/weather`, received
   `https://api.openweathermap.org/data/2.5/weather?...&appid=test-legacy-public-key`.
   Same-origin replacement turned it green.
2. Route success red against initial unavailable handler: expected 200, got 503.
   Provider adapter implementation turned it green.
3. Component failure red: expected «Погода недоступна», original placeholder
   remained. Explicit unavailable state turned it green.

Command: `node apps/frontend/node_modules/jest/bin/jest.js --config .mvp-local/jest.cjs --runInBand weather`.
Result: 2 suites, **8/8 passed** on implementation commit, 3.009s. Provider tests
cover success/data-only response, 401, network throw, invalid JSON, invalid shape,
missing key/no upstream call. Component tests cover same-origin and unavailable UI.

Local Jest config loads frontend jest.config.cjs, sets rootDir to frontend,
testMatch `['**/test/**/*.test.ts', '**/test/**/*.test.tsx']`, and sets ts-jest
transform compiler to absolute `apps/frontend/node_modules/typescript` (5.9.3).
Workaround is local only: normal Windows hidden worktree matching found no tests;
ts-jest otherwise resolved root TypeScript 6.0.2 and failed TS5011/TS5107 before tests.

## Successful verification

Environment: Windows PowerShell, Node 24.19.0 from
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin`,
Bun 1.4.2; own `bun install --frozen-lockfile` in worktree. Install required
escalation after sandbox EBADF temp error. Local generated artifacts only.

- `BACKEND_URL=http://127.0.0.1:55840 bun run --cwd apps/frontend typecheck`: pass.
  Initial invocation without BACKEND_URL failed configuration validation; corrected
  invocation generated route types and completed with exit 0.
- `bun run --cwd apps/frontend lint`: pass, 0 errors, 7 existing warnings
  (six image warnings and Telegram internal location navigation warning).
- `bun run --cwd apps/frontend build`: production pass, compiled17.7s, TypeScript13.8s,
  10 pages generated; `/api/weather` dynamic. Env BACKEND_URL as above,
  NEXTAUTH_URL=http://127.0.0.1:55841, test-only NextAuth secret,
  OPENWEATHER_API_KEY=`issue14-server-sentinel-build`. Ordinary sandbox build hung
  and was stopped; escalated build completed. No source change between runs.
- Separate recursive scan of `apps/frontend/.next/static`: **40 files, 0 matches**
  for `/issue14-server-sentinel|OPENWEATHER_API_KEY|api\.openweathermap\.org|appid=/`.
  This proves the sentinel and provider URL are absent from client files, including
  the credential set at production build time.
- `bun run --cwd packages/shared-types build`, `bun run --cwd apps/backend build`:
  pass as local runtime prerequisites. Backend Prisma generation needed escalation
  after sandbox EPERM in Prisma cache; generated files are ignored.
- `TEST_DATABASE_URL=<root resources.databases.issue14> node scripts/test-database.mjs`:
  pass escalated, nine existing migrations applied to dedicated local
  `govolley_mvp_issue14_test`. Sandbox attempt failed schema engine access.
- `node --check scripts/weather.browser.mjs`, `node --check scripts/weather-provider-fixture.cjs`,
  `git diff --check`: pass. The browser runner itself remains unverified below.

## Remaining acceptance and exact continuation

Weather-only runner `scripts/weather.browser.mjs` reuses unchanged browser-runtime,
real backend 55840 / frontend55841 / dedicated PostgreSQL / installed Chrome. It
preloads test-only provider fetch transport in the Next child, exercises success,
401 and missing key over real HTTP/browser, checks rendered state, page errors,
same-origin requests, no key/provider URL in browser URLs/HTML, then scans bundle.
Fixture and runner are saved as WIP; no successful HTTP/browser result is claimed.

Run attempted (with resource value read into env, never printed):
`TEST_DATABASE_URL=<resources.databases.issue14> node scripts/weather.browser.mjs`.
Both ordinary and escalated attempts exited before any assertion with
`Error: Next.js exited before becoming ready` from browser-runtime.mjs:10.
The helper suppresses child output (`stdio: 'ignore'`), so actual Next startup
failure is unknown. Runtime close executed on startup failure. Final scan above
was independent of the failed runner and passed.

Next: diagnose only this child startup failure (capture local Next stderr or check
test NODE_OPTIONS preload path quoting on Windows), repair weather runner as
needed, complete controlled real HTTP/browser success/failure/network criteria,
then pass result to coordinator. Avoid repeating already green checks unless
application sources/build inputs change. Status remains implemented but not fully
verified; coordinator owns independent reviews, integration and STD status.
