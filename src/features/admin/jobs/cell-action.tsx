"use client";

import { EditIcon, EyeIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { TJob } from "~/apis/jobs/schemas";
import { useJobModal } from "~/hooks/use-job-modal";

interface CellActionProps {
  data: TJob;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const jobModal = useJobModal();

  const router = useRouter();
  
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Job ID copied to the clipboard.");
  };

  return (
      <div className="flex items-center gap-1">
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => jobModal.onOpen("view", data)}
          className="text-gray-600"
        >
          <EyeIcon className="size-3.5" />
        </Button>
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => router.push(`/admin/jobs/${data.id}?edit=true`)} 
          className="text-gray-600"
        >
          <EditIcon className="size-3.5" />
        </Button>
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => jobModal.onOpen("delete", data)} 
          className="text-gray-600"
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>
  );
};
