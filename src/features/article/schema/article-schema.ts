import { z } from "zod";

export const ArticleImageSchema = z.object({
  url: z.string().min(1, "画像URLが必要です"),
  type: z.enum(["thumbnail", "content"]),
  order: z.number().default(0),
});

export const CreateArticleSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(200, "タイトルは200文字以内で入力してください"),
  content: z.string().min(1, "本文を入力してください").max(50000, "本文は50000文字以内で入力してください"),
  excerpt: z.string().max(500, "概要は500文字以内で入力してください").optional(),
  tags: z.array(z.string()).max(10, "タグは10個まで設定できます").optional(),
  categoryId: z.string().optional(),
  images: z.array(ArticleImageSchema).optional(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  scheduledAt: z.string().optional().refine(
    (val) => !val || new Date(val) > new Date(),
    { message: "公開日時は未来の日時を指定してください" }
  ),
});

export const UpdateArticleSchema = CreateArticleSchema.partial();

// Version schemas
export const ArticleIdSchema = z.string().min(1, "記事IDは必須です");
export const ChangeNoteSchema = z.string().optional();
export const VersionIdSchema = z.string().min(1, "バージョンIDは必須です");

export type ArticleImageInput = z.infer<typeof ArticleImageSchema>;
export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
