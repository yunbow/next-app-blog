"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateCollectionSchema,
  UpdateCollectionSchema,
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from "../schema/bookmark-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth, requireOwnership } from "@/lib/actions/action-helpers";

export async function createCollectionAction(input: CreateCollectionInput): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const validated = CreateCollectionSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await prisma.bookmarkCollection.create({
      data: {
        ...validated.data,
        userId: authResult.userId,
      },
    });

    revalidatePath("/bookmarks");
    return { success: true };
  });
}

export async function updateCollectionAction(collectionId: string, input: UpdateCollectionInput): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const validated = UpdateCollectionSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const collection = await prisma.bookmarkCollection.findUnique({
      where: { id: collectionId },
    });

    const ownershipResult = await requireOwnership(collection, authResult.userId, "userId");
    if (!ownershipResult.success) return ownershipResult;

    await prisma.bookmarkCollection.update({
      where: { id: collectionId },
      data: validated.data,
    });

    revalidatePath("/bookmarks");
    return { success: true };
  });
}

export async function deleteCollectionAction(collectionId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const collection = await prisma.bookmarkCollection.findUnique({
      where: { id: collectionId },
    });

    const ownershipResult = await requireOwnership(collection, authResult.userId, "userId");
    if (!ownershipResult.success) return ownershipResult;

    await prisma.bookmarkCollection.delete({
      where: { id: collectionId },
    });

    revalidatePath("/bookmarks");
    return { success: true };
  });
}
