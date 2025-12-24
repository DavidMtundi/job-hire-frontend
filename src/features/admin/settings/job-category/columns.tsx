"use client"

import { ColumnDef } from "@tanstack/react-table";
import { TCategory } from "~/apis/categories/schemas";
import { CellAction } from "./cell-action";


export const columns: ColumnDef<TCategory>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => row.original.id?.toString().padStart(2, "0") ?? "-",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="">
        <h6 className="font-medium">{row.original.name}</h6>
        <p className="text-gray-500 text-xs">{row.original.slug}</p>
      </div>
    )
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