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
          console.log("[AUTH] Attempting login for:", payload.email);
          const response = await credentialLogin(payload);
          console.log("[AUTH] API Response received:", {
            success: response?.success,
            hasData: !!response?.data,
            dataKeys: response?.data ? Object.keys(response.data) : [],
            message: (response as any)?.message
          });
          console.log("[AUTH] Full API Response:", JSON.stringify(response, null, 2));

          if (!response || !response.success) {
            const errorMessage = (response as any)?.message || (response as any)?.data?.message || "Invalid email or password";
            console.error("Login failed:", errorMessage);
            throw new Error(errorMessage);
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
          console.error("[AUTH] Error in authorize callback:", error);
          console.error("[AUTH] Error type:", error?.constructor?.name);
          console.error("[AUTH] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          console.error("[AUTH] Error details:", {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            code: error?.code,
            name: error?.name,
            stack: error?.stack,
            // Check for ApiError properties
            isApiError: error?.isApiError,
            statusCode: error?.statusCode,
          });
          
          // Extract the actual error message from the response
          let errorMessage = "Invalid email or password";
          
          // Check ApiError format first (has status_code property)
          if (error?.status_code === 401 || error?.statusCode === 401) {
            errorMessage = "Invalid email or password";
            console.error("[AUTH] Detected 401/Unauthorized error (status_code:", error?.status_code || error?.statusCode, ")");
          } else if (error?.response?.status === 401) {
            errorMessage = "Invalid email or password";
            console.error("[AUTH] 401 status code detected in response");
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
            console.error("[AUTH] Error message from response.data.message:", errorMessage);
          } else if (error?.response?.data?.detail) {
            errorMessage = error.response.data.detail;
            console.error("[AUTH] Error message from response.data.detail:", errorMessage);
          } else if (error?.message && error.message !== "Error" && error.message.trim() !== "") {
            errorMessage = error.message;
            console.error("[AUTH] Error message from error.message:", errorMessage);
          } else {
            // Last resort - check if it's a network error
            if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network")) {
              errorMessage = "Network error - please check your connection";
            } else if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
              errorMessage = "Request timeout - please try again";
            } else {
              errorMessage = "Login failed - please try again";
            }
            console.error("[AUTH] Using fallback error message:", errorMessage);
          }
          
          console.error("[AUTH] Final error message:", errorMessage);
          throw new Error(errorMessage);
        }
      },
        async (e: any) => {
          console.error("[AUTH] GraceHandler error callback triggered");
          console.error("[AUTH] Error caught:", e);
          console.error("[AUTH] Error type:", e?.constructor?.name);
          console.error("[AUTH] Error message:", e?.message);
          console.error("[AUTH] Error stack:", e?.stack);
          const errorMessage = e?.message || e?.toString() || "Invalid email or password";
          console.error("[AUTH] Throwing CredentialsSignin with message:", errorMessage);
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
        // Merge the updated session data - prioritize session data over existing token data
        // Only store essential fields to avoid cookie size issues
        if (session.user) {
          // Only update essential fields, exclude large nested objects
          token.user = { 
            ...(token.user || {}),
            // Only include essential fields
            id: session.user.id || token.user?.id,
            email: session.user.email || token.user?.email,
            username: session.user.username || token.user?.username,
            role: session.user.role || token.user?.role,
            is_active: session.user.is_active ?? token.user?.is_active,
            is_email_verified: session.user.is_email_verified ?? token.user?.is_email_verified,
            is_profile_complete: session.user.is_profile_complete ?? token.user?.is_profile_complete,
            // Explicitly exclude candidate_profile and other large objects
          } as IUser;
          
          if (process.env.NODE_ENV === "development") {
            console.log("[JWT Callback] Updated token.user with essential fields only:", {
              is_profile_complete: session.user.is_profile_complete,
              email: session.user.email,
              previous_is_profile_complete: token.user?.is_profile_complete
            });
          }
        }
        if (session.tokens) {
          token.tokens = { ...(token.tokens || {}), ...session.tokens } as ITokenResponse;
        }
        
        // Return updated token immediately to ensure middleware gets the new value
        return token;
      }

      // On first login (when user object is provided)
      if (user) {
        const { tokens, ...restUser } = user;
        const restUserAny = restUser as any;
        // Only store essential fields in JWT token to avoid cookie size issues
        // Exclude large nested objects like candidate_profile
        token.user = {
          id: restUserAny.id,
          email: restUserAny.email,
          username: restUserAny.username,
          role: restUserAny.role,
          is_active: restUserAny.is_active,
          is_email_verified: restUserAny.is_email_verified,
          is_profile_complete: restUserAny.is_profile_complete,
          // Don't include candidate_profile or other large objects
        } as IUser;
        
        // Ensure tokens are properly stored - tokens should come from user object returned by authorize callback
        if (tokens) {
          token.tokens = tokens;
          if (process.env.NODE_ENV === "development") {
            console.log("[JWT Callback] Tokens stored for user:", token.user.email);
          }
        } else {
          console.error("[JWT Callback] User object does not contain tokens!", { user });
        }
      }
      
      // Preserve existing tokens on subsequent requests (when user is undefined)
      // This is important because NextAuth reuses the token object
      if (!user && token.tokens) {
        // Ensure token.user only contains essential fields (clean up any large objects)
        if (token.user) {
          token.user = {
            id: token.user.id,
            email: token.user.email,
            username: token.user.username,
            role: token.user.role,
            is_active: token.user.is_active,
            is_email_verified: token.user.is_email_verified,
            is_profile_complete: token.user.is_profile_complete,
            // Explicitly exclude any large nested objects
          } as IUser;
        }
        // Tokens already exist from previous request - keep them
        if (process.env.NODE_ENV === "development") {
          console.log("[JWT Callback] Preserving existing tokens for:", token.user?.email);
        }
      }
      
      // Warn if tokens are missing but user exists (shouldn't happen)
      if (token.user && !token.tokens) {
        console.warn("[JWT Callback] User exists but no tokens found - session may be invalid");
      }

      // Ensure token always has required structure and only contains essential fields
      if (!token.user) {
        token.user = {} as IUser;
      } else {
        // Final cleanup: ensure token.user only has essential fields (no large objects)
        token.user = {
          id: token.user.id,
          email: token.user.email,
          username: token.user.username,
          role: token.user.role,
          is_active: token.user.is_active,
          is_email_verified: token.user.is_email_verified,
          is_profile_complete: token.user.is_profile_complete,
          // Explicitly exclude candidate_profile, permissions array, or any other large objects
        } as IUser;
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
