import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { startBrowserRuntime } from './browser-runtime.mjs';

// Real Nest + NextAuth + browser + PostgreSQL; only Telegram confirmation is a fixture.
const runtime = await startBrowserRuntime({ backendPort: 55570, frontendPort: 55571, secret: 'roles-browser-only-secret' });
const { base, db, browser } = runtime;
const users = [];
const sessions = [];
const passed = [];
try {
  async function login(role) {
    const user = await db.user.create({ data: { role, firstName: `Browser ${role}`, skillLevel: 'BEGINNER' } });
    users.push(user.id);
    const id = randomUUID(); sessions.push(id);
    await db.authSession.create({ data: { id, status: 'CONFIRMED', userId: user.id } });
    const context = await browser.newContext();
    const csrf = await (await context.request.get(`${base}/api/auth/csrf`)).json();
    const response = await context.request.post(`${base}/api/auth/callback/telegram-session`, {
      form: { csrfToken: csrf.csrfToken, sessionId: id, callbackUrl: `${base}/profile`, json: 'true' },
    });
    assert.equal(response.status(), 200);
    const session = await (await context.request.get(`${base}/api/auth/session`)).json();
    assert.equal(session.user.role, role);
    return { user, context, page: await context.newPage(), token: session.accessToken };
  }
  const admin = await login('ADMIN');
  const student = await login('USER');
  const coach = await login('COACH');
  await admin.page.goto(`${base}/profile`);
  await admin.page.getByRole('link', { name: 'Управление тренерами', exact: true }).click();
  await admin.page.getByLabel('Найти пользователя', { exact: true }).fill(String(student.user.id));
  await admin.page.getByRole('button', { name: 'Найти', exact: true }).click();
  await admin.page.getByRole('button', { name: 'Назначить тренером', exact: true }).click();
  await admin.page.getByRole('status').filter({ hasText: `Пользователь #${student.user.id}: Тренер. Изменение сохранено.` }).waitFor();
  const headers = { Authorization: `Bearer ${student.token}` };
  assert.equal((await student.context.request.patch(`${base}/api/users/verify-level/${student.user.id}`, { headers, data: { isLevelVerified: true } })).status(), 200);
  passed.push('ADMIN profile link, exact account search, assign COACH, visible saved result; old USER token gains current privileges');
  if (process.env.TEST_SCREENSHOT_PATH) await admin.page.screenshot({ path: process.env.TEST_SCREENSHOT_PATH, fullPage: true });
  await admin.page.getByRole('button', { name: 'Снять роль тренера', exact: true }).click();
  await admin.page.getByRole('status').filter({ hasText: `Пользователь #${student.user.id}: Ученик. Изменение сохранено.` }).waitFor();
  assert.equal((await student.context.request.patch(`${base}/api/users/verify-level/${student.user.id}`, { headers, data: { isLevelVerified: false } })).status(), 403);
  passed.push('remove COACH with visible result; the same old token immediately loses protected access');
  for (const actor of [student, coach]) {
    await actor.page.goto(`${base}/profile`);
    await actor.page.getByRole('button', { name: 'Редактировать профиль', exact: true }).waitFor();
    assert.equal(await actor.page.getByRole('link', { name: 'Управление тренерами', exact: true }).count(), 0);
    await actor.page.goto(`${base}/admin/coaches`);
    await actor.page.getByRole('alert').filter({ hasText: 'Управление тренерами доступно администратору' }).waitFor();
    assert.equal(await actor.page.getByRole('button', { name: 'Назначить тренером', exact: true }).count(), 0);
    for (const account of [actor.user, admin.user]) {
      const denied = await actor.context.request.patch(`${base}/api/users/${account.id}/role`, { headers: { Authorization: `Bearer ${actor.token}` }, data: { role: 'COACH' } });
      assert.equal(denied.status(), 403);
    }
    assert.equal((await actor.context.request.patch(`${base}/api/users/profile`, { headers: { Authorization: `Bearer ${actor.token}` }, data: { role: 'ADMIN' } })).status(), 400);
  }
  passed.push('USER/COACH have no admin link or controls, direct page denied, self/other role changes and profile escalation denied');
  assert.equal((await admin.context.request.patch(`${base}/api/users/${student.user.id}/role`, { headers: { Authorization: `Bearer ${admin.token}` }, data: { role: 'ADMIN' } })).status(), 400);
  passed.push('ADMIN cannot grant ADMIN through the public role endpoint');
  console.log(JSON.stringify({ passed }, null, 2));
} finally {
  await runtime.close(async () => {
    await db.authSession.deleteMany({ where: { id: { in: sessions } } });
    await db.user.deleteMany({ where: { id: { in: users } } });
  });
}
