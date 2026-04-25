import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createArticleAction, 
  updateArticleAction, 
  deleteArticleAction,
  publishArticleAction 
} from "../server/article-actions";
import type { CreateArticleInput, UpdateArticleInput } from "../schema/article-schema";

// Query Keys
export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
  bySlug: (slug: string) => [...articleKeys.all, "slug", slug] as const,
};

// Mutations
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateArticleInput) => {
      const result = await createArticleAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateArticleInput }) => {
      const result = await updateArticleAction(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteArticleAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await publishArticleAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}
