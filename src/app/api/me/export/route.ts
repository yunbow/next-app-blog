import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPlan } from "@/lib/stripe/plan-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GDPR Article 20 — Right to data portability.
 *
 * Returns the authenticated user's own content in a single structured JSON
 * document, served as an attachment download. The caller only gets their
 * own rows — there is no admin mode, and the handler refuses unauthenticated
 * requests with 401.
 *
 * What we include:
 *   - A `gdpr` metadata block identifying the article, export time, and
 *     schema version so consumers (and future us) can migrate the shape.
 *   - A user-profile subset — id / name / email / createdAt. We deliberately
 *     omit password hashes, session tokens, OAuth provider keys, and login
 *     history: those are auth infrastructure, not user-authored data, and
 *     exporting them would broaden the attack surface of a lost export file.
 *   - Every user-authored resource family: articles, comments, bookmarks,
 *     bookmark collections, and reactions.
 *
 * What we exclude on purpose:
 *   - NextAuth `Account` / `Session` rows (internal auth tokens).
 *   - `LoginHistory` (security-audit data; lives in Article 15 territory,
 *     not portability).
 *   - Tables the user did not originate (other people's comments on the
 *     user's article, etc.) — those remain the other user's data.
 *
 * Cap per-model at 5000 rows. Larger exports should be chunked / async
 * via a background job; that's out of scope for the v1 shape.
 */
const MAX_ROWS_PER_MODEL = 5000;
const SCHEMA_VERSION = "1";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { isPremium } = await getUserPlan(userId);
  if (!isPremium) {
    return Response.json(
      { error: "データエクスポートはPremiumプランの機能です。" },
      { status: 403 },
    );
  }

  const [user, articles, comments, bookmarks, bookmarkCollections, reactions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          createdAt: true,
        },
      }),
      prisma.article.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS_PER_MODEL,
      }),
      prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS_PER_MODEL,
      }),
      prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS_PER_MODEL,
      }),
      prisma.bookmarkCollection.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS_PER_MODEL,
      }),
      prisma.reaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS_PER_MODEL,
      }),
    ]);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const body = {
    gdpr: {
      article: "GDPR Article 20 — Right to data portability",
      exportedAt: new Date().toISOString(),
      format: "application/json",
      schemaVersion: SCHEMA_VERSION,
      app: "next-app-blog",
    },
    user,
    articles,
    comments,
    bookmarks,
    bookmarkCollections,
    reactions,
  };

  const date = new Date().toISOString().slice(0, 10);
  const filename = `next-app-blog-export-${userId}-${date}.json`;

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
