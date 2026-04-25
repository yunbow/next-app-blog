import { prisma } from "@/lib/prisma";

function toBaseSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return base || "article";
}

export async function generateSlug(title: string): Promise<string> {
  const base = toBaseSlug(title);

  const existing = await prisma.article.findFirst({
    where: { slug: base },
    select: { id: true },
  });

  if (!existing) {
    return base;
  }

  // base-N パターンの最大Nを取得
  const latest = await prisma.article.findFirst({
    where: {
      slug: { startsWith: `${base}-` },
    },
    select: { slug: true },
    orderBy: { slug: "desc" },
  });

  if (!latest) {
    return `${base}-2`;
  }

  const match = latest.slug.match(new RegExp(`^${escapeRegex(base)}-(\\d+)$`));
  const nextNum = match ? parseInt(match[1], 10) + 1 : 2;

  return `${base}-${nextNum}`;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
