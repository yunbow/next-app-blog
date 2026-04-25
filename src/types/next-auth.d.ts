import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      isAdmin?: boolean;
      isSuspended?: boolean;
      plan?: "free" | "basic" | "premium";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    isAdmin?: boolean;
    isSuspended?: boolean;
    plan?: "free" | "basic" | "premium";
  }
}
