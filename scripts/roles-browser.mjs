import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

// Real Nest + NextAuth + browser + PostgreSQL; only Telegram confirmation is a fixture.
const database = process.env.TEST_DATABASE_URL;
const target = database && new URL(database);
if (!target || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) {
  throw new Error('Set TEST_DATABASE_URL to a dedicated local *_test database');
}
process.env.DATABASE_URL = database;
process.env.NEXTAUTH_SECRET = 'roles-browser-only-secret';
const backendPort = Number(process.env.TEST_BACKEND_PORT || 55570);
const frontendPort = Number(process.env.TEST_FRONTEND_PORT || 55571);
const base = `http://127.0.0.1:${frontendPort}`;
const root = new URL('../', import.meta.url);
const backendRequire = createRequire(new URL('apps/backend/package.json', root));
const frontendRequire = createRequire(new URL('apps/frontend/package.json', root));
const { Module } = backendRequire('@nestjs/common');
const { NestFactory } = backendRequire('@nestjs/core');
const { ConfigModule } = backendRequire('@nestjs/config');
const { chromium } = frontendRequire('@playwright/test');
const { PrismaModule } = await import(new URL('apps/backend/dist/src/prisma/prisma.module.js', root));
const { PrismaService } = await import(new URL('apps/backend/dist/src/prisma/prisma.service.js', root));
const { AuthModule } = await import(new URL('apps/backend/dist/src/auth/auth.module.js', root));
const { UserModule } = await import(new URL('apps/backend/dist/src/user/user.module.js', root));
const { TrainingModule } = await import(new URL('apps/backend/dist/src/training/training.module.js', root));
class RolesBrowserModule {}
Module({ imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, AuthModule, UserModule, TrainingModule] })(RolesBrowserModule);
const app = await NestFactory.create(RolesBrowserModule, { logger: false });
app.setGlobalPrefix('api');
await app.listen(backendPort, '127.0.0.1');
const db = app.get(PrismaService);
const frontend = spawn(process.execPath, [frontendRequire.resolve('next/dist/bin/next'), 'start', '-p', String(frontendPort), '--hostname', '127.0.0.1'], {
  cwd: fileURLToPath(new URL('apps/frontend/', root)),
  env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${backendPort}`, NEXTAUTH_URL: base, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: 'ignore', windowsHide: true,
});
let browser;
const users = [];
const sessions = [];
const passed = [];
try {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(`${base}/api/auth/csrf`)).ok) break; } catch { /* Starting. */ }
    if (attempt === 119) throw new Error('Next.js did not become ready');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'chrome', headless: true });
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
  await browser?.close();
  frontend.kill();
  await db.authSession.deleteMany({ where: { id: { in: sessions } } });
  await db.user.deleteMany({ where: { id: { in: users } } });
  await app.close();
}
