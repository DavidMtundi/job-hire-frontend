import { TCategory } from "./schemas";

export interface ICategoriesResponse {
  success: boolean;
  message: string;
  data: TCategory[];
}

export interface ICategoryResponse {
  success: boolean;
  message: string;
  data: TCategory;
}
