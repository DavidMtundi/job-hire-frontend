"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/labels";
import { useCreateApplicationMutation } from "~/apis/applications/queries";
import { useUploadResumeMutation } from "~/apis/resume/queries";
import { useGetAuthUserProfileQuery } from "~/apis/auth/queries";

export default function Apply() {
  const [resume, setResume] = useState<File | null>(null);
  const [resumeMeta, setResumeMeta] = useState<{
    name: string;
    size?: number;
  } | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeMode, setResumeMode] = useState<"existing" | "new">("new");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const createApplicationMutation = useCreateApplicationMutation();
  const uploadResumeMutation = useUploadResumeMutation();
  const { data: userProfile } = useGetAuthUserProfileQuery();
  const existingResumeUrl = userProfile?.data?.candidate_profile?.resume_url || "";
  const hasExistingResume = !!existingResumeUrl;

  useEffect(() => {
    // Wait for NextAuth to resolve session state; don't redirect while loading.
    if (status === "loading") return;

    // Redirect only when we are sure user is unauthenticated.
    if (status === "unauthenticated" || !session?.user) {
      toast.error("Please login to apply for this job");
      router.push(`/login?redirect=/apply/${params.id}`);
      return;
    }

    // Prefill from saved resume meta (uploaded during onboarding)
    const savedMeta = localStorage.getItem("userResumeMeta");
    if (savedMeta) {
      try {
        setResumeMeta(JSON.parse(savedMeta));
        setResumeMode("new");
      } catch {}
    }
    // Prefill a simple default cover letter using profile summary if available
    const profileRaw = localStorage.getItem("userProfile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw) as {
          summary?: string;
          firstName?: string;
        };
        if (profile.summary) setCoverLetter(profile.summary);
        else if (profile.firstName)
          setCoverLetter(
            `Dear Hiring Team,\n\nMy name is ${profile.firstName} and I'm excited to apply...`
          );
      } catch {}
    }
    if (!savedMeta && hasExistingResume) {
      setResumeMode("existing");
    }
  }, [session, status, router, params.id, hasExistingResume]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      setResumeMeta({ name: file.name, size: file.size });
      localStorage.setItem(
        "userResumeMeta",
        JSON.stringify({ name: file.name, size: file.size })
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setResume(file);
      setResumeMeta({ name: file.name, size: file.size });
      localStorage.setItem(
        "userResumeMeta",
        JSON.stringify({ name: file.name, size: file.size })
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeResume = () => {
    setResume(null);
    setResumeMeta(null);
    if (hasExistingResume) {
      setResumeMode("existing");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getResumeFileName = (url: string) => {
    try {
      const fileName = url.split("/").pop();
      return fileName?.split("?")[0] || "resume.pdf";
    } catch {
      return "resume.pdf";
    }
  };

  const handleSubmit = async () => {
    const hasResume = resume || resumeMeta || (hasExistingResume && resumeMode === "existing");
    if (!hasResume) {
      toast.error("Please upload your resume to submit");
      return;
    }
    if (!session?.user) {
      toast.error("Please login to apply for this job");
      router.push(`/login?redirect=/apply/${params.id}`);
      return;
    }

    const userId = (session.user as any)?.id as string | undefined;
    if (!userId) {
      toast.error("User information not available");
      return;
    }

    setIsSubmitting(true);
    try {
      // If user uploaded a new resume file, upload it first.
      if (resume) {
        await uploadResumeMutation.mutateAsync({ userId, file: resume });
      }

      await createApplicationMutation.mutateAsync({
        job_id: String(params.id),
        cover_letter: coverLetter || "",
      });

      localStorage.setItem("lastCoverLetter", coverLetter || "");
      router.push(`/apply/${params.id}/success`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Apply to this job
          </h1>
          <p className="text-gray-600">
            Review your resume and add a cover letter
          </p>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!resume && !resumeMeta && !(hasExistingResume && resumeMode === "existing") ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasExistingResume ? "Upload a New Resume" : "Upload Your Resume"}
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
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {resume?.name ||
                          resumeMeta?.name ||
                          (hasExistingResume && resumeMode === "existing"
                            ? getResumeFileName(existingResumeUrl)
                            : "")}
                      </p>
                      {hasExistingResume && resumeMode === "existing" && (
                        <p className="text-sm text-gray-500">Using your current uploaded resume</p>
                      )}
                      {resumeMeta?.size && resumeMode !== "existing" && (
                        <p className="text-sm text-gray-500">
                          {(resumeMeta.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasExistingResume && resumeMode === "existing" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResumeMode("new");
                          setResumeMeta(null);
                          setResume(null);
                        }}
                      >
                        Upload New
                      </Button>
                    )}
                    {hasExistingResume && resumeMode === "existing" && existingResumeUrl && (
                      <a
                        href={existingResumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        View
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={hasExistingResume && resumeMode === "existing"}
                    >
                      Reupload
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeResume}
                      className="text-red-600 hover:text-red-700"
                      disabled={hasExistingResume && resumeMode === "existing"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {hasExistingResume && !resume && !resumeMeta && (
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                You already have a resume on file. You can use it as-is or upload a new one.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover letter</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Add a brief note about why you're a great fit for this role..."
              />
              <p className="text-xs text-gray-500">
                Optional but recommended. You can keep it short and specific.
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(`/job/${params.id}`)}
              >
                Back to Job Details
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || (!resume && !resumeMeta && !(hasExistingResume && resumeMode === "existing"))
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
