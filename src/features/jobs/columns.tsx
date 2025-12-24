"use client"

import { ColumnDef } from "@tanstack/react-table";
import { TJob } from "~/apis/jobs/schemas";
import { JobCard } from "./job-card";


export const columns: ColumnDef<TJob>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <JobCard key={job.id} job={job} />
      )
    }
  },
]