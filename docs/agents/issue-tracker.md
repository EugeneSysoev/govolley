# Issue tracker: GitHub

Задачи и спецификации проекта хранятся в GitHub Issues репозитория `EugeneSysoev/govolley`. Используйте `gh` CLI и явно указывайте `--repo EugeneSysoev/govolley`, если команда выполняется вне этого клона.

## Операции

- Прочитать задачу с обсуждением: `gh issue view <number> --repo EugeneSysoev/govolley --comments`.
- Прочитать структурированные данные, включая метки и статус: `gh issue view <number> --repo EugeneSysoev/govolley --json number,title,body,labels,comments,state`.
- Найти открытые задачи: `gh issue list --repo EugeneSysoev/govolley --state open --json number,title,body,labels`; при необходимости добавьте фильтр `--label`.
- Создать задачу: `gh issue create --repo EugeneSysoev/govolley --title "..." --body-file <path>`. Многострочное описание сначала сохраните в UTF-8 файл с настоящими переводами строк.
- Добавить комментарий: `gh issue comment <number> --repo EugeneSysoev/govolley --body-file <path>`.
- Добавить или снять метку: `gh issue edit <number> --repo EugeneSysoev/govolley --add-label "..."` / `--remove-label "..."`.
- Назначить исполнителя: `gh issue edit <number> --repo EugeneSysoev/govolley --add-assignee @me`.
- Закрыть задачу после выполнения критериев готовности: `gh issue close <number> --repo EugeneSysoev/govolley`. Результат и проверки зафиксируйте комментарием перед закрытием.

При ссылке вида `#42` учитывайте, что GitHub использует общую нумерацию задач и PR. Если номер относится к PR, читайте его через `gh pr view` и `gh pr diff`.

## Когда навык просит опубликовать задачу

Создайте GitHub issue в указанном репозитории. Включите проблему, воспроизведение, ожидаемое поведение и проверяемые критерии готовности. Для замечаний из `docs/agents/code-review-findings.md` сохраняйте идентификатор STD-xxx или SPEC-xxx в описании и записывайте ссылку на созданную задачу в соответствующем пункте отчёта.

## Когда навык просит получить исходную задачу

Читайте тело, метки и комментарии GitHub issue по указанному номеру или ссылке. Именно задача содержит исходные требования; README дополняет её контрактами проекта. Если исходная задача не указана, используйте порядок поиска из вызывающего навыка.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Wayfinding operations

- Карта работы — одна issue с меткой `wayfinder:map`; дочерние задачи связаны с ней как GitHub sub-issues.
- Если sub-issues недоступны, ведите список дочерних задач в теле карты, а в начале дочерней задачи укажите `Part of #<map>`.
- Тип задачи обозначается `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling` или `wayfinder:task`.
- Блокировки отражаются нативными GitHub issue dependencies; если они недоступны, используйте строку `Blocked by: #<number>, #<number>` в начале описания.
- Следующая задача — первая в порядке карты открытая задача без открытых блокировок и исполнителя.
- При взятии задачи назначьте исполнителя. После решения добавьте ответ и результаты проверок комментарием, закройте задачу и внесите краткий результат со ссылкой в Decisions-so-far карты.
