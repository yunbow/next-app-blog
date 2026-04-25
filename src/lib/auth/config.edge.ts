import type { NextAuthConfig } from "next-auth";

/**
 * Edge Runtime 用の軽量 auth 設定
 * prisma, bcryptjs 等の Node.js 専用モジュールをインポートしない
 * Middleware での認証チェックに使用
 */
export const authConfigEdge: NextAuthConfig = {
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isSuspended = token.isSuspended as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
};
