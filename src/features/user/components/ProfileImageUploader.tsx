"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  currentImage: string | null;
  userName: string | null;
  onUpload: (url: string) => void;
};

export function ProfileImageUploader({ currentImage, userName, onUpload }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("JPG, PNG, GIF, WebPのみアップロード可能です");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok) {
        setPreviewUrl(data.url);
        onUpload(data.url);
        toast.success("画像をアップロードしました");
      } else {
        toast.error(data.error || "アップロードに失敗しました");
      }
    } catch {
      toast.error("アップロードに失敗しました");
    }
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={getImageUrl(previewUrl)} />
        <AvatarFallback className="text-4xl">
          {userName?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            アップロード中...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            画像を変更
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, GIF, WebP (最大5MB)
      </p>
    </div>
  );
}
