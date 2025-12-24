"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";

export type FilterParams = Record<string, string | undefined>;

function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function useUrlFilter<T extends FilterParams = FilterParams>() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo(() => {
    const obj = {} as T;
    for (const [key, value] of searchParams.entries()) {
      obj[key as keyof T] = value as T[keyof T];
    }
    return obj;
  }, [searchParams]);

  // Allow both object and functional updates
  const setFilters = useCallback(
    (input: Partial<T> | ((prev: Partial<T>) => Partial<T>)) => {
      const current = { ...filters };
      const updates = typeof input === "function" ? input(current) : input;

      const merged = {
        ...current,
        ...updates,
      };

      const query = Object.fromEntries(
        Object.entries(merged)
          .filter(([, v]) => !isNil(v) && v !== "" && v !== "all")
          .map(([k, v]) => [k, String(v)])
      );

      router.push(`?${new URLSearchParams(query).toString()}`);
    },
    [filters, router]
  );

  return { filters, setFilters };
}
