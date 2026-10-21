// Test-only transport boundary. Loaded in the Next child by weather.browser.mjs.
const originalFetch = globalThis.fetch;
globalThis.fetch = async function (input, init) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.origin !== 'https://api.openweathermap.org') return originalFetch(input, init);
  if (url.pathname !== '/data/2.5/weather' || url.searchParams.get('appid') !== process.env.OPENWEATHER_API_KEY) {
    throw new Error('Unexpected weather provider request');
  }
  return Response.json(process.env.WEATHER_TEST_MODE === 'failure'
    ? { message: 'provider failed', secret: process.env.OPENWEATHER_API_KEY }
    : { main: { temp: 28.7 }, weather: [{ main: 'Rain' }], secret: process.env.OPENWEATHER_API_KEY },
  { status: process.env.WEATHER_TEST_MODE === 'failure' ? 401 : 200 });
};
