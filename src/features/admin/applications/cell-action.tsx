"use client";

import { useRouter } from "next/navigation";
import { TApplication } from "~/apis/applications/schemas";

interface CellActionProps {
  data: TApplication;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();

  const handleViewApplication = () => {
    router.push(`/admin/applications/${data.id}`);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleViewApplication}
        className="px-4 py-2 text-white font-medium rounded-md bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 hover:from-blue-800 hover:via-blue-600 hover:to-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        View Application
      </button>
    </div>
  );
};
