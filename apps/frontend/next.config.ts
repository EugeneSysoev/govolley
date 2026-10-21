import type { NextConfig } from 'next';
import { backendOrigin } from './lib/backend-config';
const nextConfig: NextConfig = {
  async rewrites() {
    const origin = backendOrigin();
    // Fallback runs after dynamic filesystem routes, including NextAuth's catch-all.
    return { beforeFiles: [], afterFiles: [], fallback: [
      { source: '/api/:path*', destination: `${origin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${origin}/uploads/:path*` },
    ] };
  },
};
export default nextConfig;
