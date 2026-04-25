"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { MarkdownPreview } from "./MarkdownPreview";
import { ImageUpload } from "./ImageUpload";
import { createArticleAction, updateArticleAction } from "../server/article-actions";
import { CreateArticleSchema } from "../schema/article-schema";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.input<typeof CreateArticleSchema>;

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
  isPremium?: boolean;
  isBasicOrAbove?: boolean;
};

export function ArticleForm({ mode, articleId, initialData, categories, isPremium = false, isBasicOrAbove = false }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(CreateArticleSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      tags: initialData?.tags || [],
      categoryId: initialData?.categoryId || "",
      images: initialData?.images || [],
      status: initialData?.status || "draft",
      scheduledAt: initialData?.scheduledAt || "",
    },
  });

  const tags = watch("tags") || [];
  const content = watch("content") || "";
  const scheduledAt = watch("scheduledAt") || "";
  const title = watch("title") || "";

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag));
  };

  const handleInsertImage = useCallback((markdown: string) => {
    const el = contentRef.current;
    const current = content;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newValue = current.slice(0, start) + markdown + current.slice(end);
      setValue("content", newValue, { shouldDirty: true });
      requestAnimationFrame(() => {
        el.selectionStart = start + markdown.length;
        el.selectionEnd = start + markdown.length;
        el.focus();
      });
    } else {
      setValue("content", current + markdown, { shouldDirty: true });
    }
  }, [content, setValue]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    const result = mode === "create"
      ? await createArticleAction(data)
      : await updateArticleAction(articleId!, data);

    if (result.success) {
      toast.success(mode === "create" ? "記事を作成しました" : "記事を更新しました");
      if (result.data && "slug" in result.data) {
        if (data.status === "published") {
          router.push(`/articles/${result.data.slug}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } else if (result.error?.includes("フリープラン")) {
      setShowUpgradeDialog(true);
    } else {
      toast.error(result.error || "エラーが発生しました");
    }

    setIsLoading(false);
  };

  const submitWithStatus = (submitStatus: "draft" | "published" | "scheduled") => {
    handleSubmit((data) => onSubmit({ ...data, status: submitStatus }))();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            {...register("title")}
            placeholder="タイトルを入力..."
            className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label>概要</Label>
          <Input
            {...register("excerpt")}
            placeholder="記事の概要を入力..."
          />
          {errors.excerpt && (
            <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>
          )}
        </div>

        <div>
          <Label>カテゴリ</Label>
          <select
            {...register("categoryId")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="">カテゴリなし</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUpload
              images={(field.value ?? []).map((img) => ({ ...img, order: img.order ?? 0 }))}
              onChange={field.onChange}
              onInsert={handleInsertImage}
            />
          )}
        />

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
          {errors.tags && (
            <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList>
          <TabsTrigger value="editor">エディタ</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
          <TabsTrigger value="split">分割</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                ref={(el) => {
                  field.ref(el);
                  contentRef.current = el;
                }}
                placeholder="Markdownで記事を書く..."
                className="min-h-[500px] font-mono"
              />
            )}
          />
          {errors.content && (
            <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
          )}
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
              value={content}
              onChange={(e) => setValue("content", e.target.value)}
              placeholder="Markdownで記事を書く..."
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

      {/* スケジュール公開 (Premiumのみ) */}
      {isPremium ? (
        <div className="space-y-2">
          <Label>スケジュール公開</Label>
          <div className="flex items-center gap-2">
            <Input
              {...register("scheduledAt")}
              type="datetime-local"
              className="w-auto"
            />
            {errors.scheduledAt && (
              <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
            )}
            {scheduledAt && (
              <Button
                type="button"
                variant="outline"
                onClick={() => submitWithStatus("scheduled")}
                disabled={isLoading || !title || !content}
              >
                予約する
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>スケジュール公開は</span>
          <Link href="/settings/billing" className="underline text-foreground">
            Premiumプラン
          </Link>
          <span>の機能です</span>
        </div>
      )}

      {!isBasicOrAbove && (
        <p className="text-xs text-muted-foreground">
          フリープランでは月3件まで投稿できます。
          <Link href="/settings/billing" className="underline ml-1">
            プランをアップグレード
          </Link>
        </p>
      )}

      <div className="flex items-center gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => submitWithStatus("draft")}
          disabled={isLoading || !title || !content}
        >
          下書き保存
        </Button>
        <Button
          type="button"
          onClick={() => submitWithStatus("published")}
          disabled={isLoading || !title || !content}
        >
          {isLoading ? "送信中..." : mode === "create" ? "公開する" : "更新する"}
        </Button>
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>月間投稿数の上限に達しました</DialogTitle>
            <DialogDescription>
              フリープランでは月3件まで投稿できます。続けて投稿するにはプランをアップグレードしてください。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              閉じる
            </Button>
            <Button asChild>
              <Link href="/settings/billing">プランをアップグレード</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
