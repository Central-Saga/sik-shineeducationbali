import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Allow Caddy reverse proxy to access Next.js dev server
  allowedDevOrigins: ['shine.local.test'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable Turbopack untuk debugging (bisa diaktifkan kembali setelah error fixed)
  // experimental: {
  //   turbo: {
  //     rules: {},
  //   },
  // },
};

export default nextConfig;
