import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"

declare module "next-auth" {
  interface Session {
    user: {
      company_id?: number
      company_name?: string
      company_domain?: string
      company_logo?: string
      support_email_address?: string
      support_contact_no?: string
    } & DefaultSession["user"]
  }

  interface User {
    company_id?: number
    company_name?: string
    company_domain?: string
    company_logo?: string
    support_email_address?: string
    support_contact_no?: string
  }
}

import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { getUserFromDb } from "./utils/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "parkingbox-frontend-default-secret-key",
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(error) {
      // Invalid credentials is an expected user-facing outcome; avoid noisy stack traces.
      const name = (error as any)?.type || (error as any)?.name;
      if (name === "CredentialsSignin") return;
      // Keep visibility for unexpected auth issues.
      console.error("[NEXTAUTH-ERROR]", error);
    },
    warn(code) {
      console.warn("[NEXTAUTH-WARN]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[NEXTAUTH-DEBUG]", code, metadata);
      }
    },
  },
  providers: [
    Credentials({
      credentials: {
        name: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // The form passes "name" instead of "email"
          const identifier = credentials?.name;
          const password = credentials?.password;

          if (typeof identifier !== "string" || typeof password !== "string") {
            return null;
          }

          console.log("[AUTH] Authorizing user:", identifier);
          const user = await getUserFromDb(identifier, password);

          if (!user) {
            console.log("[AUTH] User not found or password mismatch");
            return null;
          }
          console.log("[AUTH] Authorization successful for user:", user.email);
          return user;
        } catch (error) {
          console.error("[AUTH] Error in authorize callback:", error);
          return null;
        }
      }
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.company_id = user.company_id;
        token.company_name = user.company_name;
        token.company_domain = user.company_domain;
        token.support_email_address = user.support_email_address;
        token.support_contact_no = user.support_contact_no;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        if (token?.company_id) {
          session.user.company_id = token.company_id as number;
          session.user.company_name = token.company_name as string;
          session.user.company_domain = token.company_domain as string;
          session.user.support_email_address = token.support_email_address as string;
          session.user.support_contact_no = token.support_contact_no as string;
        }
      }
      return session;
    }
  }
})