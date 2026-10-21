import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

async function waitReady(base, frontend) {
  let startError;
  frontend.once('error', (error) => { startError = error; });
  for (let attempt = 0; attempt < 120; attempt++) {
    if (startError) throw startError;
    if (frontend.exitCode !== null) throw new Error('Next.js exited before becoming ready');
    try {
      if ((await fetch(`${base}/api/auth/csrf`, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch { /* Starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Next.js did not become ready');
}

async function stopNext(frontend) {
  if (!frontend?.pid || frontend.exitCode !== null || frontend.signalCode !== null) return;
  await new Promise((resolve) => {
    const timeout = setTimeout(() => { frontend.kill('SIGKILL'); resolve(); }, 5000);
    frontend.once('exit', () => { clearTimeout(timeout); resolve(); });
    frontend.kill();
  });
}

/** Real Nest/Next/PostgreSQL/Chrome lifecycle shared by browser scenarios. */
export async function startBrowserRuntime({ backendPort, frontendPort, secret }) {
  const database = process.env.TEST_DATABASE_URL;
  const target = database && new URL(database);
  if (!target || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) {
    throw new Error('Set TEST_DATABASE_URL to a dedicated local *_test database');
  }
  process.env.DATABASE_URL = database;
  process.env.NEXTAUTH_SECRET = secret;
  backendPort = Number(process.env.TEST_BACKEND_PORT || backendPort);
  frontendPort = Number(process.env.TEST_FRONTEND_PORT || frontendPort);
  for (const [name, value] of Object.entries({ TEST_BACKEND_PORT: backendPort, TEST_FRONTEND_PORT: frontendPort })) {
    if (!Number.isInteger(value) || value < 1024 || value > 65535) throw new Error('Invalid ' + name);
  }
  if (backendPort === frontendPort) throw new Error('Test servers require separate ports');
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
  const { AuthSessionService } = await import(new URL('apps/backend/dist/src/auth/auth-session.service.js', root));
  const { UserModule } = await import(new URL('apps/backend/dist/src/user/user.module.js', root));
  const { TrainingModule } = await import(new URL('apps/backend/dist/src/training/training.module.js', root));
  const { StaffParticipantsModule } = await import(new URL('apps/backend/dist/src/participants/staff-participants.module.js', root));
  class BrowserModule {}
  Module({ imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, AuthModule, UserModule, TrainingModule, StaffParticipantsModule] })(BrowserModule);
  let app;
  let db;
  let frontend;
  let browser;
  async function close(cleanup) {
    try { await browser?.close(); }
    finally {
      try { await stopNext(frontend); }
      finally {
        try { await cleanup?.(db); }
        finally { await app?.close(); }
      }
    }
  }
  try {
    app = await NestFactory.create(BrowserModule, { logger: false, abortOnError: false });
    app.setGlobalPrefix('api');
    await app.listen(backendPort, '127.0.0.1');
    db = app.get(PrismaService);
    frontend = spawn(process.execPath, [frontendRequire.resolve('next/dist/bin/next'), 'start', '-p', String(frontendPort), '--hostname', '127.0.0.1'], {
      cwd: fileURLToPath(new URL('apps/frontend/', root)),
      env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${backendPort}`, NEXTAUTH_URL: base, NEXT_TELEMETRY_DISABLED: '1' },
      stdio: 'ignore', windowsHide: true,
    });
    await waitReady(base, frontend);
    browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'chrome', headless: true });
    return { base, db, browser, sessions: app.get(AuthSessionService), close };
  } catch (error) {
    await close();
    throw error;
  }
}
