"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UpdateProfileSchema, UpdateProfileInput } from "../schema/profile-schema";
import { updateProfileAction } from "../server/profile-actions";
import { ProfileImageUploader } from "./ProfileImageUploader";
import { toast } from "sonner";

type Props = {
  user: { name: string | null; username: string; bio: string | null; image: string | null };
};

export function ProfileEditForm({ user }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username,
      bio: user.bio || "",
      image: user.image || "",
    },
  });

  const handleImageUpload = (url: string) => {
    setValue("image", url);
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    const result = await updateProfileAction(data);
    if (result.success) {
      toast.success("プロフィールを更新しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label>プロフィール画像</Label>
        <ProfileImageUploader
          currentImage={user.image}
          userName={user.name}
          onUpload={handleImageUpload}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">ユーザー名</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">
          ユーザーID
          <span className="ml-2 text-xs text-muted-foreground">（@の後に表示されます）</span>
        </Label>
        <Input id="username" {...register("username")} />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">自己紹介</Label>
        <Textarea id="bio" {...register("bio")} rows={4} />
        {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "更新中..." : "更新する"}
      </Button>
    </form>
  );
}
