// apps/frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t.me" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.telegram-org.org" },
    ],
  },

  async rewrites() {
    return [
      // 1. Наш кастомный эндпоинт для сессии (чтобы не конфликтовал с NextAuth)
      {
        source: "/api/auth/init-session",
        destination: "http://127.0.0.1:3000/api/auth/init-session",
      },
      // 2. Все остальные запросы к /api (training, users и т.д.)
      // Используем именованный параметр :path* БЕЗ сложных регулярок внутри source
      {
        source: "/api/:path((?!auth).*)",
        destination: "http://127.0.0.1:3000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://spathose-julie-unbreakable.ngrok-free.dev",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
