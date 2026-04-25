"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function ThumbnailUploader({ value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok) {
        onChange(data.url);
        toast.success("サムネイルをアップロードしました");
      } else {
        toast.error(data.error || "アップロードに失敗しました");
      }
    } catch {
      toast.error("アップロードに失敗しました");
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-2">
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
      {value && (
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          <Image
            src={getImageUrl(value)!}
            alt="サムネイル"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
          <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => onChange("")}>
            削除
          </Button>
        </div>
      )}
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUploading ? "アップロード中..." : value ? "サムネイルを変更" : "サムネイルをアップロード"}
      </Button>
    </div>
  );
}
