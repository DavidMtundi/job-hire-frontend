import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { MapPin, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { TJob } from '~/apis/jobs/schemas'

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

  const formatSalary = (salaryMin: number, salaryMax: number, salaryCurrency: string) => {
    return `${salaryMin} - ${salaryMax} ${salaryCurrency}`;
  }

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow gap-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="text-base">{job.category?.name}</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/jobs/${job.id}`}>View Details</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{job.job_type && formatJobType(job.job_type)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{formatSalary(job.salary_min || 0, job.salary_max || 0, job.salary_currency || "")}</span>
            <span>/month</span>
          </div>
        </div>
        <p className="text-muted-foreground line-clamp-2 max-w-3xl">
          {job.description.slice(0, 200)}{job.description.length > 200 ? '...' : ''}
        </p>
      </CardContent>
    </Card>
  )
}