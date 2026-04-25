import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/utils/image-url";

type ArticleCardProps = {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    publishedAt: Date | null;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      username: string;
    };
    category: { id: string; name: string; slug: string } | null;
    tags: { tag: { id: string; name: string } }[];
    _count: { comments: number; reactions: number };
  };
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/articles/${article.slug}`}>
        {article.thumbnail && (
          <div className="aspect-video overflow-hidden">
            <img
              src={getImageUrl(article.thumbnail)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className={article.thumbnail ? "pt-4 pb-2" : "pb-2"}>
          <div className="flex items-center gap-2 mb-2">
            {article.category && (
              <Badge variant="secondary">{article.category.name}</Badge>
            )}
          </div>
          <h2 className="text-lg font-semibold line-clamp-2">{article.title}</h2>
        </CardHeader>
        <CardContent className="pb-2">
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
          )}
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link href={`/users/${article.author.id}`} className="flex items-center gap-2 hover:text-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={getImageUrl(article.author.image)} />
              <AvatarFallback>{article.author.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span>{article.author.name || "名前未設定"}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {article.publishedAt && (
            <span>{format(article.publishedAt, "yyyy/MM/dd")}</span>
          )}
        </div>
      </CardFooter>
      {article.tags.length > 0 && (
        <div className="px-6 pb-4 flex flex-wrap gap-1">
          {article.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`}>
              <Badge variant="outline" className="text-xs hover:bg-accent cursor-pointer">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
