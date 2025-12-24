"use client"

import { useState } from "react";
import { useGetAuthUserProfileQuery } from "~/apis/auth/queries";
import { TCandidate } from "~/apis/candidates/schema";
import { TCompareResumeData } from "~/apis/resume/dto";
import { useCompareResumeMutation } from "~/apis/resume/queries";
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { AlertCircle, CheckCircle2, Lightbulb, LoaderIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Label } from "~/components/ui/label";


interface ResumeComparisonModalProps {
  jobId: string;
  trigger?: React.ReactNode;
}

export const ResumeComparisonModal = ({ jobId, trigger }: ResumeComparisonModalProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [compareResumeData, setCompareResumeData] = useState<TCompareResumeData | null>(null);

  const { data: userProfile, isLoading, isError } = useGetAuthUserProfileQuery();
  const candidateProfile = userProfile?.data?.candidate_profile || {} as TCandidate;

  const { mutate: compareResume, isPending } = useCompareResumeMutation();

  const handleCompareResume = () => {
    const resume_url = "https://dev-api-hiring.must.company/candidates/get-candidate-resume/34"
    compareResume({ job_id: jobId, resume_url: resume_url }, {
      onSuccess: (data) => {
        console.log("data", data);
        setCompareResumeData(data.data);
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
        console.error(error);
      }
    });
  }

  const handleClose = () => {
    setCompareResumeData(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : <DialogTrigger asChild><Button variant="outline">Compare Resumes</Button></DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto min-w-fit">
        <DialogHeader>
          <DialogTitle>Job Comparison</DialogTitle>
          <DialogDescription>
            Compare your resume with the job requirements.
          </DialogDescription>
        </DialogHeader>
        {compareResumeData && (
          <div className="space-y-4">
            <div className="flex gap-3 justify-between">
              <div className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Match Score
                    </CardTitle>
                    <CardDescription>Overall fit score chart for the job</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScoreGauge score={compareResumeData.score} />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-2 w-full">
                <div className="border rounded-lg px-4 py-3 space-y-1">
                  <Label className="font-semibold">Overall Fit</Label>
                  <div className="text-2xl font-bold text-blue-600">{compareResumeData.score}%</div>
                  <p className="text-xs text-gray-600">
                    {compareResumeData.score >= 80
                      ? 'Highly recommended'
                      : compareResumeData.score >= 60
                        ? 'Good candidate'
                        : 'Consider review'}
                  </p>
                </div>

                <div className="border rounded-lg px-4 py-3 space-y-1">
                  <Label className="font-semibold">Experience Alignment</Label>
                  <div className="text-2xl font-bold text-emerald-600">{compareResumeData.matching_skills.length}</div>
                  <p className="text-xs text-gray-600">Matching technical skills</p>
                </div>

                <div className="border rounded-lg px-4 py-3 space-y-1">
                  <Label className="font-semibold">Development Areas</Label>
                  <div className="text-2xl font-bold text-amber-600">{compareResumeData.missing_skills.length}</div>
                  <p className="text-xs text-gray-600">Gap areas identified</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Matching Skills
                    </CardTitle>
                    <CardDescription>{compareResumeData.matching_skills.length} skills matched</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {compareResumeData.matching_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Skills Gap
                    </CardTitle>
                    <CardDescription>Areas for improvement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {compareResumeData.missing_skills.map((skill, idx) => (
                        <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{compareResumeData.recommendation}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="w-32">
            {!!compareResumeData ? "Close" : "Cancel"}
          </Button>
          {
            !compareResumeData && (
              <Button variant="default" onClick={handleCompareResume} disabled={isPending} className="w-32">
                {isPending ? <><LoaderIcon className="size-4 animate-spin" /> Analysing...</> : "Compare"}
              </Button>
            )
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


const ScoreGauge = ({ score }: { score: number }) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'from-green-500 to-emerald-600';
    if (s >= 60) return 'from-blue-500 to-cyan-600';
    if (s >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent Match';
    if (s >= 60) return 'Good Match';
    if (s >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative size-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="20"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#gradient)"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 565} 565`}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
            {score}%
          </div>
          <div className="text-sm text-gray-500 mt-2 font-medium">{getScoreLabel(score)}</div>
        </div>
      </div>
    </div>
  );
};