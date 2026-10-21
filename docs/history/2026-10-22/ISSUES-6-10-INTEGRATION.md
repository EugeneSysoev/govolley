# #6 и #10: совместная интеграционная приёмка

2026-10-22. Обе задачи от `f47e88fd1b6fbb99af74e1dc010e20cac63af04f`.
#6: продукт `952c1cc887340f5b2f904b0be779a9d4d83c16e5`, final `e1808ff`,
merge `b9fbe79e3b4ebdd6a3cf99d9d95aa31ab72dceaa`, runner fix перенесён в `5131030`.
#10: продукт `1124e5b5a16f9d810914b48a523a401fa9984301`, final `0a3e2fc`,
merge `04cbdb4`. Отчёты перенесены в `cd0fca7` и `4540496`.

## Результат и доказательства

- [#6](issue-6-completion.md): обе роли работают с участниками, независимыми
  посещаемостью и разовой оплатой; коррекции сохраняют автора/время/причину и
  прежнее/новое значение. Идентичность действия защищает от старых повторов.
  Неизвестная legacy-оплата остаётся неизвестной до явной отметки сотрудника.
  HTTP40, frontend40, staff browser и прежний customer browser9, type/lint/build,
  empty/legacy12 миграций прошли на SHA и окружениях из отчёта.
- [#10](issue-10-completion.md): transactional outbox, snapshot сообщения,
  перезапуск отдельного процесса, восстановление lease, CAS, ошибки/повторы и
  защищённый экран сотрудника. HTTP37, реальный Telegraf с контролируемым HTTP4,
  browser6 (включая stale pagination), type/lint/build и empty/legacy12 миграций
  прошли. Живой Telegram не использовался; неоднозначная внешняя доставка допускает повтор.
- Независимые пакетные [Standards](reviews/issues-6-10-standards.md) и
  [Spec](reviews/issues-6-10-spec.md) перечисляют оба task HEAD; дополнения покрывают
  только merge union и узкую правку runner, без повторного полного ревью.

## Совместная проверка merge 04cbdb4

Конфликты разрешены объединением обеих связей User/Booking в Prisma и обоих
экспортов shared-types. Поведение задач не переписано; StaffParticipantsModule
в AppModule/browser-runtime и Notification hooks/BotModule сохранены.

Windows, Node24.19.0/Bun1.4.2; databases.integration из игнорируемого resources.json,
только локальная `govolley_mvp_integration_test`; BACKEND_URL 127.0.0.1:55800,
NEXTAUTH_URL 127.0.0.1:55801, синтетический secret, NODE_OPTIONS experimental-vm-modules.
Последовательно выполнены `node scripts/test-database.mjs`, backend `prisma:generate`,
shared-types `build`, backend `typecheck`/`build`/`test:integration`, frontend `build`.
Все PASS: **13 миграций, HTTP/PostgreSQL 5 наборов 49/49**, production frontend
включает оба новых экрана и проверку TypeScript. Логи `.mvp-local/integration-610-*.log`.
Последующие cherry-pick меняют только проверенный runner locator и документы.

Main/production не менялись. #8/#9/#11–#13, #15 и итоговое ревью всего PR ещё предстоят.

Обе задачи приняты: обе оси и узкая проверка merge/runner завершены без находок.
