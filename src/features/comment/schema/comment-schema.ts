import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "コメントを入力してください").max(1000, "コメントは1000文字以内で入力してください"),
  articleId: z.string(),
  parentId: z.string().optional(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, "コメントを入力してください").max(1000, "コメントは1000文字以内で入力してください"),
});

export const CommentIdSchema = z.string().min(1, "コメントIDは必須です");

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
