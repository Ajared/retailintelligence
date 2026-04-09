/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: '9k8m7lvkfx.ufs.sh',
        pathname: '/f/**',
      },
    ],
  },
  logging: {
    browserToTerminal: true,
  },
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    typedEnv: true,
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
