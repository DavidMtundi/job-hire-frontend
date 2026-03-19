"use client";

import { EyeIcon, FileText, UploadIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useGetAuthUserProfileQuery } from "~/apis/auth/queries";
import { useGetCandidateByUserIdQuery } from "~/apis/candidates/queries";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const DEFAULT_CONTINUE_TO = "/onboarding/profile-completion";

const getSafeContinueTo = (value: string | null): string => {
  if (!value) return DEFAULT_CONTINUE_TO;
  if (!value.startsWith("/")) return DEFAULT_CONTINUE_TO;

  // Normalize common typo so Continue does not navigate to a dead route.
  if (value.startsWith("/onboardin/") || value === "/onboardin") {
    return value.replace(/^\/onboardin\b/, "/onboarding");
  }

  return value;
};

const getResumeFileName = (url: string) => {
  try {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    return fileName.split("?")[0] || "resume.pdf";
  } catch {
    return "resume.pdf";
  }
};

export default function ResumeChoiceScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const continueTo = useMemo(
    () => getSafeContinueTo(searchParams.get("continueTo")),
    [searchParams]
  );

  const userId = session?.user?.id || "";
  const {
    data: userProfile,
    isLoading: loadingProfile,
    error: profileError,
  } = useGetAuthUserProfileQuery();
  const {
    data: candidate,
    isLoading: loadingCandidate,
    error: candidateError,
  } = useGetCandidateByUserIdQuery(userId);

  const existingResumeUrl = (
    userProfile?.data?.candidate_profile?.resume_url ||
    candidate?.data?.resume_url ||
    ""
  ).trim();
  const hasExistingResume = existingResumeUrl.length > 0;

  const isSessionLoading = sessionStatus === "loading";
  const isAuthenticated = sessionStatus === "authenticated";
  const isCheckingResume =
    isSessionLoading || (isAuthenticated && (loadingProfile || loadingCandidate));
  const hasFetchError = isAuthenticated && !!(profileError || candidateError);

  const encodedContinueTo = encodeURIComponent(continueTo);
  const uploadNewHref = `/onboarding/resume-upload?continueTo=${encodedContinueTo}`;

  return (
    <div className="bg-gray-50 py-3">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-950 mb-1">Choose Resume for This Step</h1>
          <p className="text-sm text-gray-700">
            Continue with your current resume or upload a new one before proceeding.
          </p>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Resume Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isCheckingResume && (
              <div className="text-center text-sm text-gray-500 py-4">
                Checking your existing resume...
              </div>
            )}

            {!isCheckingResume && hasFetchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                We couldn't verify your current resume right now. Please try uploading again or refresh this page.
              </div>
            )}

            {!isCheckingResume && !hasFetchError && hasExistingResume && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="size-5 text-green-700" />
                  <p className="font-semibold text-gray-900">Existing Resume Found</p>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    Current
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  {getResumeFileName(existingResumeUrl)}
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={existingResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <EyeIcon className="size-4" />
                    View Resume
                  </a>
                  <a
                    href={existingResumeUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="size-4" />
                    Download
                  </a>
                </div>
              </div>
            )}

            {!isCheckingResume && !hasFetchError && !hasExistingResume && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No existing resume was found on your profile. Upload a new resume to continue.
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              {hasExistingResume && (
                <Button
                  onClick={() => router.push(continueTo)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Use Existing Resume
                </Button>
              )}

              <Button
                variant={hasExistingResume ? "outline" : "default"}
                onClick={() => router.push(uploadNewHref)}
              >
                <UploadIcon className="size-4 mr-2" />
                Upload New Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
