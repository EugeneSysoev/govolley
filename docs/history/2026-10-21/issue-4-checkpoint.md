# Issue #4: checkpoint перед паузой по лимиту аккаунта

Дата: 2026-10-21. Статус: **WIP, не объявлена готовой**. Координатор запросил checkpoint при 97% пятичасового лимита. Worktree сохранён; задача не интегрирована, STD-002/SPEC-003 пока не закрыты.

При подготовке передачи в следующий чат обнаружено: предыдущий агент не успел сделать WIP-коммит до исчерпания лимита. Текущие файлы сохраняются координатором отдельным snapshot-коммитом без изменения реализации. Конечный результат последовательного browser/HTTP/smoke запуска не получен; ниже он по-прежнему не заявляется успешным. Точный SHA snapshot указан в актуальном docs/agents/RESUME.md интеграционной ветки. Порядок дальнейших проверок определяется новой редакцией development-plan.md, исторический перечень следующих действий ниже служит контекстом.

## Контекст продолжения

- Issue: https://github.com/EugeneSysoev/govolley/issues/4, общий draft PR #16.
- Ветка: `codex/mvp-issue-4`.
- Worktree: `C:/Users/User/Desktop/Рабочий стол/Кодинг/Проекты/govolley/.worktrees/issue-4`.
- task_base_sha: `a1d670b5dc173c7cf578930ffa9ca9931e5fe510`. #2/#3 уже интегрированы в эту базу.
- Актуальный snapshot issue: root `.mvp-local/issue-4.json`; читаемая копия вне репозитория — `C:/Users/User/.codex/visualizations/2026/10/19/01a154f2-c730-7683-8b89-d9041a09ea37/issues/4.md`.
- Исполнитель прочитал AGENTS, PROJECT, MVP-SPEC, development-plan, domain/CONTEXT, history, findings, codebase-design и skills implement/tdd/codebase-design. Согласованные seams: HTTP + настоящая PostgreSQL и браузер, без повторного согласования.

## Реализация в checkpoint

- Create требует название, дату/начало/окончание, уровень BEGINNER/INTERMEDIATE/ADVANCED, вместимость, площадку, имя тренера и цену 500 ฿. NOT_SET и пустые обязательные поля отвергаются. PATCH сохраняет пропущенные поля и проверяет переданные; только описание допускает явное очищение null. Частичное исправление legacy разрешено без выдуманных данных.
- `TrainingResponseSchema` остаётся совместима с legacy: null, пустые строки, NOT_SET и произвольная сохранённая цена читаются без принудительного заполнения.
- Общие `schoolDateKey`, `schoolDateIso`, `schoolTimeInstant`, `SCHOOL_TIME_ZONE` экспортируются из shared-types. Вход даты: YYYY-MM-DD либо ISO timestamp с offset; новый день сохраняется как полночь Bangkok. Пример: 2026-11-01 → 2026-10-31T17:00:00.000Z. Старый timestamp при чтении не изменяется; его школьный календарный день определяется Bangkok. Для будущих #5/#11 использовать `schoolTimeInstant(date, startTime)`, а не локальный конструктор Date.
- Календарь, фильтр выбранного дня, карточка, детали/booking sidebar, список профиля, дата регистрации и ввод сотрудника применяют Bangkok с явной подписью.
- Один `Record<SkillLevel,string>` (`apps/frontend/lib/training-display.ts`) задаёт BEGINNER = «Начинающий». Общий `locationLabel` обрабатывает null/пустую/пробельную площадку как «Уточняется».
- Цена показана до записи, описание выведено в деталях. Форма позволяет ввод календарной даты/описания/цены. Информационные тарифы сохраняют 500/2200/4000 ฿ и сообщают об оплате на месте, активации, 90 днях и отмене минимум за 3 часа.
- В `bookingsSchema` добавлено `endTime`, чтобы профиль отображал весь диапазон. Backend уже возвращает поле.
- Новых зависимостей, изменений lockfile, Prisma-схемы и миграций нет.

## Реальные проверки

