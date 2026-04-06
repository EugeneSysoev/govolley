import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "spathose-julie-unbreakable.ngrok-free.dev",
    "*.ngrok-free.dev",
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t.me" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "cdn.telegram-org.org" },
      { protocol: "https", hostname: "*.telegram-org.org" },
    ],
  },

  async rewrites() {
    // URL бэкенда (без /api на конце)
    const BACKEND_URL =
      process.env.BACKEND_URL?.replace("/api", "") || "http://localhost:3000";

    return [
      {
        // Проксируем API-запросы, кроме маршрутов NextAuth (они обрабатываются внутри Next.js)
        source: "/api/:path((?!auth/).*)",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        // Проксируем статические файлы аватаров из папки uploads
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Accept, Content-Type, Authorization",
          },
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
