/** @jest-environment node */
import type { User } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
const user: User = { id: '1', firstName: 'Fixture', lastName: null, username: null, image: null, role: 'USER',
  balance: 0, skillLevel: 'ADVANCED', isLevelVerified: true, createdAt: '2026-10-01T00:00:00.000Z', accessToken: 'test-token' };

it('keeps verified level when a new login creates a NextAuth token', async () => {
  const callback = authOptions.callbacks?.jwt;
  if (!callback) throw new Error('Missing JWT callback');
  const token = await callback({ token: {}, user, account: null, trigger: 'signIn', isNewUser: false });
  expect(token.profile?.isLevelVerified).toBe(true);
});
it('ignores client attempts to overwrite verified level or role through update()', async () => {
  process.env.BACKEND_URL = 'http://127.0.0.1:55440';
  const callback = authOptions.callbacks?.jwt;
  if (!callback) throw new Error('Missing JWT callback');
  const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ...user, id: 1, isLevelVerified: false })));
  try {
    const token = await callback({ token: {}, user, account: null, trigger: 'update',
      session: { user: { role: 'ADMIN', isLevelVerified: true } } });
    expect(token.profile?.role).toBe('USER');
    expect(token.profile?.isLevelVerified).toBe(false);
    expect(fetcher).toHaveBeenCalledWith('http://127.0.0.1:55440/api/users/profile', expect.objectContaining({ cache: 'no-store' }));
  } finally { fetcher.mockRestore(); }
});
