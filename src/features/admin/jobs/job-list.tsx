"use client"

import { Users } from "lucide-react"
import { DataTable } from "~/components/data-table"
import { columns } from "./columns"
import { Loader } from "~/components/loader"
import { TJob } from "~/apis/jobs/schemas"

interface JobListProps {
  data: TJob[]
  isLoading: boolean
  isError: boolean
}

export const JobList = ({ data, isLoading, isError }: JobListProps) => {


  if (isLoading) {
    return <Loader mode="icon" size="lg" />
  }

  if (isError) {
    return <div>Error fetching jobs</div>
  }

  return (
    <div className="">

      <DataTable columns={columns} data={data} />

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or create a new job.
          </p>
        </div>
      )}
    </div>
  )
}