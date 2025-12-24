"use client";

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useDepartmentModal } from '~/hooks/use-department-modal';
import { toast } from 'sonner';
import { useDeleteDepartmentMutation } from '~/apis/departments/queries';

export const DeleteDepartmentModal = () => {
  const { data: department, modal, isOpen, onOpenChange, onClose } = useDepartmentModal();
  const { mutate: deleteDepartment, isPending } = useDeleteDepartmentMutation();

  const handleDelete = (departmentId: number) => {    
    deleteDepartment(department?.id as number, {
      onSuccess: () => {
        toast.success('Department deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete department');
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
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {department?.name}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-28"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            disabled={isPending}
            onClick={() => handleDelete(department?.id as number)} 
            className="w-28"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}