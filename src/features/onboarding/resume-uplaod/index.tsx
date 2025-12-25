"use client";

import { EyeIcon, FileText, UploadIcon, XIcon, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { PreviewResumeModal } from "./preview-resume-modal";
import { useUploadResumeMutation, useGetCandidateByUserIdQuery } from "~/apis/candidates/queries";
import { useOnboardingStore } from "~/hooks/use-onboarding-store";

export default function ResumeUploadScreen() {
  const { resume, setResume, clearResume, resumeData, setResumeData, clearResumeData } = useOnboardingStore();
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Check if user already has a resume uploaded
  const { 
    data: existingCandidate, 
    isLoading: isLoadingCandidate,
    error: candidateError,
    refetch: refetchCandidate 
  } = useGetCandidateByUserIdQuery(userId || "");

  const existingResumeUrl = existingCandidate?.data?.resume_url;
  const hasExistingResume = !!existingResumeUrl;
  
  // Extract resume filename from URL if available
  const getResumeFileName = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      return fileName.split('?')[0];
    } catch {
      return 'resume.pdf';
    }
  };

  const { mutate: uploadResume, isPending: isUploading } = useUploadResumeMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeResume = () => {
    clearResume();
    clearResumeData();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = async () => {
    if (!session?.user?.id) {
      return toast.error("Please login to continue");
    }

    // If user has existing resume and no new file selected, continue with existing
    if (hasExistingResume && !resume) {
      router.push("/onboarding/profile-completion");
      return;
    }

    // If no resume selected and no existing resume, MANDATORY to upload
    if (!resume && !hasExistingResume) {
      return toast.error("Please upload your resume to continue");
    }

    // If new resume selected, upload it
    if (resume) {
      setIsParsing(true);

      uploadResume({ userId: session?.user?.id, file: resume }, {
        onSuccess: (data) => {
          setResumeData(data.data);
          toast.success("Resume Uploaded Successfully");
          // Refetch to update the existing candidate data
          refetchCandidate();
          router.push("/onboarding/profile-completion");
        },
        onError: (error) => {
          console.error("Upload error", error);
          toast.error("Failed to upload resume");
        },
        onSettled: () => {
          setIsParsing(false);
        }
      });
    }
  };

  return (
    <div className="bg-gray-50 py-3">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-950 mb-1">
            Upload your resume
          </h1>
          <p className="text-sm text-gray-700">
            We&apos;ll extract your details to speed up your profile setup
          </p>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Loading state */}
              {isLoadingCandidate && (
                <div className="text-center py-4 text-gray-500">
                  Checking for existing resume...
                </div>
              )}

              {/* Show existing resume if available - Make it very clear */}
              {!isLoadingCandidate && hasExistingResume && !resume && (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="size-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 text-lg">
                          Resume Already Uploaded
                        </p>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 font-medium">
                          Current
                        </Badge>
                      </div>
                      <div className="bg-white rounded-md p-3 border border-green-200 mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {existingResumeUrl ? getResumeFileName(existingResumeUrl) : 'Resume File'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Your resume is ready to use
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {existingResumeUrl && (
                          <a
                            href={existingResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                          >
                            📄 View Resume →
                          </a>
                        )}
                        <span className="text-sm text-gray-500">|</span>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                        >
                          📤 Upload New Resume
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        You can continue with your current resume or upload a new one to replace it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show error if fetch failed (only for actual errors, not 404/not found) */}
              {!isLoadingCandidate && candidateError && candidateError.message !== "Candidate not found" && !hasExistingResume && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
                  Could not check for existing resume. Please try refreshing the page.
                </div>
              )}

              {/* Only show upload area if no existing resume or if user wants to upload new one */}
              {(!hasExistingResume || resume) && (
                <>
                  {!resume ? (
                    <div
                      className="group border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon className="size-10 text-gray-400 group-hover:text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {hasExistingResume ? "Upload New Resume" : "Upload your resume"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports PDF, DOC, DOCX files up to 10MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="size-8 text-teal-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {resume.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PreviewResumeModal 
                        resume={resume as File}
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-700"
                          >
                            <EyeIcon className="size-4" /> View
                          </Button>
                        }
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        tabIndex={-1}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                            fileInputRef.current.click();
                          }
                        }}
                        className="text-emerald-600"
                      >
                        <UploadIcon className="size-4" /> Re-upload
                      </Button>

                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={removeResume}
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3">
                {/* Show Continue button if user has existing resume (no new file selected) */}
                {hasExistingResume && !resume && (
                  <Button
                    onClick={handleContinue}
                    disabled={isParsing || isUploading || isLoadingCandidate}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Continue with Current Resume
                  </Button>
                )}
                
                {/* Show Continue/Upload button if resume is selected or if no existing resume (mandatory) */}
                {(resume || (!hasExistingResume && !isLoadingCandidate)) && (
                  <Button
                    onClick={handleContinue}
                    disabled={(!resume && !hasExistingResume) || isParsing || isUploading || isLoadingCandidate}
                  >
                    {isParsing || isUploading 
                      ? "Uploading..." 
                      : hasExistingResume && resume
                      ? "Update Resume" 
                      : "Continue"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 mt-4 text-center">
          {hasExistingResume 
            ? "You can update your resume anytime. Your current resume will be used if you continue."
            : "⚠️ Resume upload is required to complete your profile."}
        </p>
      </div>
    </div>
  );
}
