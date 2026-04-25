"use client";

import { useState } from "react";
import { diffLines, diffWords } from "diff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { History, RotateCcw, FileText, FileDiff, Info } from "lucide-react";
import { restoreVersionAction } from "../server/version-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Version = {
  id: string;
  version: number;
  title: string;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  changeNote: string | null;
  createdAt: Date;
};

type Props = {
  articleId: string;
  versions: Version[];
  currentVersion: {
    title: string;
    content: string;
  };
};

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const changes = diffLines(oldText, newText);

  return (
    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
      {changes.map((part, i) => {
        if (part.added) {
          return (
            <span key={i} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 block">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={i} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 block line-through">
              {part.value}
            </span>
          );
        }
        return <span key={i} className="block">{part.value}</span>;
      })}
    </pre>
  );
}

function TitleDiff({ oldTitle, newTitle }: { oldTitle: string; newTitle: string }) {
  if (oldTitle === newTitle) {
    return <h3 className="text-xl font-bold">{newTitle}</h3>;
  }

  const changes = diffWords(oldTitle, newTitle);

  return (
    <h3 className="text-xl font-bold">
      {changes.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added && "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
            part.removed && "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 line-through",
          )}
        >
          {part.value}
        </span>
      ))}
    </h3>
  );
}

function ChangeSummary({ version, compareWith }: { version: Version; compareWith: { title: string; content: string } }) {
  const titleChanged = version.title !== compareWith.title;
  const contentLines = diffLines(version.content, compareWith.content);
  const added = contentLines.filter(c => c.added).reduce((sum, c) => sum + (c.count ?? 0), 0);
  const removed = contentLines.filter(c => c.removed).reduce((sum, c) => sum + (c.count ?? 0), 0);

  return (
    <div className="text-xs space-y-0.5">
      {titleChanged && <p>タイトル変更あり</p>}
      {(added > 0 || removed > 0) ? (
        <p>
          {added > 0 && <span className="text-green-600 dark:text-green-400">+{added}行</span>}
          {added > 0 && removed > 0 && " / "}
          {removed > 0 && <span className="text-red-600 dark:text-red-400">-{removed}行</span>}
        </p>
      ) : (
        !titleChanged && <p>変更なし</p>
      )}
    </div>
  );
}

export function VersionHistory({ articleId, versions, currentVersion }: Props) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async (versionId: string) => {
    if (!confirm("このバージョンに復元しますか？現在の内容は新しいバージョンとして保存されます。")) {
      return;
    }

    setIsRestoring(true);
    const result = await restoreVersionAction(articleId, versionId);

    if (result.success) {
      toast.success("バージョンを復元しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsRestoring(false);
  };

  // 各バージョンの比較対象を取得（1つ前のバージョン or 現在の内容）
  function getCompareTarget(index: number): { title: string; content: string } {
    if (index === 0) {
      return currentVersion;
    }
    const prev = versions[index - 1];
    return { title: prev.title, content: prev.content };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          バージョン履歴
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">バージョン履歴はありません</p>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => {
              const compareTarget = getCompareTarget(index);

              return (
                <div
                  key={version.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">v{version.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(version.createdAt, "yyyy/MM/dd HH:mm")}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <ChangeSummary version={version} compareWith={compareTarget} />
                            {version.changeNote && (
                              <p className="mt-1 border-t pt-1">{version.changeNote}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm font-medium truncate">{version.title}</p>
                    {version.changeNote && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {version.changeNote}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="プレビュー・差分表示">
                          <FileDiff className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>バージョン {version.version}</DialogTitle>
                          <DialogDescription>
                            {format(version.createdAt, "yyyy年MM月dd日 HH:mm")}
                            {version.changeNote && ` — ${version.changeNote}`}
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="diff" className="mt-4">
                          <TabsList>
                            <TabsTrigger value="diff" className="gap-1">
                              <FileDiff className="h-4 w-4" />
                              差分
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="gap-1">
                              <FileText className="h-4 w-4" />
                              全文
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="diff" className="mt-4 space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">タイトル</p>
                              <TitleDiff oldTitle={version.title} newTitle={compareTarget.title} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">本文</p>
                              <div className="border rounded-md p-4 bg-muted/30 overflow-x-auto">
                                <DiffView oldText={version.content} newText={compareTarget.content} />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <span className="inline-block w-3 h-3 bg-red-100 dark:bg-red-900/40 border mr-1 align-middle" />
                              このバージョンから削除
                              <span className="inline-block w-3 h-3 bg-green-100 dark:bg-green-900/40 border ml-3 mr-1 align-middle" />
                              次のバージョンで追加
                            </p>
                          </TabsContent>
                          <TabsContent value="preview" className="mt-4">
                            <h3 className="text-xl font-bold mb-4">{version.title}</h3>
                            <div className="prose max-w-none dark:prose-invert">
                              <pre className="whitespace-pre-wrap">{version.content}</pre>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.id)}
                      disabled={isRestoring}
                      title="このバージョンに復元"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
