"use client";

import { ArrowLeftIcon, EditIcon } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { useGetJobQuery } from '~/apis/jobs/queries';
import { AdminHeading } from '~/features/admin/_components/heading';
import { DeleteJobModal } from './delete-job-modal';
import { EditJobForm } from './edit-job-form';
import { JobDetails } from './job-details';
import { JobDetailsSkeleton } from './skeleton';
import { TJob } from '~/apis/jobs/schemas';

export default function ManageJobScreen() {
  // const [editMode, setEditMode] = useState(false);

  const router = useRouter();
  const { id: jobId } = useParams();
  const searchParams = useSearchParams();

  const editMode = searchParams.get("edit") === "true" ? true : false;

  const { data: jobQuery, isLoading } = useGetJobQuery(jobId as string);

  const jobData = jobQuery?.data || {} as TJob;
  // console.log("Jobs Data", jobId, jobData);

  const handleBack = () => {
    router.push("/admin/jobs");
  };

  if (isLoading) {
    return (
      <JobDetailsSkeleton />
    );
  }

  if (!isLoading && !jobData.id) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <Button onClick={handleBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div >
      <div className="flex justify-between items-center mb-4">
        <AdminHeading
          title={editMode ? "Edit Job" : "Job Details"}
          description={editMode ? "Update job details and requirements" : "View job information and statistics"}
        />

        {
          editMode ? (
            <Button variant="secondary" onClick={() => router.push(`/admin/jobs/${jobId}`)}>
              <ArrowLeftIcon /> Back to Job Details
            </Button>
          ) : (

            <div className='flex items-center space-x-2'>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeftIcon /> Back to Jobs
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/admin/jobs/${jobId}?edit=true`)}
              >
                <EditIcon /> Edit
              </Button>
              <DeleteJobModal jobId={jobData.id} />
            </div>
          )
        }
      </div>
      {
        editMode 
        ? <EditJobForm jobData={jobData} /> 
        : <JobDetails jobData={jobData} />
      }
    </div>
  )
}
