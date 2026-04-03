import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
// Temporarily disabled Google Fonts due to Docker/Turbopack compatibility issue
// import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "~/config/site";
import { authSession } from "~/lib/auth";
import { cn } from "~/lib/utils";
import ReactQueryProvider from "~/providers/react-query-provider";
import { ThemeProvider } from "~/providers/theme-provider";
import { ToasterProvider } from "~/providers/toast-provider";

import "~/styles/globals.css";

// Temporarily disabled - using system fonts instead
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/riara-logo.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/riara-logo.png", sizes: "512x512", type: "image/png" }],
  },
};

function isNextDynamicServerUsage(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = "digest" in error ? String((error as { digest?: string }).digest) : "";
  if (digest === "DYNAMIC_SERVER_USAGE") return true;
  const msg = error instanceof Error ? error.message : "";
  return msg.includes("Dynamic server usage") && msg.includes("headers");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await authSession();
  } catch (error) {
    // Prerender/static analysis may throw when auth reads headers(); not a real session failure.
    if (isNextDynamicServerUsage(error)) {
      session = null;
    } else {
      console.warn("Session error (this is normal for unauthenticated users):", error);
    }
  }

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            "[font-family:'Inter',sans-serif]"
            // geistSans.variable,
            // geistMono.variable
          )}
          suppressHydrationWarning
        >
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <ToasterProvider />
            </ThemeProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
