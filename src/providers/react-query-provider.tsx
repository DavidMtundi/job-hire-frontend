"use client";

import ApiError from "~/utils/api-utils/api-error";
import { QueryClient, QueryClientProvider, type DefaultOptions } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type PropsWithChildren, useState } from "react";

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status_code;
  }
  const meta = (error as { metadata?: { status?: number | null } })?.metadata;
  return typeof meta?.status === "number" ? meta.status : undefined;
}

const queryClientDefaults: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      const status = getErrorStatus(error);
      if (status === 401 || status === 403 || status === 404) return false;
      return true;
    },
  },
  mutations: {
    retry: 0,
  },
};

const ReactQueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryClientDefaults,
      })
  );
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
