# Standards review: #6 + #10

Дата: 2026-10-22. Общий task base `f47e88fd1b6fbb99af74e1dc010e20cac63af04f`. Независимая ось Standards; Spec не заменяется.

Зафиксированы оба diff/log:
- #6: `git -C .worktrees/issue-6 diff f47e88fd1b6fbb99af74e1dc010e20cac63af04f...952c1cc887340f5b2f904b0be779a9d4d83c16e5`; log base..HEAD: `952c1cc feat: add staff participant attendance and cash receipt audit`.
- #10: `git -C .worktrees/issue-10 diff f47e88fd1b6fbb99af74e1dc010e20cac63af04f...1124e5b5a16f9d810914b48a523a401fa9984301`; log base..HEAD: `1124e5b feat: persist and retry Telegram booking confirmations`.

Policy: текущие root AGENTS.md/development-plan.md на `6bc31598e63f900ed520890374de92cb68df57b8` (без изменений относительно прочитанных правил), разрешение владельца использовать полный пятичасовой лимит; README, CONTEXT, codebase-design и актуальные `.mvp-local/current-issue-6.md` / `current-issue-10.md`. Все 12 smell-эвристик рассмотрены оценочно; документированные правила приоритетны, инструментальные проверки исключены.

**Обязательные нарушения: нет. Оценочные actionable smells: нет.**

- #6 сохраняет документированный протокол блокировки Training → User. Изменение отметки и append-only audit атомарны; актуальная роль повторно проверяется под блокировкой. requestId привязан к автору и содержимому действия: старый повтор не перезаписывает исправление. Строгий discriminated union отделяет посещение от оплаты. Owner/staff DTO явно ограничены; общая bookingState устраняет дублирование payment interpretation. Nullable receipt и UNMARKED сохраняют неизвестность legacy, без выдуманного платежа/долга.
- #10 записывает intent только при реальном booking transition и в той же транзакции. Worker не вызывает бизнес-команды, транспорт принадлежит BotModule. Snapshot сообщения, уникальность bookingId/kind, атомарный SKIP LOCKED claim, leaseToken CAS и повтор после истечения lease сохраняют durable work и защищают от устаревшего acknowledgement. Сетевой вызов имеет abort/timeout вне DB transaction. Ошибки нормализованы до безопасных категорий; токены/recipient не входят в staff DTO. Контроль доставки использует актуальные guards и защищён от позднего ответа пагинации.
- Новые clock/transport seams имеют production и управляемые test adapters; неподтверждённых расширений интерфейса нет.

Интеграция требует объединения обеих schema relations/User/Booking и shared index exports; сохранить оба staff navigation и импорт StaffParticipantsModule в browser-runtime. Это ожидаемая композиция, не дефект отдельных diff.

Suite не повторялся. Evidence: [#6 completion](../issue-6-completion.md), [#10 completion](../issue-10-completion.md). Координатор сообщил #6 HTTP/frontend 40, type/lint/build и 12 migrations green; browser locator fix ещё не включён в этот HEAD. #10 report: HTTP 37, transport 4, browser 6, type/lint/build, empty/legacy 12 migrations; прочитаны restart/crash/lease regressions. Приёмка и закрытие issues принадлежат координатору.

Финальная changed-part проверка: `git show 04cbdb4ac601888e238efb4003488a2f2d7e1e57 --cc` подтверждает аддитивный union User/Booking relations и обоих shared exports. `git diff 952c1cc..3ac0865 -- scripts/participants.browser.mjs` (root cherry-pick `5131030`) ограничивает ожидание сохранённой audit history и проверяет очистку основания через Playwright expect. Новых замечаний нет. Root при проверке: `454049694a823da7ac6ec1d81ceeb8740f4e5043`. Координатор подтвердил на source merge `04cbdb4`: 13 migrations, Prisma generate, shared build, backend typecheck/build, HTTP 49/49 и frontend production build. Новые тесты reviewer не запускал; полный обзор не повторялся.
