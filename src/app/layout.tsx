import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
// Temporarily disabled Google Fonts due to Docker/Turbopack compatibility issue
// import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "~/config/site";
import { authSession } from "~/lib/auth";
import { cn } from "~/lib/utils";
import ReactQueryProvider from "~/utils/react-query";
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
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Wrap authSession in try-catch to handle cases where there's no valid session
  let session = null;
  try {
    session = await authSession();
  } catch (error) {
    // If there's a JWT error (e.g., invalid token, no session), continue with null session
    // This is expected for unauthenticated users
    console.warn("Session error (this is normal for unauthenticated users):", error);
  }

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased"
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
