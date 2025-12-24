"use client";

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useDeleteCandidateMutation } from '~/apis/candidates/queries';
import { useCandidateModal } from '~/hooks/use-candidate-modal';
import { toast } from 'sonner';

export const DeleteCandidateModal = () => {
  const { data: candidate, modal, isOpen, onOpenChange, onClose } = useCandidateModal();
  const { mutate: deleteCandidate, isPending } = useDeleteCandidateMutation();

  const handleDelete = (candidateId: string) => {    
    deleteCandidate(candidateId, {
      onSuccess: () => {
        toast.success('Candidate deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete candidate');
      },
      onSettled: () => {
        onClose();
      }
    });
  }
  
  return (
    <Dialog open={modal === "delete" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Candidate</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {candidate?.first_name} {candidate?.last_name}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            disabled={isPending}
            onClick={() => handleDelete(candidate?.id as string)} 
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}