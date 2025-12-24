"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useGetCategoriesQuery } from "~/apis/categories/queries";
import { Input } from "~/components/ui/input";
import { CategoryDetailsModal } from "./category-details-modal";
import { CreateCategoryModal } from "./create-category-modal";
import { DeleteCategoryModal } from "./delete-category-modal";
import { ListCategories } from "./list-categories";
import { UpdateCategoryModal } from "./update-category-modal";

export default function CategoryScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const search = searchTerm?.trim().toLowerCase() || "";

  const { data, isLoading, isError } = useGetCategoriesQuery();
    const categories = data?.data ?? [];

  const filteredCategories = categories.filter((category) => {
    const name = category.name?.toLowerCase() || "";
    const description = category.description?.toLowerCase() || "";
    const totalJobs = category.total_jobs?.toString() || "";

    const matchesSearch =
      !search ||
      name.includes(search) ||
      description.includes(search) ||
      totalJobs.includes(search);

    return matchesSearch;
  });


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-md w-full">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search categories by name, description, or total jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateCategoryModal />
      </div>

      <ListCategories categories={filteredCategories} isLoading={isLoading} isError={isError} />

      <CategoryDetailsModal />
      <UpdateCategoryModal />
      <DeleteCategoryModal />
    </div>
  );
}