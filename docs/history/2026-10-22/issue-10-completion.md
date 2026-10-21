# #10: durable Telegram booking confirmations

2026-10-22. Implementation `1124e5b5a16f9d810914b48a523a401fa9984301`,
task_base_sha `f47e88fd1b6fbb99af74e1dc010e20cac63af04f`.
Branch `codex/mvp-issue-10`, worktree `.worktrees/issue-10`.
Policy source: root AGENTS/development-plan `5a5bece`, with owner's full
five-hour quota override for this run. Last measured codex/300: 82%.
Independent review and integration belong to the coordinator; this report does
not close the issue or claim production Telegram acceptance.

## Result and evidence

- Booking/cancellation write one notification intent inside their existing
  transaction, only on the actual transition. Immutable booking id + event kind
  is unique. Concurrent same-request HTTP replay, cancellation replay, rebooking
  and old-operation replay produce exactly the intended three distinct intents.
- Recipient, training title/date/time and Russian result text are snapshots.
  Both message kinds explicitly say Phuket/Asia/Bangkok. Later training edits do
  not change retries. Missing recipient is visible as UNDELIVERABLE rather than
  silently discarded or sent to a guessed account.
- The worker has no booking/accounting dependency. Atomic PostgreSQL claim with
  SKIP LOCKED, 60-second lease, UUID attempt token and conditional acknowledgements
  recover crashed work and prevent stale completions overwriting newer attempts.
  Requests abort after 10 seconds; capped backoff remains durable, respects safe
  Telegram retry_after and never abandons transient errors after an attempt cap.
- Only BotModule registers the real Telegraf adapter and five-second scheduler.
  HTTP/tests do not launch a live bot. Shutdown stops claims and aborts active
  delivery. Safe failure categories exclude credentials and raw Telegram errors.
- `/api/notifications` and `/staff/notifications` are COACH/ADMIN only, checked
  against current DB role. Default undelivered filter, delivered history, bounded
  cursor pagination and profile navigation are present. Late pagination responses
  are ignored after filter/refresh/token changes.

## Checks on the implementation state

Node 24.19.0 and Bun 1.4.2 from the configured runtime. Dependencies installed
with `bun install --frozen-lockfile`; no dependency or lockfile changes.
All URLs were loaded into environment variables from ignored local resources,
never embedded in source. PostgreSQL and real Chrome checks needed the established
localhost sandbox escalation. Backend/front/shared checks are scoped to #10 and
its affected booking consumer rather than an unrelated full suite.

| Command | Result |
| --- | --- |
| `bun run --cwd packages/shared-types build` | passed |
| `bun run --cwd apps/backend prisma:generate` | passed |
| `bun run test:db:prepare` with `databases.issue10` | all 12 migrations applied |
| `NODE_OPTIONS=--experimental-vm-modules bun run --cwd apps/backend test:integration --runTestsByPath test/core.postgres-spec.ts test/notifications.postgres-spec.ts` | 37/37 passed (28 existing booking/core + 9 notifications) |
| `bun run --cwd apps/backend test --runTestsByPath src/bot/telegram-notification.transport.spec.ts` | 4/4 passed against real Telegraf and controlled local HTTP: success, rate limit, safe error, underlying request abort |
| `bun run --cwd apps/backend typecheck` | passed |
| `bun run --cwd apps/backend lint` | passed, no warnings |
| `bun run --cwd apps/backend build` | passed |
| `BACKEND_URL=http://127.0.0.1:56000 bun run --cwd apps/frontend typecheck` | passed |
| `bun run --cwd apps/frontend lint` | passed, 7 existing unrelated warnings |
| `node ../../node_modules/eslint/bin/eslint.js src --config ../../eslint.config.mjs` (cwd `packages/shared-types`) | passed; direct invocation used after the Bun wrapper remained open |
| `BACKEND_URL=http://127.0.0.1:56000 bun run --cwd apps/frontend build` | passed, including rebuild after pagination guard |
| `node scripts/notifications.browser.mjs` | 6/6 passed with real Nest/NextAuth/Next/PostgreSQL/Chrome in America/Los_Angeles, including late pagination response regression |
| `node apps/frontend/node_modules/eslint/bin/eslint.js apps/frontend/app/staff/notifications/page.tsx` | passed after pagination guard |
| `node scripts/notification-migrations.mjs` | empty + populated legacy, 12 migrations each, existing Booking rows unchanged, zero inferred historical notifications |
| `git diff --check` | passed |

The nine notification PostgreSQL scenarios include actual creator Nest shutdown
followed by a fresh Node worker process; kill of a separate worker after claim
before acknowledgement; another fresh worker before/after lease expiry; two
concurrent drivers and stale completion; 10-second real abort; rate-limit
deadline; snapshot retry preserving every Booking field; missing recipient;
anonymous/USER/COACH/ADMIN and old-token role revocation.

TDD evidence: first HTTP slice failed with GET notifications 404, then passed;
retry slice failed without the driver module, then passed with the production
driver. New source and runners were committed before independent review.

## Migration and integration

Migration `20261022001000_notifications` adds only notification enums/table and
indexes/FKs. No legacy booking/payment inference, destructive changes or new
packages. Dedicated migration URLs remain only in this worktree's ignored
`.mvp-local/notification-resources.json` (fresh databases ending in
`_issue10_empty_test` / `_issue10_legacy_test`). The runner refuses existing
tables instead of resetting a database. Main HTTP/browser use root resource
`databases.issue10`, ports 56000/56001.

#6 owns additive Booking attendance/payment fields and its audit model. Merge
schema relation lines and shared index exports additively, preserve both profile
links. #10 changes TrainingModule/TrainingService/BotModule, but does not change
AppModule or browser-runtime. After integrating #6, regenerate Prisma and check
the combined affected HTTP path and migrations; no dependency/lockfile conflict.

Future payment paths call `recordBooking(tx, event)` inside the same booking
transaction. School cancellation will introduce its own event kind in #12;
neither that message nor package accounting is claimed by this issue.

## Limits

External delivery is at least once: Telegram may accept a message before a
process dies or acknowledgement is lost, so recovery can resend it. No
exactly-once external guarantee is claimed. A null recipient remains visible for
staff control; manual repair/resend is not part of this issue. Real Telegram
credentials/polling/delivery and production deployment were not exercised.
Worktree and local databases are preserved; generated dependency temp files were
removed after verification.
