"use client";

import { FileText, Mail, Phone, Briefcase, DollarSign, GraduationCap, DownloadIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface CandidateDetailsCardProps {
  application: any;
}

export const CandidateDetailsCard = ({ application }: CandidateDetailsCardProps) => {
  const firstName = application.first_name || "";
  const lastName = application.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "N/A";
  const currentPosition = application.current_position || "N/A";
  const email = application.email || "N/A";
  const phone = application.phone || "N/A";
  const yearsExperience = application.years_experience ? `${application.years_experience} years of experience` : "N/A";
  const expectedSalary = application.expected_salary || "N/A";
  const lastEducation = application.last_education || "N/A";
  const resumeUrl = application.resume_url;

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg font-semibold">Candidate Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{fullName}</h3>
          <p className="text-gray-600">{currentPosition}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{phone}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{yearsExperience}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleViewResume}
            disabled={!resumeUrl}
            className="w-full px-4 py-2 text-white font-medium rounded-md bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 hover:from-blue-800 hover:via-blue-600 hover:to-blue-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            View Resume
          </button>
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-3 text-gray-700">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Expected: {expectedSalary}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <GraduationCap className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{lastEducation}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

