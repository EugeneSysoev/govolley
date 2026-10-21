# GoVolley MVP: продолжение

Обновлено 2026-10-21 после приёмки #7/#4. Текущая работа: независимая #14; #5 доступна после принятой #4. До завершения запуска сверять финальный checkpoint и git, поскольку работа может продолжаться.

## Первые действия

1. Прочитать [действующий процесс](development-plan.md), проверить get_usage_limits: bucket `codex`, абсолютный usedPercent окна 300 минут. При >=50% только сохранение/завершение; с 40% не начинать задачи, с 45% checkpoint и остановка. В этом запуске старт 7%, последнее измерение 31%; это исторический показатель, не текущий датчик.
2. Сверить git status, worktree list, HEAD и PR #16. Сохранить существующий WIP. Для продуктового запуска один раз PROJECT.md → MVP-SPEC.md; исполнителям только применимые разделы.
3. Сначала закончить начатую #14 с независимым Standards/Spec и интеграцией; затем доступный граф по бюджету. Максимум два исполнителя, fork_turns="none". Полный процесс в development-plan.md, включая проверки по риску и переиспользование evidence.

## Репозиторий и PR

- Root: C:/Users/User/Desktop/Рабочий стол/Кодинг/Проекты/govolley.
- Интеграционная ветка codex/govolley-mvp. Принятый кодовый merge #4: `0a2ab89b9d79656a54eacff9e760e5cc7404d471`; следующий документальный HEAD `d173c5edd83159c20c54d274cbec6fad05168b5a` подтверждён push в origin.
- [Единственный PR #16](https://github.com/EugeneSysoev/govolley/pull/16), draft, base main. Ready запрещён до #15 и итогового двухосевого ревью фактического PR diff. Main/production не изменять.
- Исходный SHA MVP f685aa55f1e8e340401d9f582bf8beef35c3f6e5, baseline 479a127b6827c62599ce08dcb0839b2df5fa11dd. Последняя подтверждённая удалённая base main 0959c948a7a287d06f84728799ebe5b1be68eaad; итоговое ревью включает весь PR, включая прежний локальный baseline.
- Обычные git worktree под `.worktrees/`, сохранять до завершения. Они не управляются приложением.

| Issue | Ветка / worktree | SHA / статус |
| --- | --- | --- |
| #2 | codex/mvp-issue-2 / .worktrees/issue-2 | 37093608732623b7d82e8698d7a35da59d9978bc; принята/закрыта, merge dabd0c4a4c3554c0af2734248af73046ebc290ec |
| #3 | codex/mvp-issue-3 / .worktrees/issue-3 | 8b22bde223d6eaa04f4c7fe6c3ca7119d71a9997; принята/закрыта, merge 5bc32e50132b1d696aa258c7cf995e7c0f4f1853 |
| #7 | codex/mvp-issue-7 / .worktrees/issue-7 | 4cbdd9525d70d798b22e16cc1c0d41f6fd136607; принята/закрыта, merge e740648f047c302702c687d077e005c77a40dd95 |
| #4 | codex/mvp-issue-4 / .worktrees/issue-4 | 56cd765a49e8c2cb7ac74209337e932b1767a629; принята/закрыта, merge 0a2ab89; worktree чистая при передаче |
| #14 | codex/mvp-issue-14 / .worktrees/issue-14 | начата от task_base_sha d173c5edd83159c20c54d274cbec6fad05168b5a; итог и dirty проверить |

Task bases #2/#3: f685aa55f1e8e340401d9f582bf8beef35c3f6e5; #7:6cdd0bf2d2a3c79d39ae16eb36a5d4223e624908; #4:a1d670b5dc173c7cf578930ffa9ca9931e5fe510. В существующих worktree инструкции могут быть старыми: policy_source — актуальные AGENTS.md и development-plan.md интеграционного root с явным SHA. Отдельное копирование процессных файлов в продуктовые ветки не требуется.

## Принятые #7/#4

- [Приёмка #7](../history/2026-10-21/ISSUE-7-INTEGRATION.md): на HEAD 4326a53 HTTP/PostgreSQL 23/23, build/typecheck, smoke 8, roles 4, дополнительно frontend contract 11/11. Сохранены TelegramLogin/collision из #3 и общий browser-runtime из #7. Обе оси проверили конфликтную часть без замечаний. GitHub #7 закрыта после evidence-комментария.
- [Приёмка #4](../history/2026-10-21/ISSUE-4-INTEGRATION.md): на merge 0a2ab89 HTTP/PostgreSQL 26/26, frontend contracts/API/SSR 20/20, build/typecheck, school-time browser оба timezone и smoke 8. School-time переведён на общий runtime, UUID fixtures и Promise.all response/click сохранены. STD-R4-001 проверен автором и закрыт. STD-002/SPEC-003 закрыты по исходным критериям, GitHub#4 закрыта после evidence.
- Исходные успешные unit/lint/e2e задачи переиспользованы со snapshot 0e4c9eb и датой из [checkpoint](../history/2026-10-21/issue-4-checkpoint.md)/[completion](../history/2026-10-21/issue-4-completion.md). Без новой причины повторять не нужно.
- Shared `schoolDateKey`, `schoolDateIso`, `schoolTimeInstant`, `SCHOOL_TIME_ZONE` экспортируются из shared-types. Для #5/#11 использовать schoolTimeInstant(date,startTime), не локальный конструктор Date. Чтение legacy сохраняется без выдуманных значений.
- В contracts.ts сохранены и endTime для профиля, и roleCandidatesSchema. Нет новых миграций/lockfile.

## Следующие задачи

Полностью приняты 4 из 14 задач: #2/#3/#4/#7. #14 начата; #5 доступна, остальные блокировки неизменны. Полный граф сверён с GitHub при старте; комментариев у #4/#5/#7/#14 не было.

- #14: same-origin weather, серверный OPENWEATHER_API_KEY без попадания в bundle/browser, корректная недоступность, docs/env, controlled transport success/failure, HTTP/browser и bundle scan. STD-001 остаётся open до доказательств. Не менять зависимости/Prisma/shared-контракты. Порты55840/55841, databases.issue14 при необходимости.
- #5 после принятой #4: запись по актуальному уровню, время до начала, разовая 500 на месте без признания оплаты, своевременная/поздняя отмена с точной границей 3 часов, новая запись после отмены с сохранённой историей. Совместимая legacy миграция, HTTP/PostgreSQL с управляемым временем и browser. Не объявлять готовность по старому smoke, который ещё не проверяет новые правила.
- Далее #6 → #8/#9, после #5 также#10, затем #11 → #12 → #13 → #15. #15 включает все 25 сценариев и полный набор. Потом итоговый обзор всего PR двумя осями.

Для #11 сохранена [записка о пакетных инвариантах](../history/2026-10-21/package-invariants.md); требования и рекомендации разделены, это не реализация и не новое продуктовое решение.

## Ресурсы

| Ресурс | Использование |
| --- | --- |
| Тестовые БД | Root `.mvp-local/resources.json`, databases.issueN/integration/legacy, отдельная тестовая роль. Не печатать/не коммитить URL/пароль. setup-db.cjs только при необходимости; test-database.mjs применяет миграции только к локальной *_test. Production/development не мигрировать. |
| Порты | #4 55640/55641; #7 55570/55571; integration 55800/55801; #14 55840/55841. BACKEND_URL сборки должен совпадать с backend. TEST_BACKEND_PORT/TEST_FRONTEND_PORT у runner. |
| Node | PATH C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin. При недоступности load_workspace_dependencies. Node 24.19.0, Bun 1.4.2. |
| Sandbox | Localhost PostgreSQL даёт EACCES, sandbox next build может зависать. С разрешённым доступом checks/build прошли. Отказ sandbox не означает остановку службы. |
| Jest | NODE_OPTIONS=--experimental-vm-modules для MIME. Frontend hidden worktree: --testMatch '**/test/**/*.test.ts' '**/test/**/*.test.tsx'. |
| Dependencies | Свои node_modules в worktree; install только при отсутствии/новых входах. При Bun EBADF/EPERM BUN_TMPDIR в игнорируемом каталоге и разрешённый доступ. |
| GitHub | Connector читает, запись comment вернула403. Локальный игнорируемый `.mvp-local/github-write.ps1` использует существующий Git credential и REST без вывода токена: -IssueNumber N -BodyFile <UTF8 markdown> -Close. Прежний gh.ps1 указывает на исчезнувший TEMP binary; не использовать без восстановления. Git push выполнен штатно. |
| Логи | `.mvp-local/resume-*.log` для #7, `.mvp-local/issue4-integration-*.log` для объединённых #4/#7; локальные/игнорируются. |

Живой Telegram, production, #15 и итоговое ревью всего PR ещё не выполнены. Перед остановкой обновить этот файл финальным состоянием #14, квотой, SHA/dirty, невыполненными проверками и следующим шагом, сохранить WIP и push интеграции. Сброса квоты не ждать.
