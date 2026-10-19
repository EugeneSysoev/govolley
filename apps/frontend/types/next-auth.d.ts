import type { DefaultSession } from 'next-auth';
import type { Profile } from '@/lib/contracts';
type AuthUser = Omit<Profile, 'id'> & { id: string; accessToken: string };
declare module 'next-auth' {
  interface Session { user: Omit<AuthUser, 'accessToken'> & DefaultSession['user']; accessToken?: string; error?: 'SessionExpired' }
  interface User extends Omit<AuthUser, "image"> { image?: string | null }
}
declare module 'next-auth/jwt' {
  interface JWT { profile?: Omit<AuthUser, 'accessToken'>; accessToken?: string; profileCheckedAt?: number }
}
export {};
