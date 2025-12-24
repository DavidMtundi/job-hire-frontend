'use server'

import { signIn, signOut } from "~/lib/auth";

export const signInAction = async (email: string, password: string) => {
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/",
  });
};

export const signOutAction = async () => {
  await signOut({ redirectTo: "/login" });
};