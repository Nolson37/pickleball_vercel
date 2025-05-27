import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable linting and type checking during builds for Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '0.0.0.0:3000'],
    },
  },
};

export default nextConfig;
