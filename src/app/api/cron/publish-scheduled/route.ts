import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { assertCronAuth } from "@/lib/security/cron-auth";

export async function GET(request: NextRequest) {
  const authError = assertCronAuth(request);
  if (authError) return authError;

  try {
    const now = new Date();

    const articles = await prisma.article.updateMany({
      where: {
        status: "scheduled",
        scheduledAt: { lte: now },
      },
      data: {
        status: "published",
        publishedAt: now,
      },
    });

    logger.info({ published: articles.count }, "Scheduled articles published");

    return NextResponse.json({
      published: articles.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Cron publish-scheduled failed");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
