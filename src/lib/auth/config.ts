import type { NextAuthConfig, Session } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/config/env";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHub({
      clientId: env.GITHUB_CLIENT_ID ?? "",
      clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.isSuspended) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const emailLocal = user.email.split("@")[0];
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          let username = `${emailLocal}${randomSuffix}`;

          let isUnique = false;
          while (!isUnique) {
            const duplicate = await prisma.user.findUnique({
              where: { username },
            });
            if (!duplicate) {
              isUnique = true;
            } else {
              const newSuffix = Math.floor(1000 + Math.random() * 9000);
              username = `${emailLocal}${newSuffix}`;
            }
          }

          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              username,
              name: user.name || emailLocal,
              image: user.image,
              emailVerified: new Date(),
            },
          });

          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }
      }

      // ログイン履歴を記録
      if (user.id && account?.provider) {
        try {
          const hdrs = await headers();
          const ipAddress = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null;
          const userAgent = hdrs.get("user-agent") || null;

          await prisma.loginHistory.create({
            data: {
              userId: user.id,
              provider: account.provider,
              ipAddress,
              userAgent,
            },
          });
        } catch {
          // ログイン履歴の記録失敗はログインをブロックしない
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { username: true, isAdmin: true, isSuspended: true },
          });
          if (dbUser) {
            token.username = dbUser.username;
            token.isAdmin = dbUser.isAdmin;
            token.isSuspended = dbUser.isSuspended;
          }
        }
      }

      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true, isAdmin: true, isSuspended: true },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.isAdmin = dbUser.isAdmin;
          token.isSuspended = dbUser.isSuspended;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Next-auth always populates `session.user` before this callback when
      // a token is present; the previous defensive `{} as unknown` init
      // papered over that guarantee. Assigning through the already-augmented
      // shape (see src/types/next-auth.d.ts — Session + JWT interfaces)
      // removes the wildcard-typed hotspot. The per-field narrowings below
      // are needed because next-auth's base JWT interface includes an index
      // signature of `unknown` that wins over the augmented keys in some
      // TS resolutions.
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
        session.user.isAdmin = token.isAdmin as boolean | undefined;
        session.user.isSuspended = token.isSuspended as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
};
