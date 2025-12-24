"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useCandidateModal } from '~/hooks/use-candidate-modal';
import { CandidateDetails } from './candidate-details';

export const ViewCandidateProfileModal = () => {
  const { data: candidate, modal, isOpen, onOpenChange } = useCandidateModal();

  // console.log("Rendering ViewCandidateProfileModal:", candidate);

  return (
    <Dialog open={modal === "view" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>{candidate?.first_name} {candidate?.last_name}</DialogTitle>
          <DialogDescription>Candidate details</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-4 flex-1">
          {candidate
            ? <CandidateDetails candidate={candidate} />
            : (
              <div className="flex justify-center items-center">
                No candidate found
              </div>
            )
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}


