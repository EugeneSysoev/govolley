# Интеграционная приёмка #7

Дата: 2026-10-21. Интеграция `codex/govolley-mvp`, merge `e740648f047c302702c687d077e005c77a40dd95`, проверенный HEAD `4326a53cff3cd0689f91ceaf02ceeb723d8153a3` (после merge менялись только документы). Task HEAD `4cbdd9525d70d798b22e16cc1c0d41f6fd136607`, task base `6cdd0bf2d2a3c79d39ae16eb36a5d4223e624908`.

**#7 принята.** Критерии первоначального назначения администратора, защищённого управления COACH, актуальной роли со старым токеном, запрета служебных полей и интерфейса подтверждены [реализацией](issue-7-implementation.md), [Standards](reviews/issue-7-standards.md), [Spec](reviews/issue-7-spec.md) и совместными проверками ниже. Первоначальная настройка проверяется реальной CLI-командой в PostgreSQL-наборе; production не изменялась.

## Разрешённый конфликт и доказательства

Merge сохранил TelegramLogin/collision из #3 и lifecycle `browser-runtime` из #7. Helper дополнен проверкой портов и `sessions: AuthSessionService`; fixtures и assertions входа сохранены. Конфликтная часть независимо проверена в пакетном [Standards](reviews/issue-4-standards.md) и [Spec](reviews/issue-4-spec.md) — замечаний к #7 нет.

Все команды ниже выполнены на объединённом HEAD. Bundled Node 24.19.0, Bun 1.4.2, отдельная локальная `databases.integration` из игнорируемой конфигурации, порты 55800/55801, `BACKEND_URL=http://127.0.0.1:55800`; Jest с `NODE_OPTIONS=--experimental-vm-modules`. Credentials в отчёт не включены.

| Проверка | Результат |
| --- | --- |
| `bun run --cwd apps/backend test:integration` | 3 набора, 23/23: roles, auth-collision, core. Настоящие HTTP/PostgreSQL; CLI bootstrap, старый токен и роль, запреты, одноразовый вход, конкурентные места. |
| `bun run build` | Все 3 workspace успешны; shared/backend переиспользованы из cache по тем же входам, frontend собран для интеграционного backend. |
| `bun run typecheck` | Все 3 workspace успешны, потребитель contracts.ts включён. |
| `node scripts/browser-smoke.mjs` | 8 групп прошли: TelegramLogin/collision без присвоения профиля, onboarding, server level, forged update, SSR/cancel/rebook, fresh login, same-origin. |
| `node scripts/roles-browser.mjs` | 4 группы прошли: ADMIN UI и видимый результат, старый USER-токен получает/теряет права, USER/COACH отказ, ADMIN нельзя выдать публично. |

Первый PostgreSQL-запуск в sandbox получил EACCES при подключении; повтор с разрешённым localhost прошёл. Первый sandbox build остановлен после зависания; разрешённый запуск успешен. Неудачные попытки не выдаются за green. Логи `.mvp-local/resume-{postgres,build,typecheck,smoke,roles}.log` локальные и игнорируются. Миграций/продуктовых исправлений при приёмке нет. Прежние lint/unit результаты сохраняют исходные SHA/дату из task-отчёта; повтор без новых входов не требовался.

Живой Telegram, production и полный MVP #15 не проверялись. PR #16 остаётся draft до завершения графа и итогового ревью всего PR.
