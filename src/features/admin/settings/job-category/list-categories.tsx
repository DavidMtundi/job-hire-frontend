"use client"

import { DataTable } from "~/components/data-table"
import { columns } from "./columns"
import { TCategory } from "~/apis/categories/schemas"

interface ListCategoriesProps {
  categories: TCategory[]
  isLoading: boolean
  isError: boolean
}

export const ListCategories = ({ categories, isLoading, isError }: ListCategoriesProps) => {


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching categories</div>
  }

  return (
    <div className="">
      <DataTable columns={columns} data={categories} />
    </div>
  )
}