import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Real frontend, Nest HTTP and dedicated PostgreSQL; only Telegram's identity
// assertion is a fixture. Build with the same BACKEND_URL before running.
const backendPort = Number(process.env.TEST_BACKEND_PORT ?? 55640);
const frontendPort = Number(process.env.TEST_FRONTEND_PORT ?? 55641);
for (const port of [backendPort, frontendPort]) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid test port');
}
if (backendPort === frontendPort) throw new Error('Test servers require different ports');
const target = new URL(process.env.TEST_DATABASE_URL ?? 'about:blank');
if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Use a dedicated local *_test database');
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NEXTAUTH_SECRET = 'school-time-browser-only-secret';
const root = new URL('../', import.meta.url);
const backendRequire = createRequire(new URL('apps/backend/package.json', root));
const frontendRequire = createRequire(new URL('apps/frontend/package.json', root));
const { Module } = backendRequire('@nestjs/common');
const { NestFactory } = backendRequire('@nestjs/core');
const { ConfigModule } = backendRequire('@nestjs/config');
const { chromium, expect } = frontendRequire('@playwright/test');
const { PrismaModule } = await import(new URL('apps/backend/dist/src/prisma/prisma.module.js', root));
const { PrismaService } = await import(new URL('apps/backend/dist/src/prisma/prisma.service.js', root));
const { AuthModule } = await import(new URL('apps/backend/dist/src/auth/auth.module.js', root));
const { AuthSessionService } = await import(new URL('apps/backend/dist/src/auth/auth-session.service.js', root));
const { UserModule } = await import(new URL('apps/backend/dist/src/user/user.module.js', root));
const { TrainingModule } = await import(new URL('apps/backend/dist/src/training/training.module.js', root));
class SchoolTimeModule {}
Module({ imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, AuthModule, UserModule, TrainingModule] })(SchoolTimeModule);
const app = await NestFactory.create(SchoolTimeModule, { logger: false });
app.setGlobalPrefix('api');
await app.listen(backendPort, '127.0.0.1');
const db = app.get(PrismaService);
const sessions = app.get(AuthSessionService);
const base = `http://127.0.0.1:${frontendPort}`;
const frontend = spawn(process.execPath, [frontendRequire.resolve('next/dist/bin/next'), 'start', '-p', String(frontendPort), '--hostname', '127.0.0.1'], {
  cwd: fileURLToPath(new URL('apps/frontend/', root)),
  env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${backendPort}`, NEXTAUTH_URL: base, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: 'ignore', windowsHide: true,
});
const trainingIds = [];
const userIds = [];
const sessionIds = [];
const results = [];
let browser;
try {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(`${base}/api/auth/csrf`)).ok) break; } catch { /* Starting. */ }
    if (attempt === 119) throw new Error('Next.js did not become ready');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'chrome', headless: true });
  for (const [index, timezoneId] of ['America/Los_Angeles', 'Asia/Tokyo'].entries()) {
    const identity = { id: Date.now() + index, first_name: 'School time coach' };
    const coach = await db.user.create({ data: { telegramId: String(identity.id), firstName: identity.first_name, role: 'COACH', skillLevel: 'BEGINNER' } });
    userIds.push(coach.id);
    const event = await db.training.create({ data: {
      title: `School day ${index}`, date: new Date('2026-10-31T18:00:00Z'), startTime: '07:00', endTime: '09:00',
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
    const initialized = page.waitForResponse((response) => response.url() === `${base}/api/bot-auth/init-session` && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Войти через Telegram', exact: true }).click();
    const { sessionId } = await (await initialized).json();
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
    await page.getByLabel('Название тренировки', { exact: true }).fill(`Created in ${timezoneId}`);
    await page.getByLabel('Тренер', { exact: true }).fill('School coach');
    await page.getByLabel('Описание (необязательно)', { exact: true }).fill('Тренировка группы');
    const createdResponse = page.waitForResponse((response) => response.url() === `${base}/api/training` && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Создать тренировку', exact: true }).click();
    const created = await (await createdResponse).json();
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
    const updatedResponse = page.waitForResponse((response) => response.url() === `${base}/api/training/${created.id}` && response.request().method() === 'PATCH');
    await page.getByRole('button', { name: 'Обновить данные', exact: true }).click();
    const updated = await (await updatedResponse).json();
    assert.equal(updated.date, '2026-11-01T17:00:00.000Z');
    assert.equal(updated.endTime, '10:00');
    await page.getByText('07:00 — 10:00', { exact: true }).waitFor();
    results.push(`${timezoneId}: public schedule, calendar day change, SSR, legacy locations, price, profile, staff create/edit agree in Bangkok`);
    console.log(`PASS: ${timezoneId}`);
    await context.close();
  }
  console.log(JSON.stringify({ passed: results }, null, 2));
} finally {
  await browser?.close();
  frontend.kill();
  await db.authSession.deleteMany({ where: { id: { in: sessionIds } } });
  await db.training.deleteMany({ where: { id: { in: trainingIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await app.close();
}
