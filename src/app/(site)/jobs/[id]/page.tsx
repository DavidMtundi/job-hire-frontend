import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import JobDetailsScreen from "~/features/jobs/job-details";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
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