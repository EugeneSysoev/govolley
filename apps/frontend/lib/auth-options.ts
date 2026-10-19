import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { backendApiUrl } from './backend-config';
import { readResponse } from './api';
import { loginSchema, profileSchema } from './contracts';
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  providers: [CredentialsProvider({
    id: 'telegram-session', name: 'Telegram', credentials: { sessionId: { label: 'Session ID', type: 'text' } },
    async authorize(credentials) {
      if (!credentials?.sessionId) return null;
      try {
        const response = await fetch(backendApiUrl('/bot-auth/verify-confirmed-session'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: credentials.sessionId }), cache: 'no-store',
        });
        const user = await readResponse(response, loginSchema);
        return { ...user, id: String(user.id) };
      } catch { return null; }
    },
  })],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const { accessToken, ...profile } = user;
        token.profile = { ...profile, image: profile.image ?? null };
        token.accessToken = accessToken;
        token.profileCheckedAt = Date.now();
      }
      // update() payload is untrusted. Reload protected fields from the backend instead.
      if (token.accessToken && (trigger === 'update' || Date.now() - (token.profileCheckedAt ?? 0) > 60000)) {
        try {
          const response = await fetch(backendApiUrl('/users/profile'), {
            headers: { Authorization: `Bearer ${token.accessToken}` }, cache: 'no-store',
          });
          if (response.status === 401) { delete token.accessToken; delete token.profile; }
          else {
            const profile = await readResponse(response, profileSchema);
            token.profile = { ...profile, id: String(profile.id) };
          }
          token.profileCheckedAt = Date.now();
        } catch { /* Retain last server snapshot during a transient outage. */ }
      }
      return token;
    },
    session({ session, token }) {
      if (token.profile) session.user = token.profile;
      session.accessToken = token.accessToken;
      if (!token.accessToken) session.error = 'SessionExpired';
      return session;
    },
  },
  pages: { signIn: '/auth/signin', error: '/auth/signin' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
