# Issue #4: завершение сохранённой реализации

Дата: 2026-10-21. Ветка: `codex/mvp-issue-4`; task_base_sha: `a1d670b5dc173c7cf578930ffa9ca9931e5fe510`. Продуктовая реализация сохранена в `0e4c9eb50cf87ab8db6748bf2c196b741acb37ef`. Этот этап завершает недоказанные проверки из [checkpoint](issue-4-checkpoint.md); продуктовые исходники повторно не менялись. Принятие и интеграция остаются за координатором.

## Критерии и доказательства

| Критерий #4 | Реализация и проверка |
| --- | --- |
| Публичные сведения о группе и цена до записи | Обязательные create-поля; описание в деталях; HTTP create/read и browser schedule/details. |
| Независимые от устройства дата и время | Общие `schoolDateKey`, `schoolDateIso`, `schoolTimeInstant`; Bangkok в календаре, фильтре, карточке, деталях, профиле и вводе. Browser: America/Los_Angeles и Asia/Tokyo на instant `2026-10-31T18:00Z`: устройства показывают 31 октября / 1 ноября, школа — 1 ноября. |
| Серверная проверка create/PATCH и совместимость legacy | HTTP проверяет обязательные поля, запрет NOT_SET, объединённые начало/конец, omitted/null PATCH, чтение неполных старых данных без выдуманных значений, нормализацию даты. |
| Тарифы | 500 / 2200 / 4000 ฿ согласованы с информационными страницами; browser проверяет 500 перед записью. |
| STD-002 | Один типизированный `LEVEL_LABELS`, единая подпись «Начинающий»; исходные component/typecheck/lint результаты в checkpoint. |
| SPEC-003 | Общий `locationLabel`; null, пустая строка и пробелы дают «Уточняется» в карточке, SSR-деталях и профиле; непустая площадка сохранена. |

Из сценария 22 здесь доказана независимость отображения/ввода школьного времени от timezone браузера и согласованное серверное толкование даты. Границы отмены и срока абонемента относятся к последующим #5/#11; этим этапом они не объявляются реализованными.

## Проверки этого продолжения

Окружение: Windows, Node 24.19.0, Chrome headless через Playwright, настоящие Nest/Next и отдельная локальная PostgreSQL из `resources.json.databases.issue4`, порты 55640/55641. Секреты и адрес БД в отчёт не включены. Использованы существующие итоговые сборки snapshot; зависимости, lockfile, Prisma и миграции не менялись.

| Команда | Результат |
| --- | --- |
| `bun run --cwd apps/backend test:integration`, `NODE_OPTIONS=--experimental-vm-modules` | 2 набора, 21/21, 8.348 s, exit 0. |
| `node scripts/browser-smoke.mjs` | 8 сценариев PASS, exit 0: collision login, onboarding/reload/level, защита NextAuth role, SSR legacy + cancel/book, verified level при свежем входе, same-origin. |
| `node scripts/training-school-time.browser.mjs` | Оба timezone PASS, exit 0; финальный повтор после распространения Promise.all на login/create также оба PASS, exit 0. |
| `node --check scripts/training-school-time.browser.mjs` | exit 0. |
| `git diff --check` | exit 0; только предупреждение Windows autocrlf. |

Успешные backend unit 39/39, e2e 2/2, frontend 31/31, typecheck/lint/build затронутых workspace из checkpoint переиспользованы с provenance snapshot `0e4c9eb`. Причины повторять их не появилось: приложение, контракты и зависимости в этом продолжении не изменялись.

## Исправление browser runner

Первый запуск продолжения завершился timeout ожидания PATCH. Отдельно созданный Promise ответа мог отклониться, пока click ещё ожидался, и завершить процесс как unhandled rejection до штатной очистки; следующий запуск обнаружил две старые одноимённые fixture. Изменения ограничены runner: уникальный UUID в названиях событий и `Promise.all` для пар click/response при login, create, update. Первый полноценный повтор подтвердил обе timezone; продуктовый дефект редактирования не воспроизведён. Временная диагностика удалена.

## Интеграция и ограничения

- Сохранить при merge обе правки `contracts.ts`: `endTime` из #4 и `roleCandidatesSchema` из #7; совместить browser-smoke с текущим общим runtime.
- Координатор переводит school-time runner на `scripts/browser-runtime.mjs` из #7 при интеграции, сохраняя сценарии, UUID fixture и парные ожидания ответов. В этой ветке helper отсутствует.
- Независимые Standards/Spec reviews назначены координатором; исполнитель reviewer-агентов не создавал. STD-002/SPEC-003 и issue #4 не закрывались исполнителем.
- Нет миграций; новые правила записи должны использовать `schoolTimeInstant(date, startTime)`. Живой Telegram, production, общая #15 и итоговое ревью PR здесь не выполнены.
- Квота bucket `codex`, окно 300 min: старт 9%, перед browser 10%, после browser 22%, после PostgreSQL и перед последними browser 23%; финальное измерение передаётся координатору вместе с HEAD.
