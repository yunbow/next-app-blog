import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UsernameCheckSchema } from "@/features/user/schema/username-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { checkRateLimit } from "@/lib/security/rate-limit";

type UsernameCheckResult = ActionResult<{ available: boolean }>;

function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number): NextResponse {
  response.headers.set("X-RateLimit-Limit", "30");
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", resetAt.toString());
  return response;
}

export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<UsernameCheckResult>(
      { success: false, error: "認証が必要です" },
      { status: 401 }
    );
  }

  const rateLimitResult = await checkRateLimit(`check-username:${session.user.id}`, 30, 60_000);
  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    const response = NextResponse.json<UsernameCheckResult>(
      { success: false, error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" },
      { status: 429 }
    );
    setRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetAt);
    response.headers.set("Retry-After", retryAfter.toString());
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return setRateLimitHeaders(
      NextResponse.json<UsernameCheckResult>(
        { success: false, error: "ユーザーIDが必要です" },
        { status: 400 }
      ),
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );
  }

  // Zodバリデーション
  const parsed = UsernameCheckSchema.safeParse({ username });
  if (!parsed.success) {
    return setRateLimitHeaders(
      NextResponse.json<UsernameCheckResult>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      ),
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });

  if (existingUser && existingUser.id !== session.user.id) {
    return setRateLimitHeaders(
      NextResponse.json<UsernameCheckResult>(
        { success: false, error: "このユーザーIDは既に使用されています" },
        { status: 200 }
      ),
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );
  }

  return setRateLimitHeaders(
    NextResponse.json<UsernameCheckResult>(
      { success: true, data: { available: true } },
      { status: 200 }
    ),
    rateLimitResult.remaining,
    rateLimitResult.resetAt
  );
}
