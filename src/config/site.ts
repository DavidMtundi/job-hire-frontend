const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

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
