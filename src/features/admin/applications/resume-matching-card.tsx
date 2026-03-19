"use client";

import { Award, Info, Sparkles, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface ResumeMatchingCardProps {
  application: any;
  onViewMatchingSkills: () => void;
}

export const ResumeMatchingCard = ({ application, onViewMatchingSkills }: ResumeMatchingCardProps) => {
  const score = application.score;
  const matchPercentage = score != null ? Math.round(score) : 0;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">Resume vs JD Matching</CardTitle>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
            <Sparkles className="h-3 w-3 text-green-600" />
            <span className="text-sm font-semibold text-green-700">{matchPercentage}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={onViewMatchingSkills}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Matching Skills
        </Button>
      </CardContent>
    </Card>
  );
};

