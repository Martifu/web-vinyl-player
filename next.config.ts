import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Removed "output: export" because API routes require a server
  // Deploy to Vercel, Railway, or similar platform for full functionality
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
    ],
  },
};

export default nextConfig;


