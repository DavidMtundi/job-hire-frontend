"use client";

import { useState } from "react";
import { Sparkles, Check, Info, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useGetAIInterviewScoresQuery, useGetInterviewsByApplicationIdQuery } from "~/apis/interviews/queries";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AIInterviewAssessmentModal } from "./ai-interview-assessment-modal";

interface AIInterviewAssessmentCardProps {
  application: any;
}

export const AIInterviewAssessmentCard = ({ application }: AIInterviewAssessmentCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const actualApplicationId = application.application_id || application.id;

  const { data: interviews, isLoading: isLoadingInterviews } = useGetInterviewsByApplicationIdQuery(actualApplicationId);

 const aiInterviews = interviews?.filter((interview) =>
    interview.interview_type?.toLowerCase() === "hr" && interview.ai_interview !== undefined
  ) || [];

  const sortedAiInterviews = aiInterviews.sort((a, b) => {
    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
    return dateB - dateA;
  });

  const interviewId = sortedAiInterviews[0]?.id || "";

  const { data: scoresData, isLoading: isLoadingScores, error } = useGetAIInterviewScoresQuery(
    actualApplicationId,
    interviewId || ""
  );

 

  if (!interviewId) {
    return null;
  }

  if (isLoadingScores) {
    return (
      <Card className="bg-white shadow-sm border border-green-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Loading AI Interview Assessment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!scoresData?.data || error) {
    return null;
  }

  const technicalScore = scoresData?.data?.weighted_percentage_out_of_90 
    ? Math.round(scoresData.data.weighted_percentage_out_of_90) 
    : 0;
  const communicationScore = scoresData?.data?.communication_percentage_out_of_10 
    ? Math.round(scoresData.data.communication_percentage_out_of_10) 
    : 0;
  const totalScore = scoresData?.data?.total_percentage_out_of_100 
    ? Math.round(scoresData.data.total_percentage_out_of_100) 
    : 0;
  
  const threshold = 70;
  const status = totalScore >= threshold ? "PASSED" : "FAILED";

  const assessmentData = {
    status,
    technicalScore,
    communicationScore,
    totalScore,
    threshold,
    completedDate: application.interview_date || application.updated_at || new Date().toISOString(),
    candidateName: `${application.first_name || ""} ${application.last_name || ""}`.trim() || "N/A",
    scoresData: scoresData?.data,
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "M/d/yyyy");
    } catch {
      return "N/A";
    }
  };

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="bg-white shadow-sm border border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">AI Interview Assessment</CardTitle>
                <p className="text-sm text-gray-600">AI Technical Screening</p>
              </div>
            </div>
            {assessmentData.status && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${
                assessmentData.status === "PASSED"
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}>
                <Check className={`h-3 w-3 ${
                  assessmentData.status === "PASSED"
                    ? "text-green-600"
                    : "text-red-600"
                }`} />
                <span className={`text-sm font-semibold ${
                  assessmentData.status === "PASSED"
                    ? "text-green-700"
                    : "text-red-700"
                }`}>{assessmentData.status}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                  <div className="absolute top-2 right-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Technical Score</h4>
                    <p className="text-2xl font-bold text-gray-900">{assessmentData.technicalScore}%</p>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gray-800 transition-all"
                        style={{ width: `${assessmentData.technicalScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Communication</h4>
                    <p className="text-2xl font-bold text-gray-900">{assessmentData.communicationScore}%</p>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gray-800 transition-all"
                        style={{ width: `${assessmentData.communicationScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-medium text-gray-700">Total Score</h4>
                      <Info className="h-3 w-3 text-gray-400" />
                      <Sparkles className="h-3 w-3 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{assessmentData.totalScore}%</p>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gray-800 transition-all"
                        style={{ width: `${assessmentData.totalScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-gray-600">
              Completed on {formatDate(assessmentData.completedDate)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="bg-white"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AIInterviewAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assessmentData={assessmentData}
        application={application}
        scoresData={scoresData}
        isLoadingScores={isLoadingScores}
      />
    </>
  );
};

