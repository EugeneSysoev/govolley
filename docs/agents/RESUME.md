# GoVolley MVP: продолжение

Обновлено 2026-10-22. Текущий запуск завершается у исчерпания пятичасовой квоты; последнее измерение перед checkpoint — 98% codex/300. Владелец разрешил использовать полный лимит, поэтому прежние пороги40/45/50% этого запуска не ограничивали. Сброс/кредиты не запрашивались, автоматического ожидания reset нет.

## Первые действия

1. Прочитать действующий development-plan.md и проверить get_usage_limits, bucket codex, окно300 минут. Учитывать разрешение владельца для этого запуска; при почти исчерпанной квоте только сохранить состояние, не запускать новую реализацию.
2. Сверить git status, worktree list, HEAD и draft PR#16. Main/production не менять. PROJECT.md → MVP-SPEC.md читаются координатором полностью один раз при новом продуктовом запуске.
3. Проверить итоговые пакетные ревью #6/#10 и статус GitHub: обе задачи приняты, совместные49 HTTP-проверок и обе оси ревью прошли; доступен фронт #8/#9. Новые задачи в завершающемся запуске не начинались.

## Ветка и принятый код

Root: C:/Users/User/Desktop/Рабочий стол/Кодинг/Проекты/govolley.
Интеграционная ветка codex/govolley-mvp, единственный [draft PR#16](https://github.com/EugeneSysoev/govolley/pull/16), base main0959c948a7a287d06f84728799ebe5b1be68eaad. Ready только после #15 и двухосевого ревью всего фактического diff, включая baseline479a127. Реализация начиналась f685aa55.

Текущий код merge#10 `04cbdb4`, после него только runner/doc commits до `454049694a823da7ac6ec1d81ceeb8740f4e5043`; checkpoint-коммит получить через git. Финальный checkpoint отправляется в origin/codex/govolley-mvp; точный SHA и синхронность проверить через git.

| Issue | Ветка / worktree | Состояние и SHA |
| --- | --- | --- |
| #2 | codex/mvp-issue-2 / .worktrees/issue-2 | Принята/закрыта, merge dabd0c4 |
| #3 | codex/mvp-issue-3 / .worktrees/issue-3 | Принята/закрыта, merge5bc32e5 |
| #4 | codex/mvp-issue-4 / .worktrees/issue-4 | Принята/закрыта, merge0a2ab89 |
| #7 | codex/mvp-issue-7 / .worktrees/issue-7 | Принята/закрыта, merge e740648 |
| #14 | codex/mvp-issue-14 / .worktrees/issue-14 | Принята/закрыта, final9a4bfe3, merge c5ea146; STD-001 closed |
| #5 | codex/mvp-issue-5 / .worktrees/issue-5 | Принята/закрыта, final3652f72, code1069ce2+cca2c29, merge f47e88f |
| #6 | codex/mvp-issue-6 / .worktrees/issue-6 | Принята, обе оси без находок; final e1808ff, code952c1cc, merge b9fbe79, runner3ac0865→5131030 |
| #10 | codex/mvp-issue-10 / .worktrees/issue-10 | Принята, обе оси без находок; final0a3e2fc, code1124e5b, merge04cbdb4 |

Все worktree обычные git worktree, не managed; сохранены, исполнительские деревья чистые. Task bases: #5 e15ac1bc1150434bd8c9e15c18723b527a88f334; #6/#10 f47e88fd1b6fbb99af74e1dc010e20cac63af04f; #14 d173c5e. Актуальные policy_source — root AGENTS/development-plan плюс разрешение владельца на полный лимит. Старые инструкции в worktree не копировать поверх root.

## Доказательства этого запуска

- [Приёмка #14](../history/2026-10-22/ISSUE-14-INTEGRATION.md): настоящий HTTP/browser success/failure/missing key, same-origin, ключа нет в URLs/HTML/40 файлах bundle, page errors0. Исправлен только Windows preload path теста. Продуктовые и changed-part Standards/Spec0 находок; STD-001 закрыта.
- [Приёмка #5](../history/2026-10-22/ISSUE-5-INTEGRATION.md): HTTP35, frontend32/backend unit39/e2e2/browser9, типы/lint/build, empty/legacy11 миграций. Standards/Spec0. Новые записи cash500 UNPAID, обязательные уровень/время/место; точная граница3ч, новая история rebook и защита старых повторов.
- [Совместная приёмка #6/#10](../history/2026-10-22/ISSUES-6-10-INTEGRATION.md): собственные результаты задач и пакетные ревью. После объединения Prisma relations/shared exports на merge04cbdb4:13 миграций, generate, shared build, backend type/build, HTTP49/49 в5 наборах, frontend production build с типами — PASS. Повтор всего suite не требуется из-за нового чата.
- Отчёты [#6](../history/2026-10-22/issue-6-completion.md) и [#10](../history/2026-10-22/issue-10-completion.md) содержат команды/исходныеSHA, browser, миграции. Полная приёмка #15 и живой Telegram ещё не выполнены.

## Новые контракты и следующий фронт

- HTTP book `{trainingId, requestId:UUID}`, unbook `{trainingId, bookingId}`. Старый ключ не создаёт rebook; другой ключ при активной записи409. Booking.id неизменяемая identity конкретной записи. TrainingResponse выдаёт только собственный активный bookingId либо null. Training→User lock сохраняется; TrainingClock управляет временем.
- Booking.kind LEGACY/SINGLE_CASH; legacy CASH/BALANCE не доказывают оплату. Cash500 сохраняет условие, receipt фиксируется отдельно. AttendanceStatus UNMARKED/ATTENDED/NO_SHOW и nullable cashReceived; проекция PAID/UNPAID/UNRECORDED. BookingAudit хранит actor/requestId/field/old/new/reason/time; повтор после исправления не переписывает его. StaffParticipantsModule отдельный, доступ обеим ролям.
- NotificationsModule создаёт intent внутри booking transaction. Delivery driver отдельно от бизнес-команд; snapshot сообщения, durable lease/CAS/повтор. Live transport/ticker только BotModule; HTTP/browser tests не импортируют живой бот. Защищённый экран /staff/notifications. Внешняя доставка at-least-once при неоднозначном результате.
- Сначала #8 (уровень, сохранение записей, история, нельзя обойти обязательную анкету) и #9 (пакеты5/10, оплата на месте, история/остатки); затем #11 зависит от #9 и принятой #10. Дальше #12→#13→#15. При пакетных последствиях attendance требуется единый протокол account/package locks: прочитать [инварианты #11](../history/2026-10-21/package-invariants.md); рекомендации не готовая реализация.
- Shared schoolDateKey/schoolDateIso/schoolTimeInstant/SCHOOL_TIME_ZONE использовать повторно. School time Asia/Bangkok; не создавать дату начала локальным Date constructor.
- Штатные timestamps миграций: #5 20261022000000/000001; #6 20261022000600; #10 20261022001000. Старые миграции явно используют public: для empty/legacy нужны отдельные БД, не схемы. Reset/drop не выполнялись.

## Ресурсы

- Root `.mvp-local/resources.json`: тестовая роль и databases.issue2–issue15/integration/legacy, issue5_empty/issue5_legacy. URL/пароль не печатать/не коммитить. Дополнительные БД #6 в собственной `.worktrees/issue-6/.mvp-local/participants-resources.json`; #10 см. report и собственные локальные файлы. Все только loopback *_test, production/development не мигрировать.
- Порты: integration55800/55801; #14 55840/55841; #5 55950/55951; #6 55960/55961; #10 56000/56001. BACKEND_URL build должен совпадать с runtime. Browser runner принимает TEST_BACKEND_PORT/TEST_FRONTEND_PORT.
- Node24.19.0/Bun1.4.2: PATH C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin. У worktree свои dependencies. Sandbox local PostgreSQL/Next/Prisma могут давать EACCES/EPERM: разрешённые проверки прошли. Frontend hidden worktree Jest testMatch задавать явно; NODE_OPTIONS experimental-vm-modules для backend MIME tests.
- Root `.mvp-local/integrate-610.ps1` и integration-610-*.log сохраняют совместную проверку. Штатные команды из package.json. Не повторять все зелёные проверки без изменённых входов.
- GitHub connector читает, запись403. Root `.mvp-local/github-write.ps1` использует уже настроенный credential без вывода токена: -IssueNumber N -BodyFile UTF8file -Close или -AssignTo. Старый gh.ps1 указывает на исчезнувший binary. Git push штатный.

Следующий запуск начинает с измерения квоты и проверки окончательного checkpoint/push. MVP ещё не готов, PR#16 остаётся draft, main/production не менялись.
