"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { RegisterSchema, LoginSchema } from "../schema/auth-schema";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction } from "@/lib/actions/action-helpers";

async function getRequestIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

function generateUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 10; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `user_${suffix}`;
}

async function generateUniqueUsername(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const username = generateUsername();
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
  }
  // フォールバック: タイムスタンプを付加
  return `user_${Date.now()}`;
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  return withAction(async () => {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    const parsed = RegisterSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const ip = await getRequestIp();
    const rateLimitResult = await checkRateLimit(
      `register:${ip}`,
      RATE_LIMITS.register.limit,
      RATE_LIMITS.register.windowMs
    );

    if (!rateLimitResult.success) {
      logger.warn(
        { ip, resetAt: new Date(rateLimitResult.resetAt) },
        "Rate limit exceeded for register"
      );
      return {
        success: false,
        error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。",
      };
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingEmail) {
      return { success: false, error: "このメールアドレスは既に登録されています" };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const username = await generateUniqueUsername();

    await prisma.user.create({
      data: {
        username,
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });

    return { success: true };
  });
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  return withAction(async () => {
    const email = formData.get("email");
    const password = formData.get("password");

    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const ip = await getRequestIp();
    const rateLimitResult = await checkRateLimit(
      `login:${ip}`,
      RATE_LIMITS.login.limit,
      RATE_LIMITS.login.windowMs
    );

    if (!rateLimitResult.success) {
      logger.warn(
        { ip, resetAt: new Date(rateLimitResult.resetAt) },
        "Rate limit exceeded for login"
      );
      return {
        success: false,
        error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。",
      };
    }

    try {
      await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      return { success: true };
    } catch {
      return { success: false, error: "メールアドレスまたはパスワードが正しくありません" };
    }
  });
}

