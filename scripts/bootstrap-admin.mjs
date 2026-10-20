import { createRequire } from 'node:module';

// Explicit operator command; never imported by the public application.
const telegramId = process.env.ADMIN_TELEGRAM_ID;
if (!telegramId || !/^[1-9]\d{0,15}$/.test(telegramId) || !Number.isSafeInteger(Number(telegramId))) {
  throw new Error('Set ADMIN_TELEGRAM_ID to the exact positive numeric Telegram ID of the owner');
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

const backendRequire = createRequire(new URL('../apps/backend/package.json', import.meta.url));
const { Pool } = backendRequire('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const result = await pool.query(
    'UPDATE "User" SET role = \'ADMIN\', "updatedAt" = NOW() WHERE "telegramId" = $1 RETURNING id',
    [telegramId],
  );
  if (result.rowCount !== 1) {
    console.error('Account not found. Sign in to GoVolley through Telegram before running this command. No roles changed.');
    process.exitCode = 1;
  } else {
    console.log(`Administrator configured for GoVolley account #${result.rows[0].id}.`);
  }
} catch {
  console.error('Administrator bootstrap failed. Check the database connection and applied migrations.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
