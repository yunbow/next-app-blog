import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "カテゴリ名は必須です").max(100, "カテゴリ名は100文字以内で入力してください"),
  slug: z
    .string()
    .min(1, "スラッグは必須です")
    .max(100, "スラッグは100文字以内で入力してください")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "スラッグは半角英数字とハイフンのみ使用できます"),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
