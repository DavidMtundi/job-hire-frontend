"use client";

import { EyeIcon, FileText, UploadIcon, XIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PreviewResumeModal } from "./preview-resume-modal";
import { useUploadResumeMutation } from "~/apis/candidates/queries";
import { useOnboardingStore } from "~/hooks/use-onboarding-store";

export default function ResumeUploadScreen() {
  const { resume, setResume, clearResume, resumeData, setResumeData, clearResumeData } = useOnboardingStore();
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { data: session } = useSession();

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
    if (!resume) {
      return toast.error("Please upload your resume to continue");
    }
    if (!session?.user?.id) {
      return toast.error("Please login to continue");
    }

    if (resumeData) {
      toast.info("You have already uploaded a resume");
      router.push("/onboarding/profile-completion");
      return;
    }

    setIsParsing(true);

    uploadResume({ userId: session?.user?.id, file: resume }, {
      onSuccess: (data) => {
        setResumeData(data.data);
        toast.success("Resume Uploaded Successfully");
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
              {!resume ? (
                <div
                  className="group border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="size-10 text-gray-400 group-hover:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload your resume
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

              <div className="flex justify-end gap-3">
               
                <Button
                  onClick={handleContinue}
                  disabled={!resume || isParsing || isUploading}
                >
                  {isParsing ? "Extracting..." : "Continue"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You can update your resume later when applying.
        </p>
      </div>
    </div>
  );
}
