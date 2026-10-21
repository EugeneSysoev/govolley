import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startBrowserRuntime } from './browser-runtime.mjs';

// NODE_OPTIONS treats backslashes as escapes inside quoted values on Windows.
const fixture = fileURLToPath(new URL('./weather-provider-fixture.cjs', import.meta.url)).replaceAll('\\', '/');
const results = [];
for (const mode of ['success', 'failure', 'missing-key']) {
  process.env.WEATHER_TEST_MODE = mode;
  process.env.OPENWEATHER_API_KEY = `issue14-server-sentinel-${mode}`;
  if (mode === 'missing-key') delete process.env.OPENWEATHER_API_KEY;
  process.env.NODE_OPTIONS = `--require "${fixture}"`;
  const runtime = await startBrowserRuntime({ backendPort: 55840, frontendPort: 55841, secret: 'weather-test-only-nextauth-secret' });
  try {
    const response = await fetch(`${runtime.base}/api/weather`);
    assert.equal(response.status, mode === 'success' ? 200 : 503);
    assert.deepEqual(await response.json(), mode === 'success' ? { temp: 29, icon: 'Rain' } : { error: 'Weather unavailable' });
    const page = await runtime.browser.newPage();
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${runtime.base}/training`);
    await page.getByText(mode === 'success' ? '29°C' : 'Погода недоступна', { exact: true }).first().waitFor();
    assert.ok(requests.some((url) => url === `${runtime.base}/api/weather`));
    assert.ok(!requests.some((url) => /openweathermap|appid=|issue14-server-sentinel/.test(url)));
    assert.ok(!(await page.content()).includes('issue14-server-sentinel'));
    assert.deepEqual(errors, []);
    results.push({ mode, http: response.status, sameOrigin: true, providerKeyInBrowser: false, pageErrors: 0 });
  } finally { await runtime.close(); }
}

let scanned = 0;
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) scan(path);
    else {
      scanned++;
      assert.ok(!/issue14-server-sentinel|OPENWEATHER_API_KEY|api\.openweathermap\.org|appid=/.test(readFileSync(path, 'utf8')), `Weather credential/provider URL in client file ${entry.name}`);
    }
  }
}
scan(new URL('../apps/frontend/.next/static/', import.meta.url));
console.log(JSON.stringify({ results, clientFilesScanned: scanned }));
