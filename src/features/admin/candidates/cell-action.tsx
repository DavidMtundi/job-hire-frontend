"use client";

import { EditIcon, EyeIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useCandidateModal } from "~/hooks/use-candidate-modal";
import { TCandidate } from "~/apis/candidates/schema";
import { useRouter } from "next/navigation";

interface CellActionProps {
  data: TCandidate;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const candidateModal = useCandidateModal();

  const router = useRouter();
  
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Candidate ID copied to the clipboard.");
  };

  return (
      <div className="flex items-center gap-1">
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => candidateModal.onOpen("view", data)}
          className="text-gray-600"
        >
          <EyeIcon className="size-3.5" />
        </Button>
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => router.push(`/admin/candidates/${data.id}?edit=true`)} 
          className="text-gray-600"
        >
          <EditIcon className="size-3.5" />
        </Button>
        <Button 
          size="iconXs" 
          variant="outline" 
          onClick={() => candidateModal.onOpen("delete", data)} 
          className="text-gray-600"
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>
  );
};
