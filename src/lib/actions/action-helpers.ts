import "server-only";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import type { ActionResult, ActionFailure } from "@/lib/types/action-result";

/**
 * 認証チェックヘルパー
 * セッションが存在しない場合は ActionFailure を返す
 */
export async function requireAuth(): Promise<
  | { success: true; session: { user: { id: string; email?: string | null; username?: string; isAdmin?: boolean } }; userId: string }
  | ActionFailure
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "認証が必要です" };
  }
  return { success: true, session: session as { user: { id: string; email?: string | null; username?: string; isAdmin?: boolean } }, userId: session.user.id };
}

/**
 * リソース所有者チェックヘルパー（IDOR防止）
 * userId または authorId フィールドで所有者を確認
 */
export async function requireOwnership<T extends Record<string, unknown>>(
  resource: T | null,
  userId: string,
  ownerField: keyof T = "authorId" as keyof T,
): Promise<
  | { success: true; resource: T }
  | ActionFailure
> {
  if (!resource) {
    return { success: false, error: "リソースが見つかりません" };
  }
  if (resource[ownerField] !== userId) {
    return { success: false, error: "このリソースへのアクセス権限がありません" };
  }
  return { success: true, resource };
}

/**
 * エラーをユーザー向けメッセージに変換
 */
export function handleActionError(error: unknown): string {
  // Zodバリデーションエラー
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "入力内容に誤りがあります";
  }

  // Prismaエラー（動的インポートを避けるためコードベースで判定）
  if (
    error instanceof Error &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    switch (code) {
      case "P2002":
        return "既に登録されているデータです";
      case "P2025":
        return "対象のデータが見つかりません";
      case "P2003":
        return "関連するデータが存在するため、操作を完了できません";
      default:
        break;
    }
  }

  // 一般エラー
  if (error instanceof Error) {
    logger.error({ error: { name: error.name, message: error.message, stack: error.stack } }, "Action error");
  } else {
    logger.error({ error }, "Unknown action error");
  }

  return "処理中にエラーが発生しました";
}

/**
 * Server Action ラッパー
 * try-catch のボイラープレートを削減し、統一的なエラーハンドリングを提供
 */
export async function withAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    return { success: false, error: handleActionError(error) };
  }
}
