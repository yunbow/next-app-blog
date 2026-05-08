"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createCollectionAction, updateCollectionAction } from "../server/collection-actions";
import { z } from "zod";
import { CreateCollectionSchema, type CreateCollectionInput } from "../schema/bookmark-schema";

type FormValues = z.input<typeof CreateCollectionSchema>;

type Props = {
  mode: "create" | "edit";
  collectionId?: string;
  initialData?: {
    name: string;
    description?: string;
    isPublic: boolean;
  };
};

export function CollectionForm({ mode, collectionId, initialData }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, CreateCollectionInput>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      isPublic: initialData?.isPublic ?? false,
    },
  });

  const isPublic = watch("isPublic");

  const onSubmit = async (data: CreateCollectionInput) => {
    const result =
      mode === "create"
        ? await createCollectionAction(data)
        : await updateCollectionAction(collectionId!, data);

    if (result.success) {
      toast.success(mode === "create" ? "コレクションを作成しました" : "コレクションを更新しました");
      router.push("/bookmarks");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">コレクション名</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="例: お気に入りの技術記事"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明（任意）</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="このコレクションについて..."
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isPublic">公開設定</Label>
          <p className="text-sm text-muted-foreground">
            公開すると他のユーザーがこのコレクションを閲覧できます
          </p>
        </div>
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setValue("isPublic", checked)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : mode === "create" ? "作成" : "更新"}
        </Button>
      </div>
    </form>
  );
}
