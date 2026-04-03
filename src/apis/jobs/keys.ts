import type { IGetJobsParams } from "./dto";

export const jobQueryKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobQueryKeys.all, "list"] as const,
  list: (filters: IGetJobsParams) =>
    [
      ...jobQueryKeys.lists(),
      filters.page ?? 1,
      filters.page_size ?? 10,
      filters.status,
      filters.search,
      filters.job_type,
      filters.category,
      filters.is_trending,
      filters.is_featured,
    ] as const,
  detail: (jobId: string) => [...jobQueryKeys.all, "detail", jobId] as const,
};
