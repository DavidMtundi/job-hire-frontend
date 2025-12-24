"use client"

import { Users } from "lucide-react"
import { TUser } from "~/apis/users/schemas"
import { DataTable } from "~/components/data-table"
import { columns } from "./columns"

interface ListUsersProps {
  usersData: TUser[]
  isLoading: boolean
  isError: boolean
}

export const ListUsers = ({ usersData, isLoading, isError }: ListUsersProps) => {


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching users</div>
  }

  return (
    <div className="">
      <DataTable columns={columns} data={usersData} />
      {usersData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or create a new user.
          </p>
        </div>
      )}
    </div>
  )
}