"use client";

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useDeleteUserMutation } from '~/apis/users/queries';
import { useUserModal } from '~/hooks/use-user-modal';
import { toast } from 'sonner';

export const DeleteUserModal = () => {
  const { data: user, modal, isOpen, onOpenChange, onClose } = useUserModal();
  const { mutate: deleteUser, isPending } = useDeleteUserMutation();

  const handleDelete = (userId: string) => {    
    deleteUser(userId, {
      onSuccess: () => {
        toast.success('User deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete user');
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
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user?.username}? This action
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
            onClick={() => handleDelete(user?.id as string)} 
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}