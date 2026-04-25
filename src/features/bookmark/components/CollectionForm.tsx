"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createCollectionAction, updateCollectionAction } from "../server/collection-actions";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    isPublic: initialData?.isPublic || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = mode === "create"
      ? await createCollectionAction(formData)
      : await updateCollectionAction(collectionId!, formData);

    if (result.success) {
      toast.success(mode === "create" ? "コレクションを作成しました" : "コレクションを更新しました");
      router.push("/bookmarks");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">コレクション名</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例: お気に入りの技術記事"
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明（任意）</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="このコレクションについて..."
          rows={3}
          maxLength={500}
        />
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
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
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
