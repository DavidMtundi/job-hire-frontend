import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import JobDetailsScreen from "~/features/jobs/job-details";

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      // Prevent caching so job IDs don't get stuck between builds.
      cache: "no-store",
      headers: { "content-type": "application/json" },
    });
    const data = (await res.json()) as T;
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const backendBaseUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    "http://backend:8002";

  const jobIds = new Set<string>();

  // Fetch job IDs via the public jobs listing endpoint.
  // We limit pages to keep `next dev` / `next build` from becoming too slow.
  const pageSize = 50;
  const maxPages = 20;

  for (let page = 1; page <= maxPages; page++) {
    const url = new URL("/jobs/get-jobs", backendBaseUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", String(pageSize));

    try {
      const response = await fetchJsonWithTimeout<any>(url.toString(), 7000);

      const jobs = Array.isArray(response?.data) ? response.data : [];
      for (const job of jobs) {
        if (job?.id !== undefined && job?.id !== null) {
          jobIds.add(String(job.id));
        }
      }

      const pagination = response?.pagination;
      if (pagination?.total_pages && page >= pagination.total_pages) break;
      if (jobs.length < pageSize) break;
    } catch (error) {
      // In local builds/CI, backend might be unavailable; don't fail the whole build.
      console.warn(
        "[generateStaticParams] Failed to fetch job IDs; falling back to placeholder.",
        error
      );
      break;
    }
  }

  if (jobIds.size === 0) {
    return [{ id: "0" }];
  }

  return Array.from(jobIds).map((id) => ({ id }));
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="bg-gray-50 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Button variant="ghost" className="bg-white" asChild>
          <Link href="/jobs">
            <ArrowLeft />
            Back to Jobs
          </Link>
        </Button>
        <JobDetailsScreen jobId={id} />
      </div>
    </div>
  )
};