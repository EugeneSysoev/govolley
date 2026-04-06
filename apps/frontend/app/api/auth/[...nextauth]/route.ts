import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const runtime = "nodejs";

// URL бэкенда
const INTERNAL_BACKEND_URL =
  process.env.BACKEND_URL || "http://127.0.0.1:3000/api";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: "telegram-session",
      name: "Telegram",
      credentials: {
        sessionId: { label: "Session ID", type: "text" },
      },
      // Проверка сессии на бэкенде
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.sessionId) return null;

        try {
          const res = await fetch(
            `${INTERNAL_BACKEND_URL}/bot-auth/verify-confirmed-session`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: credentials.sessionId }),
            },
          );

          if (!res.ok) {
            const errorData = await res.text();
            console.error(
              "[NextAuth] Backend verification failed:",
              res.status,
              errorData,
            );
            return null;
          }

          const user = await res.json();

          // Возвращаем данные пользователя
          return {
            id: String(user.id),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            image: user.image,
            role: user.role,
            balance: user.balance,
            skillLevel: user.skillLevel,
            isLevelVerified: user.isLevelVerified ?? false,
            accessToken: user.accessToken,
            createdAt: user.createdAt,
          } as any;
        } catch (e) {
          console.error("[NextAuth] Authorize network error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Сохранение данных в JWT токен
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.accessToken = u.accessToken;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.username = u.username;
        token.image = u.image;
        token.role = u.role;
        token.balance = u.balance;
        token.skillLevel = u.skillLevel;
        token.isLevelVerified = u.isLevelVerified;
        token.createdAt = (user as any).createdAt;
      }

      console.log("user from authorize:", user);

      // Обновление сессии при изменениях
      if (trigger === "update" && session?.user) {
        return {
          ...token,
          firstName: session.user.firstName ?? token.firstName,
          lastName: session.user.lastName ?? token.lastName,
          skillLevel: session.user.skillLevel ?? token.skillLevel,
          image: session.user.image ?? token.image,
          isLevelVerified:
            (session.user as any).isLevelVerified ?? token.isLevelVerified,
          createdAt: token.createdAt,
        };
      }
      return token;
    },

    // Трансформация сессии с данными из токена
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session as any).accessToken = token.accessToken;
        (session.user as any).createdAt = token.createdAt;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).username = token.username;
        (session.user as any).image = token.image;
        (session.user as any).role = token.role;
        (session.user as any).balance = token.balance;
        (session.user as any).skillLevel = token.skillLevel;
        (session.user as any).isLevelVerified = token.isLevelVerified;
      }
      console.log("token in session:", token);
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
