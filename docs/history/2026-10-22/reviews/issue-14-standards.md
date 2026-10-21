# Standards review: #14 — runner/fixture

Дата: 2026-10-22. Task base: `d173c5edd83159c20c54d274cbec6fad05168b5a`; проверяемый HEAD: `ea4b36e7ff4be515cd673119b32c1b5f14169f6f`.

Область: `git -C .worktrees/issue-14 diff d173c5edd83159c20c54d274cbec6fad05168b5a...ea4b36e7ff4be515cd673119b32c1b5f14169f6f -- scripts/weather.browser.mjs scripts/weather-provider-fixture.cjs`. Соответствующий log: `34959e2` (runner/fixture), `ea4b36e` (Windows preload path). Продуктовый route/widget повторно не рецензировался: [предыдущее Standards review](../../2026-10-21/reviews/issue-14-standards.md).

Policy source: root AGENTS.md / development-plan.md на `1a1cc3a2fbf9a00374224335e018116d0fa1626f`, разрешение владельца использовать полный пятичасовой лимит; README.md, исходное STD-001 и актуальное тело issue из `.mvp-local/current-issue-14.md`. Все 12 smell-эвристик code-review рассмотрены как оценочные; инструментально проверяемые правила исключены.

**Обязательные нарушения: нет. Оценочные actionable smells: нет.**

- README требует не хранить секреты в Git и оставлять OpenWeather-ключ вне браузера; STD-001 требует same-origin и устойчивости к отказу. Runner задаёт только синтетические credentials, проверяет точный HTTP-ответ, состояние виджета, same-origin запрос, отсутствие provider URL/ключа в browser URLs/HTML и клиентских файлах. Ответ fixture намеренно содержит sentinel: точное сравнение HTTP JSON проверяет, что сервер его отбрасывает.
- Fixture подменяет только фиксированный OpenWeather origin и проверяет путь/appid, сохраняя настоящий транспорт остальных HTTP-запросов. Она подключается через NODE_OPTIONS дочернего Next; product-код и общий runtime не меняются. Нормализация Windows-пути ограничена нужным preload.
- Сценарии последовательно переиспользуют runtime, освобождаемый в finally. Не добавлены абстракции без текущего потребителя или разнесённые владельцы одного поведения.

Проверка — чтение зафиксированного diff и [отчёта исполнителя](../issue-14-completion.md); новые тесты не запускались. Отчёт подтверждает exit 0 на exact `ea4b36e`: HTTP/browser success, provider 401 и missing-key, scan 40 клиентских файлов; реальные provider credentials и внешние OpenWeather-запросы не использовались. Закрытие STD-001 и интеграция принадлежат координатору.
