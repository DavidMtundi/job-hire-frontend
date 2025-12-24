"use client";

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useCategoryModal } from '~/hooks/use-category-modal';
import { toast } from 'sonner';
import { useDeleteCategoryMutation } from '~/apis/categories/queries';

export const DeleteCategoryModal = () => {
  const { data: category, modal, isOpen, onOpenChange, onClose } = useCategoryModal();
  const { mutate: deleteCategory, isPending } = useDeleteCategoryMutation();

  const handleDelete = (categoryId: number) => {    
    deleteCategory(categoryId, {
      onSuccess: () => {
        toast.success('Category deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete category');
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
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {category?.name}? This action
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
            onClick={() => handleDelete(category?.id as number)} 
            className="w-28"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}