"use client";

import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Copy,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetJobQuery } from "~/apis/jobs/queries";
import { Spinner } from "~/components/spinner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { formatDate } from "~/lib/utils";
import { CustomFieldType, TCustomField } from "~/apis/jobs/schemas";
import React from "react";

interface JobDetailsScreenProps {
  jobId: string;
}

export default function JobDetailsScreen({ jobId }: JobDetailsScreenProps) {
  const { data: session, status } = useSession();

  const router = useRouter();

  const { data: jobData, isLoading } = useGetJobQuery(jobId);
  const job = jobData?.data;
  // console.log("job details", job);

  const getJobUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/jobs/${jobId}`;
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(getJobUrl());
    const text = encodeURIComponent(`Check out this job: ${job?.title}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank");
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getJobUrl());
    const text = encodeURIComponent(`Check out this job: ${job?.title} - Apply now!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this job: ${job?.title} - Apply here: ${getJobUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getJobUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getJobUrl()).then(() => toast.success("Link copied!"));
  };

  const handleApply = () => {
    // Don't force-login redirect while session is still being resolved.
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user) {
      toast.error("Please login to apply for this job");
      router.push(`/login?redirect=/jobs/${jobId}`);
    } else {
      router.push(`/user/jobs/${jobId}`);
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

  if (isLoading) return <Spinner className="size-6" />;
  if (!job) return <div className="text-center text-gray-500">Job not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-2 shadow-lg">
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                {job.company?.logo_url ? (
                  <div className="size-16 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center p-2">
                    <img 
                      src={job.company.logo_url} 
                      alt={job.company.name || "Company logo"}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        // Fallback to icon if image fails
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<svg class="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="size-16 rounded-lg bg-primary/10" />
                )}
                <div className="">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-medium text-gray-700">
                      {job.company?.name || "Company"}
                    </p>
                    {job.company && (
                      <span className="text-sm text-muted-foreground">•</span>
                    )}
                    <p className="text-lg text-muted-foreground">{job.category?.name}</p>
                  </div>
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-semibold text-card-foreground">
                    {formatSalary(
                      job.salary_min || 0,
                      job.salary_max || 0,
                      job.salary_currency || ""
                    )}
                  </span>
                  <span>/ month</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>
                    Apply by: <strong>{format(new Date(job.application_deadline as unknown as string), "dd MMM yyyy")}</strong>
                  </span>
                </div>
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
                  <div className="size-1.5 rounded-full bg-primary flex-shrink-0" />
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
        <Card className="gap-2">
          <CardHeader>
            <CardTitle>Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {job?.benefits?.map((benefit: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Apply Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to join our team?</CardTitle>
            <CardDescription>
              Submit your application before the deadline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 py-2">
              <Button onClick={handleApply} className="w-full" size="lg">
                Apply for this Position
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Click to start your application process
              </p>

            </div>
          </CardContent>
        </Card>

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

        {/* Job Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-primary/80">Job Type:</Label>
              </div>
              <Badge variant="outline">{job?.job_type && formatJobType(job.job_type)}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-primary/80">Salary Range:</Label>
              </div>
              <span className="font-medium text-green-600">
                {formatSalary(job?.salary_min || 0, job?.salary_max || 0, job?.salary_currency || "")}
              </span>
            </div>
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

        {/* Share Job */}
        <Card>
          <CardHeader>
            <CardTitle>Share This Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium bg-[#0077B5] text-white hover:bg-[#006396] transition-colors"
              >
                LinkedIn
              </button>
              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Twitter / X
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={handleShareFacebook}
                className="flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium bg-[#1877F2] text-white hover:bg-[#166fe0] transition-colors"
              >
                Facebook
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Copy Link
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
