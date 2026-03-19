import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Enable standalone output for Docker/Node server
  env: {
    AUTH_URL: process.env.AUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET
  },
  // Increase header size limit to handle larger cookies if needed
  // But we should optimize the JWT token size instead
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
