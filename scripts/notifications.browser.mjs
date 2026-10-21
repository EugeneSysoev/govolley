import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { startBrowserRuntime } from './browser-runtime.mjs';
import { NotificationDeliveryDriver } from '../apps/backend/dist/src/notifications/notification-delivery.js';

const runtime = await startBrowserRuntime({ backendPort: 56000, frontendPort: 56001, secret: 'notifications-browser-only-secret' });
const { base, db, browser } = runtime;
const users = [], sessions = [], trainings = [], passed = [];
try {
  async function login(role) {
    const user = await db.user.create({ data: { role, firstName: `Notification ${role}`, telegramId: randomUUID(), skillLevel: 'BEGINNER' } });
    users.push(user.id);
    const id = randomUUID(); sessions.push(id);
    await db.authSession.create({ data: { id, status: 'CONFIRMED', userId: user.id } });
    const context = await browser.newContext({ timezoneId: 'America/Los_Angeles' });
    const csrf = await (await context.request.get(`${base}/api/auth/csrf`)).json();
    assert.equal((await context.request.post(`${base}/api/auth/callback/telegram-session`, {
      form: { csrfToken: csrf.csrfToken, sessionId: id, callbackUrl: `${base}/profile`, json: 'true' },
    })).status(), 200);
    const session = await (await context.request.get(`${base}/api/auth/session`)).json();
    return { user, context, page: await context.newPage(), headers: { Authorization: `Bearer ${session.accessToken}` } };
  }
  const student = await login('USER'), staff = await login('COACH'), admin = await login('ADMIN');
  const training = await db.training.create({ data: { title: `Контроль доставки ${randomUUID()}`, date: new Date('2099-11-01T00:00:00Z'), startTime: '07:00', endTime: '09:00', targetLevel: 'BEGINNER' } });
  trainings.push(training.id);
  assert.equal((await student.context.request.post(`${base}/api/training/book`, { headers: student.headers, data: { trainingId: training.id, requestId: randomUUID() } })).status(), 201);
  let now = Date.now() + 1000, fail = true;
  const driver = new NotificationDeliveryDriver(db, { async send() { if (fail) throw new Error('credential must not appear'); } }, { now: () => now });
  await driver.dispatchDue();
  await staff.page.goto(`${base}/profile`);
  await staff.page.getByRole('link', { name: 'Telegram-уведомления', exact: true }).click();
  const row = staff.page.getByRole('listitem').filter({ hasText: training.title });
  await row.getByText('Повтор доставки · Попыток: 1', { exact: true }).waitFor();
  await row.getByText('Telegram временно недоступен', { exact: true }).waitFor();
  await row.getByText('01.11.2099 · 07:00–09:00 · время Пхукета', { exact: true }).waitFor();
  assert.equal((await staff.page.textContent('body')).includes('credential must not appear'), false);
  passed.push('COACH profile link and protected delivery control show failed attempt and Phuket time in a different browser timezone');
  if (process.env.TEST_SCREENSHOT_PATH) await staff.page.screenshot({ path: process.env.TEST_SCREENSHOT_PATH, fullPage: true });
  fail = false; now += 60_000; await driver.dispatchDue();
  await staff.page.getByRole('button', { name: 'Обновить', exact: true }).click();
  await staff.page.getByRole('status').filter({ hasText: 'Уведомлений нет.' }).waitFor();
  await staff.page.getByLabel('Только недоставленные', { exact: true }).uncheck();
  await row.getByText('Доставлено · Попыток: 2', { exact: true }).waitFor();
  await row.getByText('Текст сообщения', { exact: true }).click();
  await row.getByText('Запись подтверждена.', { exact: false }).waitFor();
  passed.push('retry updates visible status and default undelivered filter; staff can inspect delivered message snapshot');
  await admin.page.goto(`${base}/staff/notifications`);
  await admin.page.getByRole('button', { name: 'Обновить', exact: true }).waitFor();
  // Control only response ordering to reproduce a late pagination response.
  const snapshot = (await (await admin.context.request.get(`${base}/api/notifications`, { headers: admin.headers })).json()).items[0];
  let heldPage;
  let releasePage;
  const pageReached = new Promise((resolve) => { releasePage = resolve; });
  await admin.page.route('**/api/notifications?*', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (query.has('beforeId')) { heldPage = route; releasePage(); return; }
    if (query.get('undelivered') === 'true') {
      await route.fulfill({ json: { items: [{ ...snapshot, status: 'RETRY' }], nextCursor: snapshot.id } });
    } else await route.continue();
  });
  await admin.page.reload();
  await admin.page.getByRole('button', { name: 'Показать ещё', exact: true }).click();
  await pageReached;
  await admin.page.getByLabel('Только недоставленные', { exact: true }).uncheck();
  await admin.page.getByText('Доставлено · Попыток: 2', { exact: true }).waitFor();
  const pageResponse = admin.page.waitForResponse((response) => new URL(response.url()).searchParams.has('beforeId'));
  await heldPage.fulfill({ json: { items: [{ ...snapshot, id: snapshot.id + 100000, trainingTitle: 'Устаревшая страница' }], nextCursor: null } });
  await pageResponse;
  await admin.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await admin.page.getByText('Устаревшая страница', { exact: false }).count(), 0);
  passed.push('late pagination response cannot overwrite the current filter results');
  await student.page.goto(`${base}/profile`);
  await student.page.getByRole('button', { name: 'Редактировать профиль', exact: true }).waitFor();
  assert.equal(await student.page.getByRole('link', { name: 'Telegram-уведомления', exact: true }).count(), 0);
  await student.page.goto(`${base}/staff/notifications`);
  await student.page.getByRole('alert').filter({ hasText: 'Недостаточно прав' }).waitFor();
  assert.equal(await student.page.getByText(training.title, { exact: true }).count(), 0);
  assert.equal((await student.context.request.get(`${base}/api/notifications`, { headers: student.headers })).status(), 403);
  passed.push('ADMIN allowed; USER has no link, cannot read notification HTTP or private page data');
  await db.user.update({ where: { id: staff.user.id }, data: { role: 'USER' } });
  await staff.page.getByRole('button', { name: 'Обновить', exact: true }).click();
  await staff.page.getByRole('alert').filter({ hasText: 'Недостаточно прав' }).waitFor();
  assert.equal(await staff.page.getByRole('listitem').filter({ hasText: training.title }).count(), 0);
  passed.push('current role revocation denies the existing staff token and clears displayed messages');
  const anonymous = await browser.newPage();
  await anonymous.goto(`${base}/staff/notifications`);
  await anonymous.getByText('Войдите в аккаунт сотрудника.', { exact: true }).waitFor();
  assert.equal((await anonymous.request.get(`${base}/api/notifications`)).status(), 401);
  passed.push('anonymous page and HTTP expose no notification data');
  console.log(JSON.stringify({ passed }, null, 2));
} finally {
  await runtime.close(async () => {
    await db.training.deleteMany({ where: { id: { in: trainings } } });
    await db.authSession.deleteMany({ where: { id: { in: sessions } } });
    await db.user.deleteMany({ where: { id: { in: users } } });
  });
}
