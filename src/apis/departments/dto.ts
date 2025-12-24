import { TDepartment } from "./schemas";

export interface IDepartmentsResponse {
  success: boolean;
  message: string;
  data: TDepartment[];
}

export interface IDepartmentResponse {
  success: boolean;
  message: string;
  data: TDepartment;
}
