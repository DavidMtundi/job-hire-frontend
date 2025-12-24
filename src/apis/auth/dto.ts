import { ApiResponse, IUser } from "~/types";

// export interface ISignupInput {
//   username: string;
//   email: string;
//   password: string;
// }

// export interface ILoginInput {
//   email: string;
//   password: string;
// }

export interface ISocialLoginInput {
  access_token: string;
  provider: 'google';
}

export interface IVerifyEmailInput {
  token: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  new_password: string;
}

export type ISignupResponse = ApiResponse<IUser>;
export type ILoginResponse = ApiResponse<{
  token_type: string,
  access_token: string, 
  refresh_token: string, 
  user: IUser 
}>;
export type ISocialLoginResponse = ApiResponse<{ 
  token_type: string, 
  access_token: string, 
  refresh_token: string, 
  user: IUser 
}>;
