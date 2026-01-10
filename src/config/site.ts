const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
// For production: use NEXT_PUBLIC_BASE_API_URL (set in Vercel/Railway env vars)
// For local dev: defaults to http://localhost:8002
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8002";

export const siteConfig = {
  title: "Job Portal",
  description: "Job Portal",
  siteUrl: APP_URL,
  apiBaseUrl: API_BASE_URL,
  robots: "noindex, nofollow",
  author: {
    name: "Team-AI",
    website: "#",
  },
  links: {
    linkedIn: "#",
    website: "#",
  },
};

export type SiteConfig = typeof siteConfig;
