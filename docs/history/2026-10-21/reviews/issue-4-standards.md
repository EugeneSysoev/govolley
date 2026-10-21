# Standards review: #4 и интеграция #7

Дата: 2026-10-21. Policy source: корневые AGENTS.md и docs/agents/development-plan.md на `4326a53cff3cd0689f91ceaf02ceeb723d8153a3`; дополнительно README.md и docs/agents/codebase-design.md (контракты тренировок, подписи, сохраняемые seams). Проверены все 12 smell-эвристик навыка code-review; они не являются обязательными правилами. Правила, проверяемые инструментами, исключены.

## Область #4

Команда: `git -C .worktrees/issue-4 diff a1d670b5dc173c7cf578930ffa9ca9931e5fe510...0e4c9eb50cf87ab8db6748bf2c196b741acb37ef`.

Коммиты `base..head`: `0e4c9eb wip: preserve issue #4 implementation and pending acceptance`.

Обязательных нарушений не найдено. Схема чтения остаётся независимой от записи; нормализация PATCH не затрагивает отсутствующие поля. Подписи уровней и пустой локации собраны во frontend. Протокол блокировки TrainingService не распределён по вызывающим модулям.

**STD-R4-001 — P3, эвристика Duplicated Code.** `scripts/training-school-time.browser.mjs:19–46,145–151`: повторены создание Nest/Next/Chrome и освобождение ресурсов из browser-smoke, например `const frontend = spawn(process.execPath, ...)` и `await browser?.close(); frontend.kill();`. При этом интегрированный #7 уже содержит `scripts/browser-runtime.mjs` с общим lifecycle, обработкой ошибки запуска и гарантированным закрытием приложения при ошибке fixture cleanup. Два варианта будут расходиться при изменении портов, ожидания готовности и обработки сбоев; school-time уже использует менее надёжную очистку. Решение: исправить при интеграции #4, перевести runner на `startBrowserRuntime` и `runtime.close`, сохранив сценарии. Отдельный рефакторинг до получения helper в task_base не требуется; ограничение заранее записано исполнителем в checkpoint.

## Merge #7

Проверено только изменение `721414e → e740648` в `scripts/browser-smoke.mjs` / `scripts/browser-runtime.mjs`, а helper дополнительно сравнен с `4cbdd95`; полный обзор #7 не повторялся.

Новых обязательных нарушений или actionable smells не найдено. Перенос lifecycle сохраняет TelegramLogin через реальный UI, fixture подтверждения, проверку CONSUMED, принадлежности session.user.id и прежнего владельца username, а также повторный login после signout. Helper сохраняет прежнее поведение #7 и добавляет проверку портов и доступ к AuthSessionService.

Итог: 0 обязательных нарушений, 1 оценочный P3. Это чтение кода, не подтверждение приёмки: suite не запускался по поручению координатора. Квота codex/300 минут: 12% в начале, 17% в конце.
