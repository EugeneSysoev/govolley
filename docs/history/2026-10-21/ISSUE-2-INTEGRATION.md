# Интеграция issue #2 — 2026-10-21

Задача #2 принята в `codex/govolley-mvp` после #3. База задачи: `f685aa55f1e8e340401d9f582bf8beef35c3f6e5`; принятый HEAD: `37093608732623b7d82e8698d7a35da59d9978bc`; интеграция начата от `7b33073`; merge `--no-ff`: `dabd0c4a4c3554c0af2734248af73046ebc290ec`. Слияние без конфликтов, код реализации при интеграции не менялся. Миграций, изменений Prisma-схемы и lockfile нет.

## Приёмка

- [Standards](reviews/issue-2-standards.md): 0 открытых документированных нарушений, 0 открытых оценочных замечаний. Историческое P3 о списке SkillLevel закрыто отдельным исправлением в принятом HEAD; исходная находка сохранена.
- [Spec](reviews/issue-2-spec.md): замечаний нет. Оба отчёта содержат первоначальную базу задачи и повторную проверку финального HEAD; их исторические результаты сохранены со своей датой/областью.
- `bun run --cwd packages/shared-types build` — успешно на merge SHA.
- `bun run --cwd apps/backend typecheck` — успешно на merge SHA.
- `bun run --cwd apps/backend test:integration` — успешно на merge SHA: 2 набора, 18/18 тестов, включая 3 новых сценария #2, 2 регрессии #3 и сохранённые гарантии ролей, записи, отмены и авторизации. Использованы отдельная локальная `govolley_mvp_integration_test`, `TEST_DATABASE_URL` из игнорируемой `.mvp-local/resources.json`, `NODE_OPTIONS=--experimental-vm-modules` и bundled Node runtime. Доступ к localhost проверен вне sandbox. Development/production БД не использованы; миграции не запускались.
- `bun run --cwd apps/frontend test --runTestsByPath test/training-contract.test.ts test/api.test.ts test/details.test.tsx --testMatch '**/test/**/*.test.ts' '**/test/**/*.test.tsx'` — 3 набора, 17/17 тестов на merge SHA: общий runtime-контракт, browser API, SSR и карточка.
- `git diff --check` — успешно для документов интеграции.

SPEC-002 закрыта после проверки собственных критериев. PATCH/DELETE для записанного COACH/ADMIN возвращают `isBooked: true`, для незаписанного — false; GET согласован с ними. Мягкое скрытие сохраняет бронь и последующую отмену, проверки ролей и транзакционная блокировка сохранены. Отдельный HTTP-сценарий различает пропущенные PATCH-поля и явную nullable-очистку. Shared runtime-схема остаётся единственным источником типа чтения; контракт ответа не применяет ограничения записи к сохранённым данным и не раскрывает участников.

Полный lint/build, unit/e2e и браузерный smoke задачи выполнялись ранее и сохранены в [исходном отчёте](../2026-10-19/issue-2-training-contract.md); их повторное выполнение интегратором не заявляется. Живой Telegram и production не проверялись. Это приёмка #2 в общую ветку; итоговая #15 и ревью полного PR ещё предстоят. #4 теперь может стартовать от актуального интеграционного SHA после сохранения этой приёмки. GitHub/push выполняет координатор; worktree сохранён до общей очистки.
