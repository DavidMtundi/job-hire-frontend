"use client";

import { Eye, FileText, Upload, UploadIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import axiosInstance from "~/lib/axios";

export default function OnboardingScreen() {
  const [resume, setResume] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    const storedUrl = localStorage.getItem("resumePreviewUrl");
    const storedName = localStorage.getItem("resumeName");
    const storedSize = localStorage.getItem("resumeSize");

    if (storedUrl && storedName && storedSize) {
      setResumePreviewUrl(storedUrl);
      setResume(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      const previewUrl = URL.createObjectURL(file);
      setResumePreviewUrl(previewUrl);

      localStorage.setItem("resumePreviewUrl", previewUrl);
      localStorage.setItem("resumeName", file.name);
      localStorage.setItem("resumeSize", file.size.toString());
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResume(file);
      const previewUrl = URL.createObjectURL(file);
      setResumePreviewUrl(previewUrl);
      localStorage.setItem("resumePreviewUrl", previewUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeResume = () => {
    setResume(null);
    setResumePreviewUrl(null);
    localStorage.removeItem("resumePreviewUrl");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = async () => {
    if (!resume) {
      toast.error("Please upload your resume to continue");
      return;
    }

    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", resume);

      const response = await axiosInstance.post("/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const extractedProfileData = response.data;

      if (extractedProfileData) {
        localStorage.setItem(
          "extractedProfile",
          JSON.stringify(extractedProfileData)
        );
        setIsParsing(false);
        toast.success("Resume Uploaded Successfully");
        push("/onboarding/profile");
      }
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-gray-50 py-3">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-950 mb-1">
            Upload Your Resume
          </h1>
          <p className="text-blue-950">
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
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Your Resume
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
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
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
                          console.log("Re-upload clicked"); // Confirm handler fires
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""; // reset before opening
                            fileInputRef.current.click();
                          }
                        }}
                        className="text-green-600"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Re-upload
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeResume}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
              
                <Button
                  onClick={handleContinue}
                  disabled={!resume || isParsing}
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
      {/* Resume Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl flex flex-col w-full h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete application information and progress
            </DialogDescription>
          </DialogHeader>
          {resumePreviewUrl && (
            <iframe
              src={resumePreviewUrl}
              title="Resume Preview"
              className="w-full h-full border-0 mt-[30px]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
