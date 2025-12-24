import { JobDetails } from "~/features/user/jobs/job-details";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;

  return <JobDetails jobId={id} />;
};