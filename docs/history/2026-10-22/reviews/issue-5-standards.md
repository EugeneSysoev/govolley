# Standards review: #5

Дата: 2026-10-22. Task base: `e15ac1bc1150434bd8c9e15c18723b527a88f334`; immutable HEAD: `1069ce2255497c8843818dcee8fce15eda64bc24`.

Область: `git -C .worktrees/issue-5 diff e15ac1bc1150434bd8c9e15c18723b527a88f334...1069ce2255497c8843818dcee8fce15eda64bc24`. Commit list (`git log base..HEAD --oneline`): `1069ce2 feat: implement cash booking eligibility and preserved cancellation history`.

Policy source: текущие root AGENTS.md / development-plan.md на `5a5bece5433625b875e0c1a2a626aefbc197cbc1`; относительно прочитанного `1a1cc3a` изменений этих правил нет. Также прочитаны README.md, codebase-design.md, CONTEXT.md и актуальная issue `.mvp-local/current-issue-5.md`. Разрешение владельца использовать полный пятичасовой лимит заменяет прежний порог остановки. Все 12 smell-эвристик code-review рассмотрены как оценочные; инструментально проверяемые правила исключены.

**Обязательные нарушения: нет. Оценочные actionable smells: нет.**

- README и codebase-design требуют общего протокола row lock для записи, отмены и изменения тренировки. Правила остаются в TrainingService: блокировка Training предшествует чтениям и записи, дополнительная User lock защищает актуальный уровень и идентичность запроса. Повтор requestId не создаёт новое действие; cancel ограничен bookingId, trainingId и текущим владельцем, поэтому отложенный повтор не отменяет следующую запись.
- Требование README об актуальной личности и запрете подмены служебных полей сохранено: строгие HTTP-схемы принимают только идентификаторы действия, владелец берётся из JWT guard. Публичный training DTO содержит только bookingId посетителя; история фильтруется по текущему пользователю и формируется явно, без отдачи внутренних User/Booking объектов.
- Совместимость чтения и различие legacy/payment evidence сохранены: новые SQL-колонки имеют безопасные legacy/default/null, существующие строки не переписываются; partial unique допускает историю при одном CONFIRMED месте. SINGLE_CASH сохраняет 500/CASH, без подтверждения получения оплаты. Контракт истории общий, TypeScript-тип выводится из Zod.
- TrainingClock имеет реальный production adapter и управляемую HTTP-тестовую замену; это существующая потребность проверки границ времени, а не speculative abstraction. UI использует trainingApi и существующие справочники отображения.

Проверка ограничена чтением diff и вызывающих модулей; suite не повторялся. Evidence координатора на исходном SHA: HTTP/PostgreSQL 34, browser 9/9, empty/legacy 11 migrations, frontend 32/build/typecheck/lint, backend 39 unit + 2 e2e/typecheck/lint. [Отчёт исполнителя](../issue-5-completion.md). Это не заменяет независимую ось Spec.

Changed-part: `git diff 1069ce2255497c8843818dcee8fce15eda64bc24..cca2c294993410f1059f523aefb8a74815356e4b`; log: `cca2c29 fix: reject booking identifiers outside PostgreSQL integer range`. Проверены только controller и HTTP regression: верхняя граница ID согласована с PostgreSQL Int (`2147483647`), malformed UUID отклоняется прежней схемой. Новых нарушений/smells нет. Координатор подтвердил backend typecheck и целевой HTTP 1/1 green; суммарное HTTP evidence 35 (33 основной набор + 1 legacy + 1 диапазон). Повтор полного обзора не требуется.
