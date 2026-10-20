import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

// Real NextAuth + Nest + PostgreSQL. Telegram confirmation is replaced by a fixture.
// Build with BACKEND_URL matching TEST_BACKEND_PORT before running.
function port(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1024 || value > 65535) throw new Error(`Invalid ${name}`);
  return value;
}
const backendPort = port('TEST_BACKEND_PORT', 55440);
const frontendPort = port('TEST_FRONTEND_PORT', 55441);
if (backendPort === frontendPort) throw new Error('Test servers require separate ports');
const backend = `http://127.0.0.1:${backendPort}`;
const database = process.env.TEST_DATABASE_URL;
const target = database && new URL(database);
if (!target || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) {
  throw new Error('Set TEST_DATABASE_URL to a dedicated local *_test database');
}
process.env.DATABASE_URL = database;
process.env.NEXTAUTH_SECRET = 'browser-smoke-only-secret';
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
const { AuthSessionService } = await import(new URL('apps/backend/dist/src/auth/auth-session.service.js', root));
const { UserModule } = await import(new URL('apps/backend/dist/src/user/user.module.js', root));
const { TrainingModule } = await import(new URL('apps/backend/dist/src/training/training.module.js', root));
class SmokeModule {}
Module({ imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, AuthModule, UserModule, TrainingModule] })(SmokeModule);
const app = await NestFactory.create(SmokeModule, { logger: false });
app.setGlobalPrefix('api');
await app.listen(backendPort, '127.0.0.1');
const db = app.get(PrismaService);
const sessions = app.get(AuthSessionService);
const base = `http://127.0.0.1:${frontendPort}`;
const frontend = spawn(process.execPath, [frontendRequire.resolve('next/dist/bin/next'), 'start', '-p', String(frontendPort), '--hostname', '127.0.0.1'], {
  cwd: fileURLToPath(new URL('apps/frontend/', root)),
  env: { ...process.env, BACKEND_URL: backend, NEXTAUTH_URL: base, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: 'ignore', windowsHide: true,
});
let browser;
let userId;
let previousOwnerId;
let trainingId;
const ids = [];
const results = [];
try {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(`${base}/api/auth/csrf`)).ok) break; } catch { /* Starting. */ }
    if (attempt === 119) throw new Error('Next.js did not become ready');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const username = `browser_${randomUUID().replaceAll('-', '').slice(0, 16)}`;
  const identity = { id: Date.now(), username, first_name: 'Browser Fixture' };
  const previousOwner = await db.user.create({ data: { username, firstName: 'Previous username owner' } });
  previousOwnerId = previousOwner.id;
  const user = await db.user.create({ data: { telegramId: String(identity.id), firstName: 'Browser Fixture', role: 'COACH' } });
  userId = user.id;
  const event = await db.training.create({ data: { title: 'Browser smoke training', date: new Date(), startTime: '07:00', endTime: '09:00', maxParticipants: 1 } });
  trainingId = event.id;
  await db.booking.create({ data: { userId, trainingId } });
  browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'chrome', headless: true });
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
  await browser?.close();
  frontend.kill();
  await db.authSession.deleteMany({ where: { id: { in: ids } } });
  if (trainingId) await db.training.delete({ where: { id: trainingId } });
  if (userId) await db.user.delete({ where: { id: userId } });
  if (previousOwnerId) await db.user.delete({ where: { id: previousOwnerId } });
  await app.close();
}
