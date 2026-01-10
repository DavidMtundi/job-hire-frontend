import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "~/config/auth-config";
import { credentialLogin } from "~/apis/auth/services";
import { ITokenResponse, IUser } from "~/types";
import { graceHandler } from "~/utils/api-utils";

export const { handlers, signIn, signOut, auth: authSession } = NextAuth({
  secret: authConfig.secret,
  trustHost: authConfig.trustHost,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: authConfig.googleClientId,
      clientSecret: authConfig.googleClientSecret,
    }),
    Credentials({
      id: "credentials",
      name: "Email Password Login",
      credentials: {
        email: {
          name: "email",
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
          required: true
        },
        password: {
          name: "password",
          type: "password",
          label: "Password",
          placeholder: "********",
          required: true
        },
      },
      authorize: graceHandler(async (credentials) => {
        if (!credentials) return null;

        const payload = {
          email: credentials.email,
          password: credentials.password,
        };

        try {
          const response = await credentialLogin(payload);
          console.log("API Response:", JSON.stringify(response, null, 2));

          if (!response || !response.success) {
            console.error("Login failed:", response?.message || "No response from server");
            throw new Error(response?.message || "Invalid credentials");
          }

          // The response.data contains the actual login data (access_token, refresh_token, user)
          const loginData = response.data;
          console.log("Login data:", JSON.stringify(loginData, null, 2));
          
          if (!loginData) {
            console.error("Invalid response format - missing data");
            throw new Error("Invalid response format from server");
          }

          if (!loginData.access_token || !loginData.user) {
            console.error("Invalid response format - missing access_token or user", {
              hasAccessToken: !!loginData.access_token,
              hasUser: !!loginData.user,
              loginDataKeys: Object.keys(loginData || {})
            });
            throw new Error("Invalid response format from server");
          }

          return {
            id: loginData.user.id,
            email: loginData.user.email,
            username: loginData.user.username,
            role: loginData.user.role,
            is_active: loginData.user.is_active,
            is_email_verified: loginData.user.is_email_verified,
            is_profile_complete: loginData.user.is_profile_complete,
            tokens: {
              accessToken: loginData.access_token,
              refreshToken: loginData.refresh_token,
              userId: loginData.user.id,
            },
          };
        } catch (error: any) {
          console.error("Error in authorize:", error);
          console.error("Error details:", {
            message: error?.message,
            response: error?.response?.data,
            stack: error?.stack
          });
          throw error;
        }
      },
        async (e: any) => {
          console.error("Auth error caught:", e);
          console.error("Error message:", e?.message);
          console.error("Error stack:", e?.stack);
          const errorMessage = e?.message || e?.toString() || "Invalid credentials";
          throw new CredentialsSignin(errorMessage);
        },
      ),
    }),
  ],
  callbacks: {
    async signIn({ user, account, credentials }) {
      // console.log("calbacks.signIn", user, account, credentials);

      if (account?.provider === "google") {
        console.log("Login with google");
        // const res = await socialLogin({
        //   provider: "google",
        //   accessToken: account.access_token as string,
        // });
        // if (!res.ok) return false;
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // console.log("calbacks.jwt", token, user, account, trigger, session);

      // if (account?.provider === "google") {
      //   const res = await socialLogin({ provider: "google", access_token: account.access_token as string });
      //   const userRes = await queryClient.fetchQuery(getUserQuery(res.data.access_token))
      //   return userRes ? { ...token, tokens: res.data, user: { ...userRes.data, tokens: res.data } } : token;
      // }

      // if (isTokenExpired(token.tokens.access_token)) {
      //   const refreshedTokens = await refreshToken(token.tokens.refresh_token);
      //   return { ...token, tokens: refreshedTokens.data, user: token.user };
      // }

      // Handle session update trigger
      if (trigger === "update" && session) {
        // Merge the updated session data
        if (session.user) {
          token.user = { ...(token.user || {}), ...session.user } as IUser;
        }
        if (session.tokens) {
          token.tokens = { ...(token.tokens || {}), ...session.tokens } as ITokenResponse;
        }
      }

      if (user) {
        const { tokens, ...restUser } = user;
        token.user = restUser as IUser;
        token.tokens = tokens;
      }

      // Ensure token always has required structure
      if (!token.user) {
        token.user = {} as IUser;
      }

      return token;
    },
    async session({ session, token }) {
      // console.log("calbacks.session", session, token);

      // token from jwt callback
      if (token && token.user) {
        session.user = token.user as IUser;
        session.isAuthenticated = true;
        session.isValid = !!(token.user as IUser)?.email;
        session.tokens = (token.tokens as ITokenResponse) || null;
      } else {
        // Handle case where there's no valid token
        session.isAuthenticated = false;
        session.isValid = false;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  theme: {
    colorScheme: "auto", // "auto" | "dark" | "light"
    brandColor: "", // Hex color code #33FF5D
    logo: "/logo.png", // Absolute URL to image
  },
  // Enable debug messages in the console if you are having problems
  debug: process.env.NODE_ENV === "development",
});
