"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "~/components/loader";

/**
 * Legacy /apply/[id]/form route: canonical flow is /apply/[id].
 */
export default function ApplicationFormRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  useEffect(() => {
    if (id) {
      router.replace(`/apply/${id}`);
    }
  }, [id, router]);

  if (!id) {
    return <Loader mode="icon" />;
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
      Redirecting to apply…
    </div>
  );
}
