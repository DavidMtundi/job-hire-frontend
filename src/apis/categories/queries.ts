import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { ICategoryResponse, ICategoriesResponse } from "./dto";
import { TCreateCategory, TUpdateCategory } from "./schemas";

export const useGetCategoriesQuery = () => {
  return useQuery<ICategoriesResponse, Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get<ICategoriesResponse>("/categories");
      return response.data;
    },
  });
};

export const useGetCategoryQuery = (categoryId: number) => {
  return useQuery<ICategoryResponse, Error>({
    queryKey: ["categories", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const response = await apiClient.get<ICategoryResponse>(`/categories/${categoryId}`);
      return response.data;
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-category"],
    mutationFn: async (body: TCreateCategory) => {
      const response = await apiClient.post<ICategoryResponse>("/categories/", body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // console.log("Job created:", data);
    },
    onError: (error) => {
      console.error("Error creating category:", error);
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-category"],
    mutationFn: async ({ id, ...patch }: TUpdateCategory) => {
      const response = await apiClient.put<ICategoryResponse>(`/categories/${id}`, patch);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // console.log("Job updated:", data);
    },
    onError: (error) => {
      console.error("Error updating category:", error);
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-category"],
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // console.log("Job deleted:", data);
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
    },
  });
};
