import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { startBrowserRuntime } from './browser-runtime.mjs';

// Real NextAuth + Nest + PostgreSQL. Telegram confirmation is replaced by a fixture.
// Build with BACKEND_URL matching TEST_BACKEND_PORT before running.
const runtime = await startBrowserRuntime({ backendPort: 55440, frontendPort: 55441, secret: 'browser-smoke-only-secret' });
const { base, db, browser, sessions } = runtime;
let userId;
let previousOwnerId;
let trainingId;
const ids = [];
const results = [];
try {
  const username = `browser_${randomUUID().replaceAll('-', '').slice(0, 16)}`;
  const identity = { id: Date.now(), username, first_name: 'Browser Fixture' };
  const previousOwner = await db.user.create({ data: { username, firstName: 'Previous username owner' } });
  previousOwnerId = previousOwner.id;
  const user = await db.user.create({ data: { telegramId: String(identity.id), firstName: 'Browser Fixture', role: 'COACH' } });
  userId = user.id;
  const event = await db.training.create({ data: { title: 'Browser smoke training', date: new Date(), startTime: '07:00', endTime: '09:00', maxParticipants: 1 } });
  trainingId = event.id;
  await db.booking.create({ data: { userId, trainingId } });
  const context = await browser.newContext();
  await context.route('https://t.me/**', (route) => route.abort());
  const page = await context.newPage();
  const apiAddresses = [];
  page.on('request', (request) => { if (request.url().includes('/api/')) apiAddresses.push(request.url()); });
  async function login() {
    await page.goto(`${base}/auth/signin`);
    const initialized = page.waitForResponse((response) => response.url() === `${base}/api/bot-auth/init-session` && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Войти через Telegram', exact: true }).click();
    const { sessionId: id } = await (await initialized).json();
    ids.push(id);
    // Only Telegram's external identity assertion is replaced. The UI starts,
    // polls and exchanges a genuine session through NextAuth and the backend.
    await sessions.confirm(id, identity);
    await page.waitForURL(/\/(profile|onboarding)$/);
    assert.equal((await db.authSession.findUniqueOrThrow({ where: { id } })).status, 'CONSUMED');
    const session = await (await context.request.get(`${base}/api/auth/session`)).json();
    assert.equal(Number(session.user.id), userId);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id: previousOwnerId } })).username, username);
  }
  await login();
  results.push('TelegramLogin UI handles username collision without taking another profile');
  await page.goto(`${base}/`);
  await page.waitForURL('**/onboarding');
  await page.getByText('Определяем твой уровень', { exact: true }).waitFor({ state: 'visible' });
  results.push('home -> NOT_SET onboarding visible');
  await page.reload();
  await page.getByText('Определяем твой уровень', { exact: true }).waitFor({ state: 'visible' });
  results.push('direct onboarding reload visible');
  for (const label of ['Постоянно участвую в турнирах', 'Силовая в прыжке или острый планер', 'Идеально под рабочую руку', 'Читаю нападающего, полная координация', 'Погода не влияет, использую ветер']) {
    await page.getByRole('button', { name: label, exact: true }).click();
  }
  await page.waitForURL('**/profile');
  await page.getByText('Продвинутый', { exact: true }).waitFor({ state: 'visible' });
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: userId } })).skillLevel, 'ADVANCED');
  results.push('onboarding answers -> server ADVANCED');
  const csrf = await (await context.request.get(`${base}/api/auth/csrf`)).json();
  await context.request.post(`${base}/api/auth/session`, { data: { csrfToken: csrf.csrfToken, data: { user: { role: 'ADMIN', isLevelVerified: true } } } });
  const current = await (await context.request.get(`${base}/api/auth/session`)).json();
  assert.equal(current.user.role, 'COACH'); assert.equal(current.user.isLevelVerified, false);
  results.push('NextAuth update rejects forged role/verification');
  await page.goto(`${base}/training`);
  await page.getByRole('button', { name: /Посмотреть детали/ }).click();
  await page.waitForURL(`**/training/${trainingId}`);
  await page.getByText('Локация уточняется', { exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /Отменить запись/ }).click();
  await page.getByRole('button', { name: /Подтвердить/ }).waitFor({ state: 'visible' });
  assert.equal((await db.booking.findUniqueOrThrow({ where: { userId_trainingId: { userId, trainingId } } })).status, 'CANCELLED');
  results.push('SSR null location + cancel full group');
  await page.getByRole('button', { name: /Подтвердить/ }).click();
  await page.getByRole('button', { name: /Отменить запись/ }).waitFor({ state: 'visible' });
  await page.goto(`${base}/profile`);
  await page.getByRole('link', { name: /Детали и отмена записи/ }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Подтвердить уровень', exact: true }).click();
  await page.getByText('✓', { exact: true }).waitFor({ state: 'visible' });
  const signoutCsrf = await (await context.request.get(`${base}/api/auth/csrf`)).json();
  await context.request.post(`${base}/api/auth/signout`, { form: { csrfToken: signoutCsrf.csrfToken, json: 'true' } });
  await login();
  await page.goto(`${base}/profile`);
  await page.getByText('✓', { exact: true }).waitFor({ state: 'visible' });
  results.push('verified level survives logout + fresh one-shot login');
  assert(apiAddresses.every((url) => url.startsWith(`${base}/api/`)));
  results.push('browser API stays same-origin; NextAuth routes preserved');
  console.log(JSON.stringify({ passed: results }, null, 2));
} finally {
  await runtime.close(async () => {
    await db.authSession.deleteMany({ where: { id: { in: ids } } });
    if (trainingId) await db.training.delete({ where: { id: trainingId } });
    if (userId) await db.user.delete({ where: { id: userId } });
    if (previousOwnerId) await db.user.delete({ where: { id: previousOwnerId } });
  });
}
