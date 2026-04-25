"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils/image-url";

type ImageData = {
  url: string;
  type: "thumbnail" | "content";
  order: number;
};

type Props = {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
  onInsert?: (markdown: string) => void;
};

export function ImageUpload({ images, onChange, onInsert }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const thumbnailImage = images.find((img) => img.type === "thumbnail");
  const contentImages = images.filter((img) => img.type === "content").sort((a, b) => a.order - b.order);

  const uploadImage = async (file: File, type: "thumbnail" | "content") => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "アップロードに失敗しました");
      }

      const data = await response.json();
      
      if (type === "thumbnail") {
        // サムネイルは1つだけ
        const newImages = images.filter((img) => img.type !== "thumbnail");
        onChange([...newImages, { url: data.url, type: "thumbnail", order: 0 }]);
      } else {
        // コンテンツ画像は複数可
        const maxOrder = Math.max(0, ...contentImages.map((img) => img.order));
        onChange([...images, { url: data.url, type: "content", order: maxOrder + 1 }]);
      }

      toast.success("画像をアップロードしました");
    } catch {
      toast.error("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "content") => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file, type);
    }
    e.target.value = "";
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img.url !== url));
  };

  const insertImageMarkdown = (url: string) => {
    const markdown = `![画像](${url})`;
    if (onInsert) {
      onInsert(markdown);
      toast.success("画像をエディタに挿入しました");
    } else {
      navigator.clipboard.writeText(markdown).then(() => {
        toast.success("クリップボードにコピーしました");
      }).catch(() => {
        toast.error("コピーに失敗しました");
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* サムネイル画像 */}
      <div className="space-y-2">
        <Label>サムネイル画像</Label>
        <div className="flex items-start gap-4">
          {thumbnailImage ? (
            <div className="relative group">
              <img
                src={getImageUrl(thumbnailImage.url)}
                alt="サムネイル"
                className="w-48 h-32 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeImage(thumbnailImage.url)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-48 h-32 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
          <div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "thumbnail")}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {thumbnailImage ? "変更" : "アップロード"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, GIF, WebP (最大5MB)
            </p>
          </div>
        </div>
      </div>

      {/* 記事内画像 */}
      <div className="space-y-2">
        <Label>記事内画像</Label>
        <div className="space-y-4">
          {contentImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {contentImages.map((img) => (
                <div key={img.url} className="relative group">
                  <img
                    src={getImageUrl(img.url)}
                    alt="記事内画像"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => insertImageMarkdown(img.url)}
                    >
                      挿入
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.url)}
                      className="p-2 bg-destructive text-destructive-foreground rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <input
              ref={contentInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "content")}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => contentInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              画像を追加
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              アップロード後、画像にカーソルを合わせて「挿入」ボタンをクリックすると、エディタのカーソル位置にMarkdown形式で挿入されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
