# Issue #5: разовая запись и история отмен

2026-10-22. Ветка `codex/mvp-issue-5`, worktree `.worktrees/issue-5`; task_base_sha `e15ac1bc1150434bd8c9e15c18723b527a88f334`. Код `1069ce2255497c8843818dcee8fce15eda64bc24`, отдельный Int-range fix `cca2c294993410f1059f523aefb8a74815356e4b`. Источник процесса — актуальные root AGENTS.md/development-plan.md из поручения координатора. Пользователь разрешил полную пятичасовую квоту; прежние 40/45/50% не применяются. Принятие, merge и закрытие issue остаются за координатором.

## Критерии → доказательства

| Критерий #5 | Реализация и доказательство |
| --- | --- |
| Анкета и актуальный уровень, без подтверждения тренером | HTTP: NOT_SET →409; анкета → BEGINNER, isLevelVerified=false → запись. Неподходящий текущий уровень отклонён; существующее место при смене уровня сохранено. TrainingService блокирует Training → User. |
| Активность, начало, вместимость | Внедряемый TrainingClock + schoolTimeInstant. HTTP: за секунду до начала разрешено, ровно в начале/после и отменённая группа отклонены. 12 HTTP-претендентов на последнее место: 1×201/11×409; прежние гонки вместимости/удаления сохранены. |
| Разовая цена, не полученный платёж | SINGLE_CASH/CASH/cashPrice=500, SQL constraint. UI до подтверждения: 500 ฿ на месте; профиль: оплата не получена. Ответный UNPAID вычисляется, платёж/долг не создаётся. HTTP/component/browser PASS. |
| Отмена и граница 3 часа | Начало 2026-11-01T00:00Z; отмена 2026-10-31T21:00:00Z — TIMELY, 21:00:01Z — LATE. Повтор сохраняет исходное время/результат; место доступно другому; balance=0. Поздняя разовая отмена обозначена без долга/штрафа. |
| Повторы и новая идентичность rebook | book требует UUID requestId, unique(userId,requestId); unbook — конкретный bookingId владельца. HTTP: book A → cancel A → старый book A не создаёт место; book B новым ключом → старые cancel A/book A не меняют B. Другой ключ при активной записи даёт409, same-key повтор идемпотентен. Rebook проверяет уровень/вместимость заново, сохраняет историю. |
| Legacy и миграция | Отдельные empty/legacy БД: все11 миграций PASS. id/user/training/status/paymentType/createdAt/updatedAt старых BALANCE и CASH совпадают до/после. Обе строки LEGACY, цена/отмена/requestId неизвестны, balance не меняется; платежи/пакеты не выдуманы. HTTP подтверждает видимость владельцу. |
| Права и приватность | Strict payload отвергает userId/paymentType/kind/cashPrice/paymentStatus. Чужой bookingId отменить нельзя; query userId не меняет владельца history. Публичная Training содержит bookingId=null, счётчик без чужих личностей. Сохранены profile/roles/one-shot auth регрессии; oversized PostgreSQL Int и неверный UUID →400. |

Покрыты относящиеся к #5 части сценариев MVP1,2,3,8,11,24,25 и точная граница отмены. Участники/получение оплаты/неявка сотрудником — #6, пакеты — #9/#11, Telegram/outbox — #10; здесь они не объявляются готовыми. Red→green: прежний NOT_SET ошибочно получал201 вместо409; component не показывал cash/late условия — обе проверки исправлены реализацией.

## Проверки

Windows, Node24.19.0, Bun1.4.2, настоящие Nest/production Next/PostgreSQL и Chrome headless/Playwright. Порты55950/55951; root `.mvp-local/resources.json`: databases.issue5, issue5_empty, issue5_legacy. Секреты/URL не включены. Worktree имеет собственные frozen dependencies; lockfile не менялся. BUN_TMPDIR — собственный `.mvp-local/tmp`.

| Команда | Результат/состояние |
| --- | --- |
| `bun run --cwd apps/backend test:integration`, TEST_DATABASE_URL=issue5, NODE_OPTIONS=--experimental-vm-modules | 3 набора33/33 PASS на окончательной политике same-key/different-key. Дополнительные `--testNamePattern='keeps legacy BALANCE'` и `'PostgreSQL Int range'`: по1/1 PASS, всего35 уникальных текущих проверок доказаны. |
| backend `test --runInBand`; `test:e2e` | 39/39 и2/2 PASS. E2E sandbox EACCES localhost устранён разрешённым повтором без изменения кода. |
| frontend `test --testMatch '**/test/**/*.test.ts' '**/test/**/*.test.tsx'` | 7 наборов32/32 PASS; явный testMatch нужен для Windows hidden worktree. |
| backend/frontend `typecheck`, `lint`; shared-types `lint` | PASS; frontend0 ошибок/7 прежних warnings, остальные0. После cca2c29 повторён backend typecheck. |
| shared-types/backend/frontend `build` | Все PASS на1069ce2, BACKEND_URL=http://127.0.0.1:55950. Узкий cca2c29 меняет только верхнюю границу HTTP-ID; по согласованию повторены затронутые типы/HTTP, прежние build/UI доказательства переиспользованы. |
| `node scripts/browser-smoke.mjs` | 9 PASS: collision Telegram login, анкета/reload/ADVANCED, защита NextAuth role, SSR/null-location/full-group cancellation, cash500 unpaid → профиль → отмена с legacy-историей, verified level после нового входа, same-origin. Внешнее Telegram-подтверждение fixture; протокол входа настоящий. |
| `node scripts/booking-migrations.mjs` с TEST_EMPTY_DATABASE_URL/TEST_LEGACY_DATABASE_URL | Обе БД11 миграций PASS. Повтор подтверждает отказ guard на заполненной БД без удаления данных; relocated temporary Prisma config отдельно `prisma validate` PASS. |
| `git diff --check`; `node --check` обоих изменённых runners | PASS, только Windows autocrlf warnings git. |

## Интеграция

- Обе additive migrations обязательны: cash_booking_history добавляет LEGACY/SINGLE_CASH, nullable price/cancellation metadata и partial unique CONFIRMED вместо full user/training unique; booking_request_identity добавляет UUID requestId и усиливает cash constraint. Первая применённая миграция сохранена неизменной.
- Старые миграции явно обращаются к public: использовать отдельные тестовые БД, не схемы общей БД. Prisma отказался выполнять destructive reset; reset не выполнялся. Безопасная альтернатива — additive миграции и две отдельные пустые БД; данные/ресурсы сохранены.
- HTTP book теперь `{trainingId,requestId}`, unbook `{trainingId,bookingId}`. Backend всегда выдаёт только собственный активный bookingId либо null; shared read schema делает поле optional для прежних fixtures. Browser callers обновлены. Будущий #10 использует booking.id для события outbox.
- Общий owner-only BookingResponseSchema явно перечисляет поля. paymentStatus — ответная проекция LEGACY→UNRECORDED/SINGLE_CASH→UNPAID. #6 расширяет её фактической фиксацией оплаты; старый CASH также не доказательство платежа.
- При интеграции: применить обе миграции, Prisma generate, shared build перед потребителями, сохранить browser-smoke. Изменений weather нет. Отдельного reviewer-агента исполнитель не создавал.

Квота codex/300min: старт12%, после HTTP26%, перед миграциями/финальными проверками35%, после browser/проверок42%; резерв90% не достигнут. Итоговую квоту координатор измеряет перед следующим срезом.
