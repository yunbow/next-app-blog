import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileAction } from "../server/profile-actions";
import { changePasswordAction } from "../server/password-actions";
import type { UpdateProfileInput } from "../schema/profile-schema";

// Query Keys
export const profileKeys = {
  all: ["profile"] as const,
  detail: (id: string) => [...profileKeys.all, id] as const,
};

// Mutations
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const result = await updateProfileAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await changePasswordAction(formData);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
  });
}
