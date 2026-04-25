import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "ユーザー名を入力してください").max(50, "ユーザー名は50文字以内で入力してください"),
  username: z.string().min(3, "3文字以上").max(20, "20文字以内").regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ"),
  bio: z.string().max(300, "自己紹介は300文字以内").optional(),
  image: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
