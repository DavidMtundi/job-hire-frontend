import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "riarauniversity.ac.ke",
      },
    ],
  },
  output: 'standalone', // Enable standalone output for Docker/Node server
  // Only vars listed here are inlined into the client bundle — never expose secrets.
  env: {
    AUTH_URL: process.env.AUTH_URL,
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
