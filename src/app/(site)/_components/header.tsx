"use client";

import { ArrowRightIcon, LogOutIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { siteConfig } from "~/config/site";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full h-16 2xl:20 border-b backdrop-blur transition-all duration-300">
      <Container className="h-full flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img
            src={siteConfig.brand.logo}
            alt={siteConfig.title}
            width={512}
            height={512}
            className="h-9 w-9 object-contain"
          />
        </Link>
        {/* nav menu here */}
        {session ? (
          <div className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link href={session.user.role === "candidate" ? "/user/dashboard" : session.user.role === "hr" || session.user.role === "admin" ? "/admin/dashboard" : "/manager/dashboard"}>
                Go to Dashboard
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            {/* <Button size="sm" variant="link" onClick={() => signOut()}>
              <LogOutIcon className="size-3.5" />
              Logout
            </Button> */}
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </Container>
    </header>
  );
};
