"use client";

import { Award, Info, Sparkles, Check, X, Brain, TrendingUp, GraduationCap, Code, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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
  const breakdown = application?.matching_breakdown;

  // Determine match level color classes
  const getMatchLevelClasses = (level: string | null) => {
    if (!level) return { bg: "bg-gray-500", badge: "bg-gray-100 text-gray-700", icon: "text-gray-600", progress: "bg-gray-500" };
    if (level.includes("Strong")) return { bg: "bg-green-500", badge: "bg-green-100 text-green-700", icon: "text-green-600", progress: "bg-green-500" };
    if (level.includes("Good")) return { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700", icon: "text-blue-600", progress: "bg-blue-500" };
    if (level.includes("Potential")) return { bg: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700", icon: "text-yellow-600", progress: "bg-yellow-500" };
    return { bg: "bg-orange-500", badge: "bg-orange-100 text-orange-700", icon: "text-orange-600", progress: "bg-orange-500" };
  };

  const matchLevelClasses = getMatchLevelClasses(application?.match_level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${matchLevelClasses.bg} rounded-lg`}>
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold">
                  Explainable Matching Score
                </DialogTitle>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span className="text-xs">AI-Assisted</span>
              </Badge>
              <div className={`flex items-center gap-1 px-3 py-1 ${matchLevelClasses.badge} rounded-full`}>
                <Sparkles className={`h-3 w-3 ${matchLevelClasses.icon}`} />
                <span className={`text-sm font-semibold ${matchLevelClasses.badge}`}>
                  {matchPercentage}%
                </span>
              </div>
            </div>
          </div>
          <DialogDescription>
            Transparent, weighted matching breakdown with detailed explanations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* AI Disclosure */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              <strong>AI Disclosure:</strong> This matching score is calculated using an explainable algorithm with weighted factors (Skills: 50%, Experience: 30%, Education: 20%). 
              All scores are transparent and auditable. No automated hiring decisions are made without human review.
            </p>
          </div>

          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Overall Match Score: {matchPercentage}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${matchLevelClasses.progress} transition-all`}
                    style={{ width: `${matchPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Match Level:</strong> {application?.match_level || "Not Available"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Component Scores Breakdown */}
          {breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-600" />
                    Skills Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(breakdown.skills_score)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      Contribution: {breakdown.skills_contribution.toFixed(1)} points
                      <br />
                      Weight: {(breakdown.weights_used?.skills_weight || 0.5) * 100}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Experience Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(breakdown.experience_score)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      Contribution: {breakdown.experience_contribution.toFixed(1)} points
                      <br />
                      Weight: {(breakdown.weights_used?.experience_weight || 0.3) * 100}%
                      {breakdown.experience_gap !== null && (
                        <>
                          <br />
                          Gap: {breakdown.experience_gap > 0 ? "+" : ""}{breakdown.experience_gap} years
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    Education Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(breakdown.education_score)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      Contribution: {breakdown.education_contribution.toFixed(1)} points
                      <br />
                      Weight: {(breakdown.weights_used?.education_weight || 0.2) * 100}%
                      <br />
                      {breakdown.education_match ? "✓ Match" : "✗ Mismatch"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Check className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-700">
                  Matching Skills ({matchingSkills.length})
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
                  Missing Skills ({missingSkills.length})
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

          {/* Detailed Explanation */}
          {breakdown?.explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detailed Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                  {breakdown.explanation}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

