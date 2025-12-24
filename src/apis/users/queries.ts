import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IGetUsersParams, IUserResponse, IUsersResponse } from "./dto";
import { TCreateUser, TUpdateUser } from "./schemas";

export const useGetUsersQuery = (filters: IGetUsersParams = {}) => {
  return useQuery<IUsersResponse, Error>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const response = await apiClient.get<IUsersResponse>("/auth/admin/get-all-users", {
        params: {
          skip: filters.skip ?? 0,
          limit: filters.limit ?? 30,
          role: filters.role ?? "candidate",
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.role ? { role: filters.role } : {}),
        },
      });
      return response.data;
    },
  });
};

export const useGetUserQuery = (userId: string) => {
  return useQuery<IUserResponse, Error>({
    queryKey: ["users", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await apiClient.get<IUserResponse>(`/auth/admin/get-user/${userId}`);
      return response.data;
    },
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-user"],
    mutationFn: async (body: TCreateUser) => {
      const response = await apiClient.post<IUserResponse>("/auth/admin/create-user", body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // console.log("Job created:", data);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-user"],
    mutationFn: async ({ id, ...patch }: TUpdateUser) => {
      const response = await apiClient.put<IUserResponse>(`/auth/admin/update-user/${id}`, patch);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // console.log("Job updated:", data);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-user"],
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`/auth/admin/delete-user/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // console.log("Job deleted:", data);
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
    },
  });
};
