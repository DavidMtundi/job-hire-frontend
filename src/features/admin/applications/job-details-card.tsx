"use client";

import { Briefcase, DollarSign, MapPin, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface JobDetailsCardProps {
  application: any;
}

export const JobDetailsCard = ({ application }: JobDetailsCardProps) => {
  const jobTitle = application.title || "N/A";
  const jobDescription = application.description || "No description available.";
  const experienceLevel = application.experience_level || "N/A";
  const location = application.location || "N/A";
  const jobType = application.job_type || "N/A";
  const department = application.department || "N/A";
  const salaryMin = application.salary_min;
  const salaryMax = application.salary_max;
  const salaryCurrency = application.salary_currency || "USD";
  const isRemote = application.is_remote || false;
  const status = application.status || "N/A";

  const formatSalary = () => {
    if (!salaryMin && !salaryMax) return null;
    if (salaryMin && salaryMax) {
      return `${salaryCurrency} ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
    }
    if (salaryMin) {
      return `${salaryCurrency} ${salaryMin.toLocaleString()}+`;
    }
    return null;
  };

  const formatJobType = (type: string) => {
    const typeMap: Record<string, string> = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
      internship: "Internship",
      temporary: "Temporary",
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold">Job Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{jobTitle}</h3>
          {status && status !== "N/A" && (
            <Badge variant="outline" className="text-xs">
              {status}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {department && department !== "N/A" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{department}</span>
            </div>
          )}
          
          {location && location !== "N/A" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{location}</span>
              {isRemote && <Badge variant="secondary" className="ml-1 text-xs">Remote</Badge>}
            </div>
          )}

          {jobType && jobType !== "N/A" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{formatJobType(jobType)}</span>
            </div>
          )}

          {formatSalary() && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-green-700">{formatSalary()}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {jobDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="px-4 py-2 bg-white rounded-md border border-gray-300 shadow-sm">
            <span className="text-sm font-semibold text-gray-900">
              {experienceLevel} years Experience
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

