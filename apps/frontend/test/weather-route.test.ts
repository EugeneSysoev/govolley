/** @jest-environment node */
import { GET } from '@/app/api/weather/route';

describe('site weather endpoint', () => {
  afterEach(() => { jest.restoreAllMocks(); delete process.env.OPENWEATHER_API_KEY; });

  it('returns only weather data while using the key at the provider boundary', async () => {
    process.env.OPENWEATHER_API_KEY = 'server-only-test-key';
    const provider = jest.spyOn(global, 'fetch').mockResolvedValue(Response.json({
      main: { temp: 28.7 }, weather: [{ main: 'Rain' }], private: 'never forward this',
    }));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ temp: 29, icon: 'Rain' });
    const url = new URL(String(provider.mock.calls[0][0]));
    expect(url.origin).toBe('https://api.openweathermap.org');
    expect(url.searchParams.get('appid')).toBe('server-only-test-key');
    expect(url.searchParams.get('lat')).toBe('7.88');
    expect(url.searchParams.get('lon')).toBe('98.39');
    expect(url.searchParams.get('units')).toBe('metric');
  });

  it.each(['http', 'network', 'invalid', 'json', 'missing-key'])('returns a safe unavailable response for %s', async (failure) => {
    if (failure !== 'missing-key') process.env.OPENWEATHER_API_KEY = 'server-only-test-key';
    const provider = jest.spyOn(global, 'fetch');
    if (failure === 'network') provider.mockRejectedValue(new Error('provider URL with secret'));
    else if (failure === 'json') provider.mockResolvedValue(new Response('not-json'));
    else provider.mockResolvedValue(Response.json(failure === 'invalid' ? { main: {} } : { secret: 'server-only-test-key' }, { status: failure === 'http' ? 401 : 200 }));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Weather unavailable' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    if (failure === 'missing-key') expect(provider).not.toHaveBeenCalled();
  });
});
