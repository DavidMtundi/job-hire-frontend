"use client";

import { useRouter } from "next/navigation";
import { TApplication } from "~/apis/applications/schemas";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";

interface CellActionProps {
  data: TApplication;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();

  const handleViewApplication = () => {
    router.push(`/admin/applications/${data.id}`);
  };

  const score = typeof data.score === "number" ? Math.floor(data.score ?? 0) : null;
  const matchLevel = data.match_level || (score !== null ? "Match" : "N/A");
  const matchingSkills = data.matching_skills ?? [];
  const missingSkills = data.missing_skills ?? [];
  const recommendation = data.recommendation ?? "";

  return (
    <div className="flex items-center gap-1">
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="px-3 py-2 text-gray-900 font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
            title="View AI match breakdown (matching vs missing skills)"
          >
            AI Match Details
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Match Details</DialogTitle>
            <DialogDescription>
              How this candidate matches <span className="font-medium">{data.job?.title ?? "the job"}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {score !== null ? `${score}%` : "N/A"}
              </Badge>
              {matchLevel && (
                <Badge variant="outline">
                  {matchLevel}
                </Badge>
              )}
              <div className="text-sm text-muted-foreground">
                {data.candidate?.first_name} {data.candidate?.last_name}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="font-semibold text-sm mb-2">Matching skills</div>
                {matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matchingSkills.map((s) => (
                      <Badge key={`match-${data.id}-${s}`} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No matching skills listed.</div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="font-semibold text-sm mb-2">Missing skills</div>
                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((s) => (
                      <Badge key={`miss-${data.id}-${s}`} variant="destructive">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No missing skills listed.</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="font-semibold text-sm mb-2">Recommendation</div>
              {recommendation ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendation}</p>
              ) : (
                <div className="text-sm text-muted-foreground">No recommendation available.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={handleViewApplication}
        className="px-4 py-2 text-white font-medium rounded-md bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 hover:from-blue-800 hover:via-blue-600 hover:to-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        View Application
      </button>
    </div>
  );
};
