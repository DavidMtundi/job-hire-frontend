"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectHandlerProps {
  redirectTo: string;
}

export function RedirectHandler({ redirectTo }: RedirectHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectTo);
  }, [router, redirectTo]);

  return null;
}

