"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "./MarkdownPreview";
import { ImageUpload } from "./ImageUpload";
import { createArticleAction, updateArticleAction } from "../server/article-actions";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ImageData = {
  url: string;
  type: "thumbnail" | "content";
  order: number;
};

type Props = {
  mode: "create" | "edit";
  articleId?: string;
  initialData?: {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    categoryId: string;
    images: ImageData[];
    status: "draft" | "published" | "scheduled";
    scheduledAt: string;
  };
  categories: Category[];
};

export function ArticleForm({ mode, articleId, initialData, categories }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [images, setImages] = useState<ImageData[]>(initialData?.images || []);
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(initialData?.status || "draft");
  const [scheduledAt, setScheduledAt] = useState(initialData?.scheduledAt || "");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (submitStatus: "draft" | "published" | "scheduled") => {
    setIsLoading(true);

    const data = {
      title,
      content,
      excerpt: excerpt || undefined,
      tags,
      categoryId: categoryId || undefined,
      images: images.length > 0 ? images : undefined,
      status: submitStatus,
      scheduledAt: submitStatus === "scheduled" ? scheduledAt : undefined,
    };

    const result = mode === "create"
      ? await createArticleAction(data)
      : await updateArticleAction(articleId!, data);

    if (result.success) {
      toast.success(mode === "create" ? "記事を作成しました" : "記事を更新しました");
      if (result.data && "slug" in result.data) {
        if (submitStatus === "published") {
          router.push(`/articles/${result.data.slug}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } else {
      toast.error(result.error || "エラーが発生しました");
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            placeholder="タイトルを入力..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <Label>概要</Label>
          <Input
            placeholder="記事の概要を入力..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div>
          <Label>カテゴリ</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="">カテゴリなし</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <ImageUpload images={images} onChange={setImages} />

        <div>
          <Label>タグ</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="タグを入力してEnter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button type="button" variant="outline" onClick={addTag}>追加</Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} x
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList>
          <TabsTrigger value="editor">エディタ</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
          <TabsTrigger value="split">分割</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Textarea
            placeholder="Markdownで記事を書く..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] font-mono"
          />
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6 min-h-[500px]">
              <MarkdownPreview content={content} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="split">
          <div className="grid grid-cols-2 gap-4">
            <Textarea
              placeholder="Markdownで記事を書く..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] font-mono"
            />
            <Card>
              <CardContent className="pt-6 min-h-[500px] overflow-auto">
                <MarkdownPreview content={content} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => handleSubmit("draft")}
          disabled={isLoading || !title || !content}
        >
          下書き保存
        </Button>
        <Button
          onClick={() => handleSubmit("published")}
          disabled={isLoading || !title || !content}
        >
          {isLoading ? "送信中..." : mode === "create" ? "公開する" : "更新する"}
        </Button>
      </div>
    </div>
  );
}
