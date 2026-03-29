import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const runtime = "nodejs";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "telegram-session",
      name: "Telegram Session",
      // ДОБАВЛЕНО: Описание полей для credentials (исправляет ошибку типа)
      credentials: {
        sessionId: { label: "Session ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.sessionId) return null;
        try {
          const res = await fetch(
            `${BACKEND_URL}/auth/verify-confirmed-session`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: credentials.sessionId }),
            },
          );

          if (!res.ok) return null;
          const user = await res.json();

          // Если бэкенд вернул объект, NextAuth сохранит его в JWT
          return user || null;
        } catch (e) {
          console.error("Authorize fetch error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. При первичной авторизации
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.balance = (user as any).balance;
        token.skillLevel = (user as any).skillLevel;

        console.log(
          "NextAuth [JWT]: Initialized with skillLevel:",
          token.skillLevel,
        );
      }

      // 2. При вызове update() на клиенте
      if (trigger === "update" && session?.user) {
        console.log("NextAuth [JWT]: Manual update triggered", session.user);
        return { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as any;
        sUser.id = token.id;
        sUser.role = token.role;
        sUser.balance = token.balance;
        sUser.skillLevel = token.skillLevel;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
