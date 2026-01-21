"use client";

import { EyeIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCandidateModal } from "~/hooks/use-candidate-modal";
import { TCandidate } from "~/apis/candidates/schema";

interface CellActionProps {
  data: TCandidate;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const candidateModal = useCandidateModal();

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
    </div>
  );
};
