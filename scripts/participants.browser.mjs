import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { startBrowserRuntime } from './browser-runtime.mjs';
const { expect } = createRequire(new URL('../apps/frontend/package.json', import.meta.url))('@playwright/test');

const runtime = await startBrowserRuntime({ backendPort: 55960, frontendPort: 55961, secret: 'participants-browser-only-secret' });
const { base, db, browser, sessions } = runtime;
const users = [], trainings = [], sessionIds = [];
try {
  const identity = { id: Date.now(), first_name: `Staff ${randomUUID().slice(0,8)}` };
  const coach = await db.user.create({ data: { telegramId: String(identity.id), firstName: identity.first_name, role: 'COACH', skillLevel: 'BEGINNER' } }); users.push(coach.id);
  const learner = await db.user.create({ data: { firstName: 'Learner One', skillLevel: 'BEGINNER' } }); users.push(learner.id);
  const other = await db.user.create({ data: { firstName: 'Learner Two', skillLevel: 'BEGINNER' } }); users.push(other.id);
  const t = await db.training.create({ data: { title: 'Staff browser group', date: new Date(Date.now() - 86400000), startTime: '07:00', endTime: '09:00', targetLevel: 'BEGINNER', coachName: 'Different coach' } }); trainings.push(t.id);
  const booking = await db.booking.create({ data: { userId: learner.id, trainingId: t.id, kind: 'SINGLE_CASH', paymentType: 'CASH', cashPrice: 500 } });
  const legacy = await db.booking.create({ data: { userId: other.id, trainingId: t.id, paymentType: 'BALANCE' } });
  const context = await browser.newContext();
  await context.route('https://t.me/**', (route) => route.abort());
  const page = await context.newPage();
  await page.goto(`${base}/auth/signin`);
  const [initialized] = await Promise.all([
    page.waitForResponse((response) => response.url() === `${base}/api/bot-auth/init-session` && response.request().method() === 'POST'),
    page.getByRole('button', { name: 'Войти через Telegram', exact: true }).click(),
  ]);
  const { sessionId } = await initialized.json(); sessionIds.push(sessionId);
  await sessions.confirm(sessionId, identity);
  await page.waitForURL('**/profile');
  await page.goto(`${base}/training/${t.id}`);
  await page.getByRole('link', { name: 'Участники и учёт →', exact: true }).click();
  await page.getByRole('heading', { name: 'Участники и учёт', exact: true }).waitFor();
  await page.getByLabel('Ученик', { exact: true }).selectOption(String(booking.id));
  async function save(button, reason) {
    await page.getByLabel('Основание изменения', { exact: true }).fill(reason);
    const [response] = await Promise.all([
      page.waitForResponse((value) => value.url() === `${base}/api/training/${t.id}/participants/${booking.id}` && value.request().method() === 'PATCH'),
      page.getByRole('button', { name: button, exact: true }).click(),
    ]);
    assert.equal(response.status(), 200);
    await page.getByRole('listitem').getByText(reason, { exact: true }).waitFor();
    await expect(page.getByLabel('Основание изменения', { exact: true })).toHaveValue('');
  }
  await page.getByLabel('Посещение', { exact: true }).selectOption('NO_SHOW');
  await save('Сохранить посещение', 'Не пришёл на площадку');
  await page.getByRole('checkbox', { name: 'Разовая оплата получена', exact: true }).check();
  await save('Сохранить оплату', 'Получено 500 наличными');
  await page.getByLabel('Посещение', { exact: true }).selectOption('ATTENDED');
  await save('Сохранить посещение', 'Уточнение: пришёл позже');
  await page.getByRole('checkbox', { name: 'Разовая оплата получена', exact: true }).uncheck();
  await save('Сохранить оплату', 'Оплата была отмечена ошибочно');
  await page.getByText('Посещение: Посетил · Оплата: не получена', { exact: true }).waitFor();
  const audits = await db.bookingAudit.findMany({ where: { bookingId: booking.id }, orderBy: { id: 'asc' } });
  assert.equal(audits.length, 4); assert(audits.every((item) => item.actorId === coach.id));
  assert.deepEqual(audits.map((item) => [item.oldValue, item.newValue]), [['UNMARKED','NO_SHOW'],['UNKNOWN','true'],['NO_SHOW','ATTENDED'],['true','false']]);
  await page.getByLabel('Ученик', { exact: true }).selectOption(String(legacy.id));
  await page.getByText('Посещение: Не отмечено · Оплата: нет подтверждения', { exact: true }).waitFor();
  await page.reload();
  await page.getByLabel('Ученик', { exact: true }).selectOption(String(booking.id));
  await page.getByText('Оплата была отмечена ошибочно', { exact: true }).waitFor();
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: learner.id } })).balance, 0);
  console.log('PASS: real staff login, other coach group, learner selection, independent attendance/cash marks, corrections, immutable history/reload, unknown legacy and no debt');
} finally {
  await runtime.close(async () => {
    await db.authSession.deleteMany({ where: { id: { in: sessionIds } } });
    await db.training.deleteMany({ where: { id: { in: trainings } } });
    await db.user.deleteMany({ where: { id: { in: users } } });
  });
}
