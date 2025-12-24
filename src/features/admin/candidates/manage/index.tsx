"use client";

import { ArrowLeftIcon, EditIcon, TrashIcon } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { AdminHeading } from '~/features/admin/_components/heading';
import { EditCandidateForm } from './edit-candidate-form';
import { CandidateDetails } from './candidate-details';
import { JobDetailsSkeleton } from './skeleton';
import { TCandidate } from '~/apis/candidates/schema';
import { useGetCandidateQuery } from '~/apis/candidates/queries';
import { useCandidateModal } from '~/hooks/use-candidate-modal';
import { DeleteCandidateModal } from './delete-candidate-modal';

export default function ManageCandidateScreen() {
  const candidateModal = useCandidateModal();

  const router = useRouter();
  const { id: candidateId } = useParams();
  const searchParams = useSearchParams();

  const editMode = searchParams.get("edit") === "true" ? true : false;

  const { data: candidateQuery, isLoading } = useGetCandidateQuery(candidateId as string);

  const candidateData = candidateQuery?.data || {} as TCandidate;
  // console.log("Jobs Data", candidateId, jobData);

  const handleBack = () => {
    router.push("/admin/candidates");
  };

  if (isLoading) {
    return (
      <JobDetailsSkeleton />
    );
  }

  if (!isLoading && !candidateData.id) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h1>
        <Button onClick={handleBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div >
      <div className="flex justify-between items-center mb-4">
        <AdminHeading
          title={editMode ? "Edit Candidate" : "Candidate Details"}
          description={editMode ? "Update candidate details and requirements" : "View candidate information and statistics"}
        />

        {
          editMode ? (
            <Button variant="secondary" onClick={() => router.push(`/admin/candidates/${candidateId}`)}>
              <ArrowLeftIcon /> Back to Candidate Details
            </Button>
          ) : (

            <div className='flex items-center space-x-2'>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeftIcon /> Back to Candidates
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/admin/candidates/${candidateId}?edit=true`)}
              >
                <EditIcon /> Edit
              </Button>
              <Button variant="destructive" onClick={() => candidateModal.onOpen("delete", candidateData)}>
                <TrashIcon /> Delete
              </Button>
            </div>
          )
        }
      </div>
      {
        editMode 
        ? <EditCandidateForm candidateData={candidateData} /> 
        : <CandidateDetails candidate={candidateData} /> 
      }

      <DeleteCandidateModal />
    </div>
  )
}
