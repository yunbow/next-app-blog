import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createCommentAction, 
  updateCommentAction, 
  deleteCommentAction 
} from "../server/comment-actions";
import type { CreateCommentInput, UpdateCommentInput } from "../schema/comment-schema";

// Query Keys
export const commentKeys = {
  all: ["comments"] as const,
  byArticle: (articleId: string) => [...commentKeys.all, "article", articleId] as const,
  detail: (id: string) => [...commentKeys.all, "detail", id] as const,
};

// Mutations
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const result = await createCommentAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.byArticle(variables.articleId) 
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCommentInput }) => {
      const result = await updateCommentAction(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.detail(variables.id) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCommentAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
