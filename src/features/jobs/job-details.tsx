"use client";

import { format } from "date-fns";
import {
  AwardIcon,
  BriefcaseIcon,
  Calendar,
  CalendarIcon,
  Clock,
  ClockIcon,
  DollarSign,
  GraduationCapIcon,
  HomeIcon,
  MapPinIcon,
  TargetIcon
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BsCheck2Square } from "react-icons/bs";
import { useGetJobQuery } from "~/apis/jobs/queries";
import { Spinner } from "~/components/spinner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { formatDate } from "~/lib/utils";

interface JobDetailsScreenProps {
  jobId: string;
}

export default function JobDetailsScreen({ jobId }: JobDetailsScreenProps) {
  const { data: session } = useSession();

  const router = useRouter();

  const { data: jobData, isLoading } = useGetJobQuery(jobId);
  const job = jobData?.data;
  // console.log("job details", job);

  const handleApply = () => {
    if (!session?.isAuthenticated) {
      router.push(`/login?redirect=/user/jobs/${jobId}`);
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
                <div className="size-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BriefcaseIcon className="size-8 text-primary" />
                </div>
                <div className="">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">{job.category?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">
                  <MapPinIcon className="size-3 mr-1" />
                  {job.location}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <ClockIcon className="size-3 mr-1" />
                  {job.job_type && formatJobType(job.job_type)}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <HomeIcon className="size-3 mr-1" />
                  {job.is_remote ? "Remote Available" : "Onsite"}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <AwardIcon className="size-3 mr-1" />
                  {job.experience_level && formatExperienceLevel(job.experience_level)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4 text-success" />
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
                  <Calendar className="w-4 h-4" />
                  <span>
                    Apply by: <strong>{format(new Date(job.application_deadline as unknown as string), "dd MMM yyyy")}</strong>
                  </span>
                </div>
                {daysUntilDeadline() > 0 && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <Clock className="w-3 h-3 mr-1" />
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
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="size-5 text-primary/70" />
              Job Description
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="size-5 text-primary/70" />
              Key Responsibilities
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <AwardIcon className="size-5 text-primary/70" />
              Required Skills
            </CardTitle>
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
              <h2 className="font-semibold flex items-center gap-2">
                <GraduationCapIcon className="size-5 text-primary" />
                Education Requirements
              </h2>
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
                  <BsCheck2Square className="size-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                <BriefcaseIcon className="size-4 text-primary/70" />
                <Label className="text-primary/80">Job Type:</Label>
              </div>
              <Badge variant="outline">{job?.job_type && formatJobType(job.job_type)}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-primary/70" />
                <Label className="text-primary/80">Salary Range:</Label>
              </div>
              <span className="font-medium text-green-600">
                {formatSalary(job?.salary_min || 0, job?.salary_max || 0, job?.salary_currency || "")}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary/70" />
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
  );
}
