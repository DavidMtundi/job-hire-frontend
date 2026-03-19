import { format } from 'date-fns';
import {
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { TJob } from '~/apis/jobs/schemas';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { formatDate } from '~/lib/utils';
import { CustomFieldType, TCustomField } from '~/apis/jobs/schemas';

interface JobDetailsProps {
  jobData: TJob;
}

export const JobDetails = ({ jobData }: JobDetailsProps) => {

  const job = jobData
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatExperienceLevel = (level: string): string => {
    return level.charAt(0).toUpperCase() + level.slice(1) + " Level";
  };

  const daysUntilDeadline = () => {
    const deadline = new Date(job?.application_deadline || "");
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-2 shadow-lg">
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="size-16 rounded-lg bg-primary/10" />
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <p className='text-muted-foreground font-medium'>{job.department?.name} {job.department && job.category && '|'} {job.category?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">
                  {job.location}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {job.job_type && formatJobType(job.job_type)}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {job.is_remote ? "Remote Available" : "Onsite"}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {job.experience_level && formatExperienceLevel(job.experience_level)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                {(job.salary_min && job.salary_max && (job.salary_min > 0 || job.salary_max > 0)) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="size-4 text-success" />
                    <span className="font-semibold text-card-foreground">
                      {formatSalary(
                        job.salary_min,
                        job.salary_max,
                        job.salary_currency || ""
                      )}
                    </span>
                    <span className='text-xs'>/ month</span>
                  </div>
                )}
                {job.application_deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>
                      Apply by: <strong>{format(new Date(job.application_deadline as unknown as string), "dd MMM yyyy")}</strong>
                    </span>
                  </div>
                )}
                {daysUntilDeadline() > 0 && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    {daysUntilDeadline()} days left
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="gap-2">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                {job?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <CardTitle>Key Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 px-2">
              {job?.responsibilities?.map((skill, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{skill}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2 px-2">
              {job?.required_skills?.map((skill, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{skill}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <h2 className="font-semibold">Academic and Professional Requirements</h2>
              <p className="text-gray-600 px-2">{job?.education_requirements}</p>
            </div>
          </CardContent>
        </Card>


        {/* Benefits */}
        {job?.benefits && job.benefits.length > 0 && (
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {job.benefits.map((benefit: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Fields */}
        {job?.custom_fields && job.custom_fields.length > 0 && (
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.custom_fields.map((field: TCustomField, index: number) => {
                  let displayValue: string | React.ReactNode = "";
                  
                  if (field.value === null || field.value === undefined) {
                    displayValue = <span className="text-muted-foreground italic">Not specified</span>;
                  } else {
                    switch (field.type) {
                      case CustomFieldType.BOOLEAN:
                        displayValue = field.value === true ? "Yes" : "No";
                        break;
                      case CustomFieldType.DATE:
                        displayValue = formatDate(field.value as string);
                        break;
                      case CustomFieldType.NUMBER:
                        displayValue = String(field.value);
                        break;
                      default:
                        displayValue = String(field.value);
                    }
                  }

                  return (
                    <div key={index} className="flex justify-between items-start gap-4 pb-3 border-b last:border-0 last:pb-0">
                      <div className="flex-1">
                        <Label className="text-sm font-semibold text-primary/80">
                          {field.field_name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-muted-foreground">{displayValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {/* Company Info */}
        {/* <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>About Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">industry</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Size:</span>
                  <span className="font-medium">company size</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Founded:</span>
                  <span className="font-medium">founded year</span>
                </div>
              </CardContent>
            </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-primary/80">Job Type:</Label>
              </div>
              <Badge variant="outline">{job?.job_type && formatJobType(job.job_type)}</Badge>
            </div>
            {(job?.salary_min && job?.salary_max && (job.salary_min > 0 || job.salary_max > 0)) && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-primary/80">Salary Range:</Label>
                  </div>
                  <span className="font-medium text-green-600">
                    {formatSalary(job.salary_min, job.salary_max, job?.salary_currency || "")}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-primary/80">Posted:</Label>
              </div>
              <span className="font-medium">
                {formatDate(job?.created_at as string)}
              </span>
            </div>
          </CardContent>
        </Card>

     </div>
    </div>
  )
}