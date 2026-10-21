import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const configured = process.env.TEST_DATABASE_URL;
if (!configured) throw new Error('Set TEST_DATABASE_URL to a dedicated local *_test database');
const target = new URL(configured);
if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) {
  throw new Error('Refusing to prepare a non-local or non-test database');
}
const result = spawnSync('bun', ['x', 'prisma', 'migrate', 'deploy'], {
  cwd: fileURLToPath(new URL('../apps/backend/', import.meta.url)),
  env: { ...process.env, DATABASE_URL: configured }, stdio: 'inherit',
});
if (result.error) throw new Error('Could not start Bun for test migrations');
process.exit(result.status ?? 1);
