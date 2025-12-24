"use client";

import { DownloadIcon, EyeIcon } from "lucide-react";
import { TApplication } from '~/apis/applications/schemas';
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useApplicationModal } from '~/hooks/use-application-modal';

export const ResumeViewModal = () => {
  const { data: application, modal, isOpen, onOpenChange } = useApplicationModal();

  // console.log("Rendering application resume modal:", application);

  return (
    <Dialog open={modal === "resume" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Resume - {application?.candidate.first_name || ""} {application?.candidate.last_name || ""}
          </DialogTitle>
          <DialogDescription>View and download candidate resume</DialogDescription>
        </DialogHeader>
        {application 
          ? <ResumeView application={application} /> 
          : (
            <div className="flex justify-center items-center">
              No resume found
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

const ResumeView = ({ application }: { application: TApplication }) => {
  const firstName = application.candidate.first_name || "";
  const lastName = application.candidate.last_name || "";
  const initials = `${firstName} ${lastName}`
    .trim()
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "N/A"}
            </h3>
            <p className="text-sm text-gray-600">{application.job.title || "N/A"}</p>
          </div>
      </div>

      {/* Resume Preview Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <DownloadIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Resume Preview
            </h3>
            {/* Score and Matching Details in Markdown Style */}
            <div className="text-left mt-4">
              <div className="prose prose-sm max-w-none">
                <h4 className="text-sg font-normal italic text-gray-600">Candidate Matching Summary</h4>
                <ul>
                  <li>
                    <strong>
                      <span style={{ color: "#24292f" }}>Score:</span>
                    </strong>{" "}
                    {application.score != null ? (
                      <span style={{ color: "#24292f", fontWeight: "bold" }}>{application.score}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </li>
                  <li>
                    <strong>Match Level:</strong>{" "}
                    {application.match_level || <span className="text-gray-400">N/A</span>}
                  </li>
                  <li>
                    <strong>Matching Skills:</strong>{" "}
                    {Array.isArray(application.matching_skills) && application.matching_skills.length > 0
                      ? (
                        <div className="flex flex-wrap gap-2 mt-1 pl-1">
                          {application.matching_skills.map((sk: string, i: number) => (
                            <span
                              key={i}
                              className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )
                      : <span className="text-gray-400">None</span>
                    }
                  </li>
                  <li>
                    <strong>Missing Skills:</strong>{" "}
                    {Array.isArray(application.missing_skills) && application.missing_skills.length > 0
                      ? (
                        <div className="flex flex-wrap gap-2 mt-1 pl-1">
                          {application.missing_skills.map((sk: string, i: number) => (
                            <span
                              key={i}
                              className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )
                      : <span className="text-gray-400">None</span>
                    }
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                if (application?.candidate?.resume_url) {
                  window.open(application.candidate.resume_url, "_blank");
                }
              }}
              disabled={!application?.candidate?.resume_url}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View in Browser
            </Button>
            <Button
              onClick={async () => {
                if (application?.candidate?.resume_url) {
                  try {
                    const resumeUrl = application.candidate.resume_url;
                    // Fetch the file as a blob to enforce download
                    const response = await fetch(resumeUrl, { mode: 'cors' });
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = resumeUrl.split("/").pop() || "resume.pdf";
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(link);
                    }, 500);
                  } catch (e) {
                    alert("Failed to download the resume.");
                  }
                }
              }}
              disabled={!application?.candidate?.resume_url}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {application.job.title === "Senior" ? "5+" : "3+"}
          </p>
          <p className="text-sm text-gray-600">Years Experience</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {Math.floor(application?.score ?? 0 * 20)}%
          </p>
          <p className="text-sm text-gray-600">Match Score</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">
            {application.job.department === "Engineering" ? "8+" : "5+"}
          </p>
          <p className="text-sm text-gray-600">Key Skills</p>
        </div>
      </div>
    </div>
  );
}