- Red HTTP: новый тест `creates a public group...` получил 201 вместо ожидаемого 400 на отсутствующем обязательном поле. Затем green после новых write-контрактов.
- Green целевые HTTP: создание/публичное чтение/список и отклонение обязательных полей; PATCH/описание/запрет очистки обязательных полей; legacy чтение без заполнения; нормализация календарного дня create/PATCH. 1 + 3 целевых теста прошли в отдельных запусках с реальной PostgreSQL.
- Red frontend SSR/card/profile: нет подписи Asia/Bangkok, цены и fallback старых пустых площадок. После реализации green 3/3 для null/пустой/пробельной площадки.
- Итоговый backend unit: 4 набора, 39/39. Backend e2e: 1 набор, 2/2. Backend typecheck и lint: exit 0.
- Итоговый frontend: 7 наборов, 31/31. При первом полном запуске прежняя navigation fixture с одновременно null price/location дала неоднозначный запрос текста «Уточняется»; fixture получила цену 500, затем полный набор прошёл. Новых продуктовых изменений для этого исправления нет.
- Frontend typecheck и production build: exit 0. Backend build и Prisma generate: exit 0. Shared-types build/lint: exit 0.
- Frontend lint: exit 0, 7 прежних предупреждений (img и переход window.location в TelegramLogin).
- `git diff --check`: exit 0 (предупреждения autocrlf для двух backend test-файлов).

## Браузерная приёмка: что ещё проверить

Добавлен `scripts/training-school-time.browser.mjs` (`bun run test:browser:school-time`). Реальные Chrome + Next + Nest + PostgreSQL; только внешнее утверждение личности Telegram подменено fixture. Два контекста: America/Los_Angeles и Asia/Tokyo. На общем instant 2026-10-31T18:00Z у устройств разные календарные даты (31/1), школа показывает 1 ноября. Сценарий проверяет публичное расписание/цену/уровень, смену дня в календаре, SSR/legacy площадки, профиль и ввод/редактирование сотрудником.

Во время разработки исправлены проблемы самого runner: контролируемые будущие часы восстанавливаются перед коротким auth TTL; ожидание заполнения формы использует auto-wait assertion; смена дня не требует глобально пустого дня после создания занятия другим контекстом; редактирование ограничено нужной именованной article. В предпоследнем запуске America/Los_Angeles прошёл целиком; второй контекст дошёл до редактирования, но selector нашёл две кнопки. Исправлены scope и semantic article, frontend пересобран.

**На момент написания checkpoint окончательный последовательный запуск ещё выполняется:** `school-time browser → полный PostgreSQL integration → существующий browser-smoke`. Его результат нужно дочитать у исполнителя/в продолжении. До фиксации результата не объявлять два timezone, полную integration и smoke успешными.

## Ресурсы и команды продолжения

Из корня данного worktree (PowerShell), без реальных .env:

```powershell
$env:PATH='C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin;'+$env:PATH
$env:TEST_DATABASE_URL=(Get-Content ../../.mvp-local/resources.json | ConvertFrom-Json).databases.issue4
$env:DATABASE_URL=$env:TEST_DATABASE_URL
$env:BACKEND_URL='http://127.0.0.1:55640'
$env:NEXTAUTH_URL='http://127.0.0.1:55641'
$env:NEXTAUTH_SECRET='school-time-browser-only-secret'
$env:TEST_BACKEND_PORT='55640'
$env:TEST_FRONTEND_PORT='55641'
$env:NODE_OPTIONS='--experimental-vm-modules'
node scripts/training-school-time.browser.mjs
bun run --cwd apps/backend test:integration
node scripts/browser-smoke.mjs
```

`git` и проверки с localhost требуют `require_escalated`. БД изолирована от остальных задач. Девять существующих миграций применены через `node scripts/test-database.mjs`. Зависимости установлены `bun install --frozen-lockfile` в worktree; первоначальный EBADF/EPERM temp решается `BUN_TMPDIR=<worktree>/.mvp-local/tmp` и escalated вызовом. Frontend Jest workaround Windows hidden path: `--testMatch '**/test/**/*.test.ts' '**/test/**/*.test.tsx'`.

## Следующие действия координатора

1. Зафиксировать финальный результат текущего runner; при необходимости завершить указанные браузер/HTTP команды. Не считать прежний успешный first-zone полным двухтаймзонным green.
2. Выполнить независимые Standards и Spec review относительно task_base_sha; исполнитель собственных reviewer-подагентов не запускал по указанию координатора.
3. Обработать замечания; только после критериев закрыть STD-002/SPEC-003 и принять #4 в интеграционную ветку.
4. При интеграции с #7 сохранить обе правки `contracts.ts` (endTime + roleCandidatesSchema) и browser-smoke. #7 добавляет `scripts/browser-runtime.mjs`: `startBrowserRuntime({backendPort,frontendPort,secret}) → {base,db,browser,close}`, `close(async()=>fixturecleanup)`. Перевести новый school-time runner на общий helper при объединении (если интерфейс применим), сохранив сценарии; на текущую базу код #7 не подтягивался.
5. После интеграции/проверки #4 станет доступна #5. Новые worktree создавать от актуального интеграционного SHA, а не от этой сохранённой базы.

Живой Telegram, production, общая приёмка #15 и итоговое ревью PR здесь не выполнены. Worktree и WIP-коммит сохраняются для продолжения.
