"use client";

import { ArrowRightIcon, LogOutIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full h-16 2xl:20 border-b backdrop-blur transition-all duration-300">
      <Container className="h-full flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="Job Hire" 
              width={32} 
              height={32} 
              className="size-8"
            />
            <span className="text-xl font-bold text-blue-950">
              Job Hire
            </span>
          </div>
        </Link>
        {/* nav menu here */}
        {session ? (
          <div className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link href="/login">
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
