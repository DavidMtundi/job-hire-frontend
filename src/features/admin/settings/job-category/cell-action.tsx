"use client";

import { EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { TCategory } from "~/apis/categories/schemas";
import { Button } from "~/components/ui/button";
import { useCategoryModal } from "~/hooks/use-category-modal";

interface CellActionProps {
  data: TCategory;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const categoryModal = useCategoryModal();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Category ID copied to the clipboard.");
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* <Button
          size="iconXs"
          variant="outline"
          onClick={() => categoryModal.onOpen("view", data)}
          className="text-gray-600"
        >
          <EyeIcon className="size-3.5" />
        </Button> */}
        <Button
          size="iconXs"
          variant="outline"
          onClick={() => categoryModal.onOpen("edit", data)}
          className="text-gray-600"
        >
          <EditIcon className="size-3.5" />
        </Button>
        <Button
          size="iconXs"
          variant="outline"
          onClick={() => categoryModal.onOpen("delete", data)}
          className="text-gray-600"
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>
    </>
  );
};
