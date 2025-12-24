export interface IUser {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_profile_complete: boolean;
  // avatar: string;
  // isAdmin: boolean;
  // status?: string;
  // roles?: string[];
  // photo?: string;
}

export type ITokenResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  detail: string;
  status_code: number;
  data: T;
};

export type Unpromisify<T> = T extends Promise<infer R> ? R : T;

export type AnyObject = Record<string, any>;
export type AnyArray = unknown[];
export type AnyObjectOrArray = AnyObject | AnyArray;

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  options: {
    paginationSettings: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      nextPage: number;
      previousPage: number;
      limit: number;
    };
  };
}

export type ServerSideResponse<T = any> = ApiResponse<T>;
