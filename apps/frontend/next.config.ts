import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t.me" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "cdn.telegram-org.org" },
      { protocol: "https", hostname: "*.telegram-org.org" },
    ],
  },

  async rewrites() {
    return [
      {
        // Более точное исключение только для NextAuth
        source: "/api/:path((?!auth/).*)",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        // Применяем заголовки ко всем API запросам
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
