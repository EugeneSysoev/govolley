import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { mkdir, readdir, cp, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const root = new URL('../', import.meta.url);
const backend = new URL('apps/backend/', root);
const require = createRequire(new URL('package.json', backend));
const { Client } = require('pg');
const prisma = require.resolve('prisma/build/index.js');
const migrations = new URL('prisma/migrations/', backend);
const baseline = new URL(`.mvp-local/booking-migrations-${randomUUID()}/`, root);
await mkdir(baseline, { recursive: true });
for (const entry of await readdir(migrations, { withFileTypes: true })) {
  if (!entry.name.startsWith('20261022')) {
    await cp(new URL(entry.name, migrations), new URL(entry.name, baseline), { recursive: true });
  }
}
const baselineConfig = new URL('prisma.config.ts', baseline);
await writeFile(baselineConfig, `import { defineConfig } from ${JSON.stringify(pathToFileURL(require.resolve('@prisma/config')).href)};
export default defineConfig({ schema: ${JSON.stringify(fileURLToPath(new URL('prisma/schema.prisma', backend)))},
  migrations: { path: ${JSON.stringify(fileURLToPath(baseline))} }, datasource: { url: process.env.DATABASE_URL } });\n`);

function deploy(url, config) {
  const run = spawnSync(process.execPath, [prisma, 'migrate', 'deploy', '--config', fileURLToPath(config)], {
    cwd: fileURLToPath(backend), env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8', windowsHide: true,
  });
  // Prisma's normal output contains the database host; suppress it, never URLs.
  if (run.status !== 0) throw new Error(`Migration deploy failed: ${run.stderr || run.error?.message}`);
}

for (const [kind, variable] of [['empty', 'TEST_EMPTY_DATABASE_URL'], ['legacy', 'TEST_LEGACY_DATABASE_URL']]) {
  const url = process.env[variable];
  const target = url && new URL(url);
  if (!target || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith(`_issue5_${kind}_test`)) {
    throw new Error(`${variable} must name the dedicated local issue5 ${kind} test database`);
  }
  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    assert.equal(tables.rowCount, 0, 'Migration acceptance requires a fresh database; existing data is preserved');
    let before;
    if (kind === 'legacy') {
      deploy(url, baselineConfig);
      const owner = await db.query('INSERT INTO "User" ("firstName", "updatedAt") VALUES ($1, now()) RETURNING id', ['Legacy learner']);
      const training = await db.query('INSERT INTO "Training" (title, date, "startTime", "endTime", "updatedAt") VALUES ($1, $2, $3, $4, now()) RETURNING id', ['Legacy group', '2026-11-01', '07:00', '09:00']);
      const other = await db.query('INSERT INTO "User" ("firstName", "updatedAt") VALUES ($1, now()) RETURNING id', ['Other legacy learner']);
      await db.query('INSERT INTO "Booking" ("userId", "trainingId", status, "paymentType", "updatedAt") VALUES ($1,$2,$3,$4,now()),($5,$2,$6,$7,now())', [owner.rows[0].id, training.rows[0].id, 'CONFIRMED', 'BALANCE', other.rows[0].id, 'CANCELLED', 'CASH']);
      before = (await db.query('SELECT id,"userId","trainingId",status,"paymentType","createdAt","updatedAt" FROM "Booking" ORDER BY id')).rows;
    }
    deploy(url, new URL('prisma.config.ts', backend));
    assert.equal((await db.query('SELECT count(*)::int AS count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')).rows[0].count, 11);
    if (before) {
      assert.deepEqual((await db.query('SELECT id,"userId","trainingId",status,"paymentType","createdAt","updatedAt" FROM "Booking" ORDER BY id')).rows, before);
      const rows = (await db.query('SELECT kind,"cashPrice","requestId","cancelledAt","cancellationTiming" FROM "Booking"')).rows;
      assert.deepEqual(rows, Array.from({ length: 2 }, () => ({ kind: 'LEGACY', cashPrice: null, requestId: null, cancelledAt: null, cancellationTiming: null })));
      assert.equal((await db.query('SELECT balance FROM "User" WHERE balance <> 0')).rowCount, 0);
    }
    console.log(`PASS: ${kind}: 11 migrations, preserved history, no inferred payment or package`);
  } finally { await db.end(); }
}
