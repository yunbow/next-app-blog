import { z } from "zod";

export const UsernameCheckSchema = z.object({
  username: z
    .string()
    .min(3, "ユーザーIDは3文字以上で入力してください")
    .max(20, "ユーザーIDは20文字以内で入力してください")
    .regex(/^[a-zA-Z0-9_]+$/, "ユーザーIDは英数字とアンダースコアのみ使用できます"),
});

export type UsernameCheckInput = z.infer<typeof UsernameCheckSchema>;
