"use client";

import { EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { TDepartment } from "~/apis/departments/schemas";
import { Button } from "~/components/ui/button";
import { useDepartmentModal } from "~/hooks/use-department-modal";

interface CellActionProps {
  data: TDepartment;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const departmentModal = useDepartmentModal();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Department ID copied to the clipboard.");
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* <Button
          size="iconXs"
          variant="outline"
          onClick={() => departmentModal.onOpen("view", data)}
          className="text-gray-600"
        >
          <EyeIcon className="size-3.5" />
        </Button> */}
        <Button
          size="iconXs"
          variant="outline"
          onClick={() => departmentModal.onOpen("edit", data)}
          className="text-gray-600"
        >
          <EditIcon className="size-3.5" />
        </Button>
        <Button
          size="iconXs"
          variant="outline"
          onClick={() => departmentModal.onOpen("delete", data)}
          className="text-gray-600"
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>
    </>
  );
};
