/** @jest-environment node */
import { z } from 'zod';
import { api } from '@/lib/api';
import { backendApiUrl } from '@/lib/backend-config';
import nextConfig from '@/next.config';
import { trainingApi } from '@/app/training/api';

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
it('uses the saved-training contract for browser reads and management responses', async () => {
  const training = {
    id: 7, title: 'x'.repeat(201), description: null, date: '2026-11-01T00:00:00.000Z',
    startTime: '07:00', endTime: '09:00', targetLevel: 'BEGINNER', maxParticipants: 101,
    currentParticipants: 1, isBooked: true, price: null, coachName: null, location: null,
    isActive: true, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  };
  const fetcher = jest.spyOn(global, 'fetch').mockImplementation(async (path) =>
    new Response(JSON.stringify(path === '/api/training' ? [training] : training)));
  expect(await trainingApi.getAll()).toEqual([training]);
  expect(await trainingApi.get(7)).toEqual(training);
  expect(await trainingApi.update(7, { description: null }, 'staff')).toEqual(training);
  expect(await trainingApi.delete(7, 'staff')).toEqual(training);
  fetcher.mockResolvedValue(new Response(JSON.stringify({ ...training, isBooked: 'true' })));
  await expect(trainingApi.get(7)).rejects.toThrow();
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
