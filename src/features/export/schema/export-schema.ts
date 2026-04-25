import { z } from "zod";

export const ExportArticleSchema = z.object({
  articleId: z.string().min(1, "記事IDは必須です"),
  format: z.enum(["json", "markdown"], { message: "フォーマットはjsonまたはmarkdownを指定してください" }),
});

export type ExportArticleInput = z.infer<typeof ExportArticleSchema>;
