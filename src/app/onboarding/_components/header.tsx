"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "~/components/ui/skeleton";
import { siteConfig } from "~/config/site";

export const OnboardingHeader = () => {
  const { data } = useSession();
  const isAuthenticated = data?.isAuthenticated;

  return (
    <header className="w-full h-16 2xl:20">
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
