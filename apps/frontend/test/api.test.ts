/** @jest-environment node */
import { z } from 'zod';
import { api } from '@/lib/api';
import { backendApiUrl } from '@/lib/backend-config';
import nextConfig from '@/next.config';

afterEach(() => { jest.restoreAllMocks(); });
it('sends browser requests to relative /api with per-request authorization', async () => {
  const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{"ok":true}'));
  await api('/training', z.object({ ok: z.boolean() }), { method: 'POST', body: '{}' }, 'fixture');
  expect(fetcher).toHaveBeenCalledWith('/api/training', expect.objectContaining({ method: 'POST' }));
  const options = fetcher.mock.calls[0][1];
  expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer fixture');
});
it('validates external JSON at runtime', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{"ok":"wrong"}'));
  await expect(api('/training', z.object({ ok: z.boolean() }))).rejects.toThrow();
});
it('uses the same backend origin for SSR and rewrites after dynamic filesystem routes', async () => {
  process.env.BACKEND_URL = 'http://127.0.0.1:55440';
  expect(backendApiUrl('/training/7')).toBe('http://127.0.0.1:55440/api/training/7');
  const rewrites = nextConfig.rewrites;
  expect(rewrites).toBeDefined();
  if (!rewrites) throw new Error('Missing rewrites');
  expect(await rewrites()).toMatchObject({ beforeFiles: [], afterFiles: [], fallback: [
    { source: '/api/:path*', destination: 'http://127.0.0.1:55440/api/:path*' },
    { source: '/uploads/:path*', destination: 'http://127.0.0.1:55440/uploads/:path*' },
  ] });
});
