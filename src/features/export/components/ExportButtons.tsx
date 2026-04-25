"use client";

import { Button } from "@/components/ui/button";
import { exportArticleAction } from "../server/export-actions";
import { toast } from "sonner";

type Props = { articleId: string };

export function ExportButtons({ articleId }: Props) {
  const handleExport = async (format: "json" | "markdown") => {
    const result = await exportArticleAction(articleId, format);
    if (result.success) {
      const blob = new Blob([result.data.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("エクスポートしました");
    } else {
      toast.error(result.error || "エクスポートに失敗しました");
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("markdown")}>Markdownでエクスポート</Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")}>JSONでエクスポート</Button>
    </div>
  );
}
