import { z } from 'zod';

// This route is the only owner of the provider URL and server credential.
const providerWeather = z.object({
  main: z.object({ temp: z.number().finite() }),
  weather: z.array(z.object({ main: z.string().max(50) })).min(1),
});

export async function GET() {
  const unavailable = () => Response.json({ error: 'Weather unavailable' }, {
    status: 503, headers: { 'Cache-Control': 'no-store' },
  });
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return unavailable();
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.search = new URLSearchParams({ lat: '7.88', lon: '98.39', units: 'metric', appid: key }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 600 } });
    if (!response.ok) return unavailable();
    const data = providerWeather.parse(await response.json());
    return Response.json({ temp: Math.round(data.main.temp), icon: data.weather[0].main });
  } catch {
    // Do not log provider errors: they can contain the authenticated URL.
    return unavailable();
  }
}
