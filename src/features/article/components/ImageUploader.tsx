"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onUpload: (url: string) => void;
};

export function ImageUploader({ onUpload }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
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
      <p className="text-sm text-muted-foreground mb-2">
        ドラッグ&ドロップまたはクリックして画像をアップロード
      </p>
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUploading ? "アップロード中..." : "ファイルを選択"}
      </Button>
      <p className="text-xs text-muted-foreground mt-2">JPG, PNG, GIF, WebP (最大5MB)</p>
    </div>
  );
}
