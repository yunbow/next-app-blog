"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateBookmarkSchema,
  UpdateBookmarkSchema,
  type CreateBookmarkInput,
  type UpdateBookmarkInput,
} from "../schema/bookmark-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth, requireOwnership } from "@/lib/actions/action-helpers";

export async function createBookmarkAction(input: CreateBookmarkInput): Promise<ActionResult<{ id: string }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const validated = CreateBookmarkSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    // Check if bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: authResult.userId,
          articleId: validated.data.articleId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "既にブックマークされています" };
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: authResult.userId,
        articleId: validated.data.articleId,
        collectionId: validated.data.collectionId,
        note: validated.data.note,
      },
    });

    revalidatePath("/bookmarks");
    return { success: true, data: { id: bookmark.id } };
  });
}

export async function updateBookmarkAction(bookmarkId: string, input: UpdateBookmarkInput): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const validated = UpdateBookmarkSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    const ownershipResult = await requireOwnership(bookmark, authResult.userId, "userId");
    if (!ownershipResult.success) return ownershipResult;

    await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: validated.data,
    });

    revalidatePath("/bookmarks");
    return { success: true };
  });
}

export async function deleteBookmarkAction(bookmarkId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    const ownershipResult = await requireOwnership(bookmark, authResult.userId, "userId");
    if (!ownershipResult.success) return ownershipResult;

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    revalidatePath("/bookmarks");
    return { success: true };
  });
}

export async function toggleBookmarkAction(articleId: string): Promise<ActionResult<{ bookmarked: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: authResult.userId,
          articleId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      revalidatePath("/bookmarks");
      return { success: true, data: { bookmarked: false as boolean } };
    } else {
      await prisma.bookmark.create({
        data: {
          userId: authResult.userId,
          articleId,
        },
      });
      revalidatePath("/bookmarks");
      return { success: true, data: { bookmarked: true as boolean } };
    }
  });
}
