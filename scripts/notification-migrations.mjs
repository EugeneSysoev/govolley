import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { mkdir, readdir, cp, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const root = new URL('../', import.meta.url), backend = new URL('apps/backend/', root);
const require = createRequire(new URL('package.json', backend));
const { Client } = require('pg');
const prisma = require.resolve('prisma/build/index.js');
const migrations = new URL('prisma/migrations/', backend);
const entries = await readdir(migrations, { withFileTypes: true });
const expected = entries.filter((entry) => entry.isDirectory()).length;
const baseline = new URL(`.mvp-local/notification-migrations-${randomUUID()}/`, root);
await mkdir(baseline, { recursive: true });
for (const entry of entries) {
  if (entry.name < '20261022001000_notifications' || !entry.isDirectory()) await cp(new URL(entry.name, migrations), new URL(entry.name, baseline), { recursive: true });
}
const baselineConfig = new URL('prisma.config.ts', baseline);
await writeFile(baselineConfig, `import { defineConfig } from ${JSON.stringify(pathToFileURL(require.resolve('@prisma/config')).href)};
export default defineConfig({ schema: ${JSON.stringify(fileURLToPath(new URL('prisma/schema.prisma', backend)))},
  migrations: { path: ${JSON.stringify(fileURLToPath(baseline))} }, datasource: { url: process.env.DATABASE_URL } });\n`);
function deploy(url, config) {
  const run = spawnSync(process.execPath, [prisma, 'migrate', 'deploy', '--config', fileURLToPath(config)], {
    cwd: fileURLToPath(backend), env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8', windowsHide: true,
  });
  if (run.status !== 0) throw new Error(`Migration deploy failed (exit ${run.status})`);
}
for (const [kind, variable] of [['empty', 'TEST_EMPTY_DATABASE_URL'], ['legacy', 'TEST_LEGACY_DATABASE_URL']]) {
  const url = process.env[variable], target = url && new URL(url);
  if (!target || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith(`_issue10_${kind}_test`)) throw new Error(`Dedicated local issue10 ${kind} database required`);
  const db = new Client({ connectionString: url }); await db.connect();
  try {
    assert.equal((await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount, 0, 'Fresh acceptance database required; existing data is preserved');
    let before;
    if (kind === 'legacy') {
      deploy(url, baselineConfig);
      const user = (await db.query('INSERT INTO "User" ("updatedAt") VALUES (now()) RETURNING id')).rows[0].id;
      const training = (await db.query('INSERT INTO "Training" (title,date,"startTime","endTime","updatedAt") VALUES ($1,$2,$3,$4,now()) RETURNING id', ['Legacy group', '2026-11-01', '07:00', '09:00'])).rows[0].id;
      await db.query('INSERT INTO "Booking" ("userId","trainingId",status,"paymentType","updatedAt") VALUES ($1,$2,$3,$4,now()),($1,$2,$5,$6,now())', [user, training, 'CONFIRMED', 'BALANCE', 'CANCELLED', 'CASH']);
      before = (await db.query('SELECT * FROM "Booking" ORDER BY id')).rows;
    }
    deploy(url, new URL('prisma.config.ts', backend));
    assert.equal((await db.query('SELECT count(*)::int AS count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')).rows[0].count, expected);
    if (before) assert.deepEqual((await db.query('SELECT * FROM "Booking" ORDER BY id')).rows, before);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM "Notification"')).rows[0].count, 0);
    console.log(`PASS ${kind}: ${expected} migrations; existing booking history preserved, no inferred legacy messages`);
  } finally { await db.end(); }
}
