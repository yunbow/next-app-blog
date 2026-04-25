import { z } from "zod";

export const ToggleReactionSchema = z.object({
  articleId: z.string().min(1, "記事IDは必須です"),
  type: z.enum(["like", "clap", "sad", "surprised"], {
    message: "無効なリアクションタイプです",
  }),
});

export const ArticleIdSchema = z.string().min(1, "記事IDは必須です");
export const UserIdSchema = z.string().min(1, "ユーザーIDは必須です");

export type ToggleReactionInput = z.infer<typeof ToggleReactionSchema>;
