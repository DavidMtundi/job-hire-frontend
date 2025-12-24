import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IDepartmentResponse, IDepartmentsResponse } from "./dto";
import { TCreateDepartment, TUpdateDepartment } from "./schemas";

export const useGetDepartmentsQuery = () => {
  return useQuery<IDepartmentsResponse, Error>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await apiClient.get<IDepartmentsResponse>("/departments");
      return response.data;
    },
  });
};

export const useGetDepartmentQuery = (departmentId: number) => {
  return useQuery<IDepartmentResponse, Error>({
    queryKey: ["departments", departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      const response = await apiClient.get<IDepartmentResponse>(`/departments/${departmentId}`);
      return response.data;
    },
  });
};

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-department"],
    mutationFn: async (body: TCreateDepartment) => {
      const response = await apiClient.post<IDepartmentResponse>("/departments", body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      // console.log("Job created:", data);
    },
    onError: (error) => {
      console.error("Error creating department:", error);
    },
  });
};

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-department"],
    mutationFn: async ({ id, ...patch }: TUpdateDepartment) => {
      const response = await apiClient.put<IDepartmentResponse>(`/departments/${id}`, patch);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      // console.log("Job updated:", data);
    },
    onError: (error) => {
      console.error("Error updating department:", error);
    },
  });
};

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-department"],
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/departments/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      // console.log("Job deleted:", data);
    },
    onError: (error) => {
      console.error("Error deleting department:", error);
    },
  });
};
