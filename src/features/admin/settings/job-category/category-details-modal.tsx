"use client";

import { TCategory } from '~/apis/categories/schemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useCategoryModal } from '~/hooks/use-category-modal';

export const CategoryDetailsModal = () => {
  const { data: category, modal, isOpen, onOpenChange } = useCategoryModal();

  // console.log("Rendering CategoryDetailsModal:", category);

  return (
    <Dialog open={modal === "view" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>View category details</DialogDescription>
        </DialogHeader>
        {category
          ? <CategoryDetailsView category={category} />
          : (
            <div className="flex justify-center items-center">
              No category found
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

const CategoryDetailsView = ({ category }: { category: TCategory }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-2">Category Information</h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Name:</strong> {category.name}
          </p>
          <p>
            <strong>Slug:</strong> {category.slug}
          </p>
          <p>
            <strong>Description:</strong> {category.description}
          </p>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Jobs Information</h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Total Jobs:</strong> {category.total_jobs}
          </p>
        </div>
      </div>
    </div>
  );
}
