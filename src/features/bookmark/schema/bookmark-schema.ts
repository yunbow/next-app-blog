import { z } from "zod";

// Bookmark schemas
export const CreateBookmarkSchema = z.object({
  articleId: z.string().min(1, "記事IDは必須です"),
  collectionId: z.string().optional(),
  note: z.string().max(500, "メモは500文字以内で入力してください").optional(),
});

export const UpdateBookmarkSchema = z.object({
  note: z.string().max(500, "メモは500文字以内で入力してください").optional(),
  collectionId: z.string().nullable().optional(),
});

export const DeleteBookmarkSchema = z.object({
  bookmarkId: z.string().min(1, "ブックマークIDは必須です"),
});

// Collection schemas
export const CreateCollectionSchema = z.object({
  name: z.string().min(1, "コレクション名は必須です").max(100, "コレクション名は100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").optional(),
  isPublic: z.boolean().default(false),
});

export const UpdateCollectionSchema = z.object({
  name: z.string().min(1, "コレクション名は必須です").max(100, "コレクション名は100文字以内で入力してください").optional(),
  description: z.string().max(500, "説明は500文字以内で入力してください").optional(),
  isPublic: z.boolean().optional(),
});

export const DeleteCollectionSchema = z.object({
  collectionId: z.string().min(1, "コレクションIDは必須です"),
});

// Type exports
export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof UpdateBookmarkSchema>;
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
