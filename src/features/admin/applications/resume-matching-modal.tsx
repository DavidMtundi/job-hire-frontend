"use client";

import { Award, Info, Sparkles, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ResumeMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
}

export const ResumeMatchingModal = ({
  open,
  onOpenChange,
  application,
}: ResumeMatchingModalProps) => {
  const score = application?.score;
  const matchPercentage = score != null ? Math.round(score) : 0;
  const matchingSkills = application?.matching_skills || [];
  const missingSkills = application?.missing_skills || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold">
                  Resume vs JD Matching
                </DialogTitle>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
              <Sparkles className="h-3 w-3 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {matchPercentage}%
              </span>
            </div>
          </div>
          <DialogDescription>
            Detailed breakdown of matching skills and gaps between resume and job description
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Check className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-700">
                  Matching Skills
                </h4>
              </div>
              {matchingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchingSkills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-md border border-green-200"
                    >
                      <span className="text-sm font-medium text-green-800">
                        {skill}
                      </span>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No matching skills found</p>
                </div>
              )}
            </div>

            {/* Missing / Gap Skills */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <X className="h-5 w-5 text-orange-600" />
                <h4 className="text-lg font-semibold text-orange-700">
                  Missing / Gap Skills
                </h4>
              </div>
              {missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 rounded-md border border-orange-200"
                    >
                      <span className="text-sm font-medium text-orange-800">
                        {skill}
                      </span>
                      <X className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No missing skills</p>
                </div>
              )}
            </div>
          </div>

        
        </div>
      </DialogContent>
    </Dialog>
  );
};

