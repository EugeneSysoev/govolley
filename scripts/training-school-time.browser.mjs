import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { startBrowserRuntime } from './browser-runtime.mjs';

// Real frontend, Nest HTTP and dedicated PostgreSQL; only Telegram's identity
// assertion is a fixture. Build with the same BACKEND_URL before running.
const frontendRequire = createRequire(new URL('../apps/frontend/package.json', import.meta.url));
const { expect } = frontendRequire('@playwright/test');
const runtime = await startBrowserRuntime({ backendPort: 55640, frontendPort: 55641, secret: 'school-time-browser-only-secret' });
const { base, db, browser, sessions } = runtime;
const trainingIds = [];
const userIds = [];
const sessionIds = [];
const results = [];
const runId = randomUUID();
try {
  for (const [index, timezoneId] of ['America/Los_Angeles', 'Asia/Tokyo'].entries()) {
    const identity = { id: Date.now() + index, first_name: 'School time coach' };
    const coach = await db.user.create({ data: { telegramId: String(identity.id), firstName: identity.first_name, role: 'COACH', skillLevel: 'BEGINNER' } });
    userIds.push(coach.id);
    const event = await db.training.create({ data: {
      title: `School day ${index} ${runId}`, date: new Date('2026-10-31T18:00:00Z'), startTime: '07:00', endTime: '09:00',
      targetLevel: 'BEGINNER', maxParticipants: 10, price: 500, coachName: 'Coach', description: 'Работа над приёмом', location: index ? '   ' : null,
    } });
    trainingIds.push(event.id);
    await db.booking.create({ data: { userId: coach.id, trainingId: event.id } });
    const context = await browser.newContext({ timezoneId });
    await context.route('https://t.me/**', (route) => route.abort());
    const page = await context.newPage();
    await page.clock.install({ time: new Date('2026-10-31T18:00:00Z') });
    assert.equal(await page.evaluate(() => new Date().getDate()), index ? 1 : 31);
    await page.goto(`${base}/training`);
    await page.getByRole('heading', { name: event.title, exact: true }).waitFor();
    const card = page.getByRole('article', { name: event.title, exact: true });
    await card.getByText('500 ฿', { exact: true }).waitFor();
    await card.getByText('Начинающий', { exact: true }).waitFor();
    await card.getByText('Уточняется', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Открыть календарь' }).click();
    assert.equal(await page.getByRole('button', { name: '2026-11-01', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: '2026-11-02', exact: true }).click();
    await page.getByRole('button', { name: 'Выбрать', exact: true }).click();
    await expect(page.getByRole('heading', { name: event.title, exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Открыть календарь' }).click();
    await page.getByRole('button', { name: '2026-11-01', exact: true }).click();
    await page.getByRole('button', { name: 'Выбрать', exact: true }).click();
    await page.getByRole('heading', { name: event.title, exact: true }).waitFor();
    // Anonymous SSR and hydrated detail agree even across a device date change.
    await page.goto(`${base}/training/${event.id}`);
    await page.getByText('Работа над приёмом', { exact: true }).waitFor();
    await page.getByText('01.11.26', { exact: true }).waitFor();
    await page.getByText('500 ฿', { exact: true }).waitFor();
    await page.getByText('Время Пхукета (Asia/Bangkok, UTC+7)', { exact: true }).waitFor();
    for (const location of ['', '   ', null, 'Karon Beach']) {
      await db.training.update({ where: { id: event.id }, data: { location } });
      const ssr = await (await context.request.get(`${base}/training/${event.id}`)).text();
      assert(ssr.includes(location?.trim() || 'Уточняется'));
    }
    await db.training.update({ where: { id: event.id }, data: { location: '' } });
    // Auth TTL uses the server clock. The controlled midnight scenario above
    // is complete; restore real time before obtaining a short-lived session.
    await page.clock.setSystemTime(new Date());
    await page.goto(`${base}/auth/signin`);
    const [initialized] = await Promise.all([
      page.waitForResponse((response) => response.url() === `${base}/api/bot-auth/init-session` && response.request().method() === 'POST'),
      page.getByRole('button', { name: 'Войти через Telegram', exact: true }).click(),
    ]);
    const { sessionId } = await initialized.json();
    sessionIds.push(sessionId);
    await sessions.confirm(sessionId, identity);
    await page.waitForURL('**/profile');
    await page.getByText('1 ноября', { exact: true }).waitFor();
    await page.getByText('07:00 — 09:00', { exact: true }).waitFor();
    await page.getByText('Уточняется', { exact: true }).waitFor();
    await page.getByText('Начинающий', { exact: true }).waitFor();
    await page.goto(`${base}/training`);
    await page.getByRole('button', { name: '+ Создать тренировку', exact: true }).click();
    await expect(page.getByLabel('Дата по Пхукету', { exact: true })).toHaveValue('2026-11-01');
    await page.getByLabel('Дата по Пхукету', { exact: true }).fill('2026-11-02');
    await page.getByLabel('Название тренировки', { exact: true }).fill(`Created in ${timezoneId} ${runId}`);
    await page.getByLabel('Тренер', { exact: true }).fill('School coach');
    await page.getByLabel('Описание (необязательно)', { exact: true }).fill('Тренировка группы');
    const [createdResponse] = await Promise.all([
      page.waitForResponse((response) => response.url() === `${base}/api/training` && response.request().method() === 'POST'),
      page.getByRole('button', { name: 'Создать тренировку', exact: true }).click(),
    ]);
    const created = await createdResponse.json();
    assert.equal(created.date, '2026-11-01T17:00:00.000Z');
    assert.equal(created.price, 500);
    assert.equal(created.startTime, '07:00');
    trainingIds.push(created.id);
    await page.getByRole('button', { name: 'Открыть календарь' }).click();
    await page.getByRole('button', { name: '2026-11-02', exact: true }).click();
    await page.getByRole('button', { name: 'Выбрать', exact: true }).click();
    await page.getByRole('heading', { name: created.title, exact: true }).waitFor();
    await page.getByRole('article', { name: created.title, exact: true }).getByRole('button', { name: 'Редактировать тренировку', exact: true }).click();
    await expect(page.getByLabel('Дата по Пхукету', { exact: true })).toHaveValue('2026-11-02');
    await expect(page.getByLabel('Начало', { exact: true })).toHaveValue('07:00');
    await page.getByLabel('Конец', { exact: true }).fill('10:00');
    const [updatedResponse] = await Promise.all([
      page.waitForResponse((response) => response.url() === `${base}/api/training/${created.id}` && response.request().method() === 'PATCH'),
      page.getByRole('button', { name: 'Обновить данные', exact: true }).click(),
    ]);
    const updated = await updatedResponse.json();
    assert.equal(updated.date, '2026-11-01T17:00:00.000Z');
    assert.equal(updated.endTime, '10:00');
    await page.getByText('07:00 — 10:00', { exact: true }).waitFor();
    results.push(`${timezoneId}: public schedule, calendar day change, SSR, legacy locations, price, profile, staff create/edit agree in Bangkok`);
    console.log(`PASS: ${timezoneId}`);
    await context.close();
  }
  console.log(JSON.stringify({ passed: results }, null, 2));
} finally {
  await runtime.close(async () => {
    await db.authSession.deleteMany({ where: { id: { in: sessionIds } } });
    await db.training.deleteMany({ where: { id: { in: trainingIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
  });
}
