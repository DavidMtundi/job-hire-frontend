"use client";

import { CopyIcon, EditIcon, EyeIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useUserModal } from "~/hooks/use-user-modal";
import { TUser } from "~/apis/users/schemas";

interface CellActionProps {
  data: TUser;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const userModal = useUserModal();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("User ID copied to the clipboard.");
  };

  return (
    <>
      {/* <AlertModal
        isOpen={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
      /> */}
      <div className="flex items-center gap-1">
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => userModal.onOpen("view", data)}
          className="text-gray-600"
        >
          <EyeIcon className="size-3.5" />
        </Button>
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => userModal.onOpen("edit", data)} 
          className="text-gray-600"
        >
          <EditIcon className="size-3.5" />
        </Button>
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => userModal.onOpen("delete", data)} 
          className="text-gray-600"
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>

      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <CopyIcon />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => userModal.onOpen("view", data)}>
            <EyeIcon />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => userModal.onOpen("edit", data)}>
            <EditIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => userModal.onOpen("delete", data)}>
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </>
  );
};
