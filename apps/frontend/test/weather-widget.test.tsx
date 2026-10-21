import { render, screen, waitFor } from '@testing-library/react';
import WeatherWidget from '@/components/navbar/weather-widget';

describe('weather widget', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  });

  it('requests weather from the site without sending the provider key', async () => {
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = 'test-legacy-public-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ temp: 29, icon: 'Rain' }) });
    render(<WeatherWidget />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/weather'));
    expect(await screen.findByText('29°C')).toBeInTheDocument();
  });

  it('shows unavailable weather when the site cannot reach the provider', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<WeatherWidget />);
    expect(await screen.findByText('Погода недоступна')).toBeInTheDocument();
    expect(screen.queryByText('--°C')).not.toBeInTheDocument();
  });
});
