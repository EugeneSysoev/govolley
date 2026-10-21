# Интеграционная приёмка #4

Дата: 2026-10-21. Ветка `codex/govolley-mvp`. Task base `a1d670b5dc173c7cf578930ffa9ca9931e5fe510`; snapshot реализации `0e4c9eb50cf87ab8db6748bf2c196b741acb37ef`, task HEAD `56cd765a49e8c2cb7ac74209337e932b1767a629`. Принятый и проверенный merge `0a2ab89b9d79656a54eacff9e760e5cc7404d471`.

**#4 принята; STD-002 и SPEC-003 закрыты по исходным критериям.** Публичные сведения, обязательные write-поля, совместимое чтение legacy, тарифы и единое время Bangkok подтверждены [checkpoint](issue-4-checkpoint.md), [завершением задачи](issue-4-completion.md), независимыми [Standards](reviews/issue-4-standards.md) и [Spec](reviews/issue-4-spec.md). Новые правила записи и абонементов этим этапом не объявляются реализованными.

## Интеграция

Единственный конфликт package.json разрешён сохранением обеих команд: admin bootstrap и school-time browser. Автоматически объединённый contracts.ts сохраняет roleCandidatesSchema из #7 и endTime из #4. Smoke сохраняет TelegramLogin/collision и проверяет новую общую подпись пустой площадки.

School-time runner переведён на startBrowserRuntime/runtime.close из #7; отдельные fixtures и assertions сохранены, в том числе UUID имён и Promise.all для click/response. Автор Standards проверил только изменённую часть и закрыл STD-R4-001. Итог: 0 открытых Standards, 0 Spec. Схема Prisma, миграции и зависимости не менялись.

## Совместные проверки

Node 24.19.0, Bun 1.4.2, настоящий Chrome/Next/Nest/PostgreSQL; отдельная локальная databases.integration, порты 55800/55801. BACKEND_URL сборки совпадает с backend. Jest с NODE_OPTIONS=--experimental-vm-modules. Проверки с разрешённым доступом к localhost. Логи `.mvp-local/issue4-integration-*.log` игнорируются, секреты не публикуются.

| Команда | Результат на merge |
| --- | --- |
| `bun run build` | Все 3 workspace, 0 cache, успех. |
| `bun run typecheck` | Все 3 workspace, успех. |
| `bun run --cwd apps/backend test:integration` | 3 набора, 26/26: новые поля и время + legacy, роли/CLI, collision и исходные HTTP-гарантии. |
| `bun run --cwd apps/frontend test --runTestsByPath test/training-contract.test.ts test/api.test.ts test/details.test.tsx` | 3 набора, 20/20: потребители контракта, API, SSR/card/profile для null/empty/whitespace и именованной площадки. |
| `node scripts/training-school-time.browser.mjs` | America/Los_Angeles и Asia/Tokyo PASS, exit 0: устройства имеют разные календарные даты, школа 1 ноября; календарь, цена, единый уровень, SSR legacy, профиль, create/edit. Новый общий lifecycle проверен. |
| `node scripts/browser-smoke.mjs` | 8 групп PASS, exit 0: вход/collision, анкета, session update, SSR/cancel/rebook, свежий вход, same-origin. |
| `node --check scripts/training-school-time.browser.mjs`, `git diff --check` | Успех. |

Lint и прочие unit/e2e переиспользованы с исходными SHA/датой из checkpoint; после snapshot изменялись только runner и интеграционные документы. Изменённые общие контракты и связанный UI целево проверены выше. Роли браузером уже подтверждены при интеграции #7; код ролей в этом merge не менялся.

STD-002: один Record<SkillLevel,string> используется карточкой, формой, деталями и профилем; BEGINNER везде «Начинающий». SPEC-003: locationLabel даёт «Уточняется» для null, пустой и пробельной строки; SSR и непустая площадка сохраняются.

Доступная следующая продуктовая задача — #5; независимая #14 также открыта. Полная #15, живой Telegram, production и итоговое ревью PR ещё не выполнены. PR #16 остаётся draft.
