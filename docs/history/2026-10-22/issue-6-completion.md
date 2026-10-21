# Issue #6: участники, посещение и разовая оплата

2026-10-22. Worktree `.worktrees/issue-6`, ветка `codex/mvp-issue-6`, task_base_sha `f47e88fd1b6fbb99af74e1dc010e20cac63af04f`. Реализация `952c1cc887340f5b2f904b0be779a9d4d83c16e5`; проверенный browser-only fix `3ac0865bb5a5eb2784a2409c4ed29c409e70298e`. Policy — актуальные root AGENTS.md/development-plan.md из поручения; явный пользовательский override полной пятичасовой квоты сохраняется. Исполнитель не сливает ветку и не закрывает issue.

## Критерии → доказательства

| Критерий #6 | Реализация и проверка |
| --- | --- |
| Обе роли, любая тренировка, выбор ученика, приватность | Новый StaffParticipantsModule: COACH/ADMIN GET `/training/:id/participants`, PATCH `/:bookingId`; строгий whitelist имён/id/уровня/записи/истории. HTTP обеих ролей, чужая тренерская группа, USER403, anonymous401, старая роль после снятия403. Browser выбирает ученика на группе другого тренера. |
| Посещение независимо от оплаты и записи | Booking.attendanceStatus UNMARKED/ATTENDED/NO_SHOW отдельно от status; nullable cashReceived отдельно от обоих. HTTP/browser проходят NO_SHOW → ATTENDED и receipt true → false, не меняя запись или цену. Owner history/profile отражают фактический PAID/UNPAID, а не метод оплаты. |
| Неявка/поздняя отмена без долга | HTTP: legacy CANCELLED/LATE + NO_SHOW, receipt corrections; balance остаётся0, число записей не меняется. Новых денежных/абонементных операций нет. UI объясняет отсутствие автоматического долга/штрафа. |
| Автор, время, причина, old/new, неизменная история | Каждая смена хранится новой BookingAudit с actorId, requestId, field, oldValue/newValue, reason, временем внедряемого TrainingClock. HTTP проверяет точное controlled время и4 события; browser4 события/автора/значения и историю после reload. |
| Повторы, коррекции и legacy | Unique(actorId,requestId), Training → User lock и повторная проверка роли в транзакции. Старый успешный ключ после коррекции ничего не меняет; несовпадающий payload/другая запись409, новый ключ для уже текущего значения409. Legacy cashReceived=null остаётся UNRECORDED, attendance UNMARKED; только явное действие сотрудника подтверждает платёж. false означает явно не полученную оплату. |

Покрыты относящиеся части MVP3/11/20/24. Подписки/списания/возвраты/изменение уровня не добавлялись. Red→green: список и PATCH изначально404, после реализации проходят. TrainingService и TrainingModule не изменены; notification/outbox остаются за параллельной #10.

## Проверки и окружение

Windows, Node24.19.0, Bun1.4.2; настоящий Nest/production Next/PostgreSQL/Chrome headless. Порты55960/55961, BACKEND_URL=http://127.0.0.1:55960. Основная БД — root resources.json databases.issue6; два дополнительных migration URL находятся только в worktree `.mvp-local/participants-resources.json`, databases.issue6_empty/issue6_legacy. Секреты не включены, root resources не перезаписывался. Frozen dependencies собственные, lockfile не менялся.

| Команда | Итог |
| --- | --- |
| backend `test:integration`, TEST_DATABASE_URL=issue6, NODE_OPTIONS=--experimental-vm-modules | 4 набора40/40 PASS: прежние35 +5 staff HTTP/PostgreSQL. После этого изменились только типы двух ожиданий теста для lint. |
| backend `typecheck`, `lint`, `build`; shared-types `build`, `lint` | Все PASS. |
| frontend `test --testMatch '**/test/**/*.test.ts' '**/test/**/*.test.tsx'` | 9 наборов40/40 PASS. |
| frontend `lint`, `build`; `node node_modules/typescript/bin/tsc --noEmit` из frontend | Все PASS; lint0 ошибок/7 прежних warnings. Сначала sandboxed typecheck завис; остановлен, прямой разрешённый tsc завершился успешно, production Next TypeScript также PASS. |
| `node scripts/participants.browser.mjs` | PASS: настоящий вход сотрудника, другая тренерская группа, выбор двух учеников, независимые отметки/исправления,4 audit-события, reload, unknown legacy, balance0. Только внешнее Telegram identity assertion — fixture. Первую попытку остановил неоднозначный locator textarea/history; browser-only fix ограничивает ожидание списком истории и ждёт сброса черновика. |
| `node scripts/browser-smoke.mjs`, TEST_BACKEND_PORT=55960/TEST_FRONTEND_PORT=55961 | Все9 прежних сценариев PASS: login/onboarding/cash500 unpaid/profile/cancel/legacy/roles/same-origin. Подтверждена совместимость расширенного owner-contract и профиля. |
| `node scripts/booking-migrations.mjs`, TEST_MIGRATION_ISSUE=issue6, TEST_EMPTY_DATABASE_URL/TEST_LEGACY_DATABASE_URL | Обе БД12 миграций PASS; все старые Booking колонки сохранены, новые attendance=UNMARKED/cashReceived=null, audit пуст, balance не меняется. Сброс/удаление данных не использовались. |
| `git diff --check`; `node --check scripts/participants.browser.mjs`; shared lint | PASS, только Windows autocrlf предупреждения git. |

## Интеграция

- Обязательна additive миграция `20261022000600_booking_staff_records`, затем Prisma generate и shared build. Defaults сохраняют неопределённость legacy; audit не backfill-ится. BookingAudit actor FK restrict, Booking FK cascade; производственная тренировка удаляется мягко.
- BookingResponseSchema добавляет cashReceived/attendanceStatus и PAID. Общая server-проекция bookingState используется владельцем и сотрудником: true→PAID, false→UNPAID, null→SINGLE_CASH UNPAID/LEGACY UNRECORDED. Fixtures потребителей обновлены.
- В AppModule и browser-runtime добавлен только StaffParticipantsModule. Общие schema/index изменения с #10 складываются; TrainingService/TrainingModule принадлежат #10. Migration runner теперь считает актуальные миграции и выбирает baseline для issue5/issue6; старые public-qualified миграции применяются только к отдельным БД.
- Worktree и тестовые ресурсы сохранить. Независимое ревью/merge/приёмка — координатор. Квота codex/300min: старт61%, после первого среза67%, расширение72%, проверки79%, staff browser/сохранение85%; новой широкой работы после90% не начинать.
