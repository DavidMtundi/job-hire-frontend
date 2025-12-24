"use client"

import { TDepartment } from "~/apis/departments/schemas"
import { DataTable } from "~/components/data-table"
import { columns } from "./columns"

interface ListDepartmentsProps {
  departments: TDepartment[]
  isLoading: boolean
  isError: boolean
}

export const ListDepartments = ({ departments, isLoading, isError }: ListDepartmentsProps) => {


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching departments</div>
  }

  return (
    <div className="">
      <DataTable columns={columns} data={departments} />
    </div>
  )
}