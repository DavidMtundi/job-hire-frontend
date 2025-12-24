import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { MapPin, Clock, DollarSign, EyeIcon, EditIcon, UsersIcon, MoreHorizontalIcon, CalendarIcon, AlertCircle, CheckCircleIcon, XCircle, ClockIcon, AlertCircleIcon, XCircleIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import { TJob } from '~/apis/jobs/schemas'
import { Badge } from '~/components/ui/badge'

interface JobCardProps {
  job: TJob;
}

export const JobCard = ({ job }: JobCardProps) => {

  const formatJobType = (jobType: string) => {
    switch (jobType) {
      case 'full_time':
        return 'Full Time';
      case 'part_time':
        return 'Part Time';
      case 'contract':
        return 'Contract';
      case 'internship':
        return 'Internship';
      default:
        return jobType;
    }
  }


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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="size-3" />;
      case "paused":
        return <AlertCircleIcon className="size-3" />;
      case "closed":
        return <XCircleIcon className="size-3" />;
      case "draft":
        return <ClockIcon className="size-3" />;
      default:
        return <ClockIcon className="size-3" />;
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "destructive";
      default:
        return "outline";
    }
  };


  const formatSalary = (salaryMin: number | null | undefined, salaryMax: number | null | undefined, salaryCurrency: string | null | undefined) => {
    if (!salaryMin || !salaryMax || salaryMin <= 0 || salaryMax <= 0 || !salaryCurrency) {
      return null;
    }
    return `${salaryMin} - ${salaryMax} ${salaryCurrency}`;
  }

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow gap-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="text-base font-medium">{job.department?.name} {job.department && job.category && '|'} {job.category?.name}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {/* <Badge variant={getPriorityColor("mid")}>
              {"mid".toUpperCase()}
            </Badge> */}
            <Badge
              className={`${getStatusColor(
                job.status ?? ""
              )} flex items-center space-x-1`}
            >
              {getStatusIcon(job.status ?? "")}
              <span className="capitalize">{job.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">
            <MapPin className="size-4" />
            <span>{job.location}</span>
          </Badge>
          <Badge variant="secondary">
            <Clock className="size-4" />
            <span>{job.job_type && formatJobType(job.job_type)}</span>
          </Badge>
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
            <Badge variant="secondary">
              <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
              <span className='text-xs'>/month</span>
            </Badge>
          )}
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-4" />
            <span className="text-sm">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground line-clamp-2 max-w-3xl">
          {job.description.slice(0, 200)}{job.description.length > 200 ? '...' : ''}
        </p>
        {/* <JobCardStats /> */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>Recruiter: {job.created_by}</p>
          </div>
          <div className="flex space-x-2 mt-[10px]">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/admin/jobs/${job.id}`}>
                <EyeIcon className="size-3.5" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/jobs/${job.id}?edit=true`}>
                <EditIcon className="size-3.5" />
                Edit
              </Link>
            </Button>
            {/* <Button variant="destructive" size="sm">
              <TrashIcon className="size-3.5" />
              Delete
            </Button> */}

            {/* <Button variant="outline" size="sm">
              <UsersIcon className="size-4 mr-1" />
              Applications
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontalIcon className="size-4" />
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const JobCardStats = () => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="text-center p-3 bg-blue-50 rounded-lg">
        <p className="text-2xl font-bold text-blue-600">
          {/* {job.applicationsCount} */}
          -
        </p>
        <p className="text-xs text-gray-600">
          Applications
        </p>
      </div>
      <div className="text-center p-3 bg-purple-50 rounded-lg">
        <p className="text-2xl font-bold text-purple-600">
          {/* {job.interviewsCount} */}
          -
        </p>
        <p className="text-xs text-gray-600">Interviews</p>
      </div>
      <div className="text-center p-3 bg-yellow-50 rounded-lg">
        <p className="text-2xl font-bold text-yellow-600">
          {/* {job.offersCount} */}
          -
        </p>
        <p className="text-xs text-gray-600">Offers</p>
      </div>
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <p className="text-2xl font-bold text-green-600">
          {/* {job.hiredCount} */}
          -
        </p>
        <p className="text-xs text-gray-600">Hired</p>
      </div>
    </div>
  )
}