import { prisma } from "@/lib/prisma";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    include: {
      author: { select: { name: true } },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const rssItems = articles
    .map((article) => {
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/articles/${article.slug}</link>
      <guid>${baseUrl}/articles/${article.slug}</guid>
      <description><![CDATA[${article.excerpt || article.title}]]></description>
      <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
      <author>${article.author.name || "Blog"}</author>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog</title>
    <link>${baseUrl}</link>
    <description>ブログプラットフォーム</description>
    <language>ja</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
