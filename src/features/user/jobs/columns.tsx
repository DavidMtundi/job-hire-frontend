"use client"

import { ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  EyeIcon,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { TJob } from "~/apis/jobs/schemas";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { formatDate, getJobTypeLabel } from "~/lib/utils";
import { ResumeComparisonModal } from "./resume-comparision-modal";


export const columns: ColumnDef<TJob>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <Card>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl mb-2">
                  {job.title}
                </h3>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatDate(job.created_at)}</span>
                  <span className="mx-2">•</span>
                  <span>{getJobTypeLabel(job.job_type as string)}</span>
                  <span className="mx-2">•</span>
                  <span className="font-medium text-green-600">
                    {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ""} 
                    {job.salary_min && job.salary_max ? " - " : ""}
                    {job.salary_max ? `$${job.salary_max.toLocaleString()}` : ""}
                  </span>

                </div>

                {job.required_skills &&
                  job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.required_skills.map(
                        (skill: string, index: number) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <ResumeComparisonModal jobId={job.id} />
                <Button variant="outline" size="sm">
                  <Link href={`/user/jobs/${job.id}`} className="flex items-center">
                    <EyeIcon />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      )
    }
  },
]