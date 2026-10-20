# Issue #7 — исправление Standards P3 после ревью

Дата: 21 октября 2026, Asia/Bangkok. Исходная реализация — `787b1bf526fde3bfd8dd1bf91dbb9c48d9025104`; исходный task base сохраняется `6cdd0bf2d2a3c79d39ae16eb36a5d4223e624908`. Координатор передал Standards-отчёт: 0 документированных нарушений, 1 оценочное P3 Duplicated Code в browser lifecycle. Spec завершён координатором без findings, с независимым успешным повтором 5 HTTP/PostgreSQL тестов. Это сведения переданных отчётов, не собственный повтор обеих осей.

## Исправление

`scripts/browser-runtime.mjs` скрывает общий lifecycle настоящих Nest/Next/PostgreSQL/Chrome за одним interface: `startBrowserRuntime({backendPort, frontendPort, secret})` возвращает `{base, db, browser, close}`. Оба runner — `roles-browser.mjs` и существующий `browser-smoke.mjs` — используют его. Их assertions, создаваемые fixtures, Telegram fixture и согласованный seam сохранены. Продуктовый код, зависимости и Prisma не менялись.

Helper проверяет локальную `TEST_DATABASE_URL` с окончанием `_test`, устанавливает тестовое окружение, подключает существующий набор Nest-модулей, запускает production Next.js, ограниченно ожидает `/api/auth/csrf` и открывает Chrome. `TEST_BACKEND_PORT` и `TEST_FRONTEND_PORT` переопределяют порты обоих runner; исходные значения по умолчанию сохранены. `close(async () => { /* fixture cleanup */ })` закрывает browser/Next, выполняет очистку собственных fixtures и гарантирует закрытие Nest через finally. Ошибка старта также вызывает очистку уже созданных ресурсов. Управление процессами ограничено дочерним Next.js текущего runner.

## Реально выполненные проверки

Node.js 24.19.0 через PATH, база `govolley_mvp_issue7_test` из локального `databases.issue7`. `TEST_BACKEND_PORT=55570`, `TEST_FRONTEND_PORT=55571`. Имеющаяся финальная production-сборка #7 уже выполнена с `BACKEND_URL=http://127.0.0.1:55570`; scripts не входят в сборку и продуктовый код после неё не менялся. Браузерные runner запущены последовательно с доступом к localhost.

- `node --check scripts/browser-runtime.mjs`, `node --check scripts/browser-smoke.mjs`, `node --check scripts/roles-browser.mjs` — успешно.
- `node node_modules/eslint/bin/eslint.js scripts/browser-runtime.mjs scripts/browser-smoke.mjs scripts/roles-browser.mjs --global process --global console --global URL --global setTimeout --global clearTimeout --global fetch --global AbortSignal` — успешно, ошибок/предупреждений нет. Node globals заданы явно: корневой ESLint не определяет окружение для scripts. TypeScript-проверка на эти `.mjs` не распространяется.
- `node scripts/roles-browser.mjs` — все прежние 4 группы сценариев прошли: ADMIN UI, назначение/снятие, старый токен, запреты USER/COACH, профиль и публичный ADMIN.
- `node scripts/browser-smoke.mjs` — все прежние 7 групп сценариев прошли: первый вход/анкета/reload, ADVANCED, отклонение поддельной роли NextAuth, SSR/отмена полной группы, повторная запись, подтверждённый уровень после logout/login и same-origin.
- Дополнительная локальная проверка `.mvp-local/lifecycle-failure-check.mjs` вызвала настоящий helper с несуществующим Chrome channel и получила ожидаемый отказ; после этого смогла занять оба порта 55570/55571. Затем успешный запуск с намеренной ошибкой fixture cleanup также завершился ожидаемым отказом и освободил оба порта. Запуск: `node .mvp-local/lifecycle-failure-check.mjs` — успешен. Скрипт является временным локальным артефактом, не включён в Git.
- `git diff --check` — успешно.

Полные продуктовые unit/PostgreSQL-наборы и production build не повторялись: они зафиксированы в [исходном отчёте](issue-7-implementation.md), а этот коммит меняет только browser lifecycle. Следующий шаг — повторная проверка координатором и интеграция. При конфликте `browser-smoke.mjs` интегратор должен сохранить сценарии TelegramLogin из общей ветки: исполнитель #7 не переносил целиком коммиты другой задачи.
