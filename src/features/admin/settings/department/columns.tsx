"use client"

import { ColumnDef } from "@tanstack/react-table";
import { TDepartment } from "~/apis/departments/schemas";
import { CellAction } from "./cell-action";


export const columns: ColumnDef<TDepartment>[] = [
  {
    accessorKey: "id",
    header: "Dept ID",
    cell: ({ row }) => row.original.id?.toString().padStart(2, "0") ?? "-",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <p className="">
          {row.original.description}
        </p>
      )
    }
  },
  {
    accessorKey: "total_jobs",
    header: "Total Jobs",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>{row.original.total_jobs}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]