import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const runtime = "nodejs";

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

          return {
            id: String(user.id),
            name: user.name,
            username: user.username,
            role: user.role,
            image: user.image,
            balance: user.balance,
            skillLevel: user.skillLevel,
            isLevelVerified: user.isLevelVerified ?? false,
          } as User;
        } catch (e) {
          console.error("[NextAuth] Authorize network error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = u.role;
        token.balance = u.balance;
        token.skillLevel = u.skillLevel;
        token.isLevelVerified = u.isLevelVerified;

        console.log(
          `[NextAuth] JWT Created: ID ${u.id}, Skill: ${u.skillLevel}`,
        );
      }

      if (trigger === "update" && session?.user) {
        console.log("[NextAuth] JWT Manual update triggered");
        return { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as any;
        sUser.id = token.id as string;
        sUser.role = token.role as string;
        sUser.balance = token.balance as number;
        sUser.skillLevel = token.skillLevel as string;
        sUser.isLevelVerified = token.isLevelVerified as boolean;
      }
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
