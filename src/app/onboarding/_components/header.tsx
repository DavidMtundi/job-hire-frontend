"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "~/components/ui/skeleton";

export const OnboardingHeader = () => {
  const { data } = useSession();
  const isAuthenticated = data?.isAuthenticated;

  return (
    <header className="w-full h-16 2xl:20">
      <Container className="h-full flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-3">
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
        {isAuthenticated ? (
          <Button variant="secondary" size="sm" onClick={() => signOut()}>
            <LogOutIcon className="size-4 me-2" />
            <span>Logout</span>
          </Button>
        ) : (
          <Skeleton className="h-10 w-24" />
        )}
      </Container>
    </header>
  );
};
