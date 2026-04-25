"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createCommentAction, updateCommentAction, deleteCommentAction } from "../server/comment-actions";
import { Pagination } from "@/components/common/Pagination";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils/image-url";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null; username: string };
  replies?: Comment[];
};

type Props = {
  articleId: string;
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  articleSlug: string;
};

export function CommentSection({ articleId, comments, currentPage, totalPages, articleSlug }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    const result = await createCommentAction({ content, articleId });
    if (result.success) {
      setContent("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;
    setIsLoading(true);
    const result = await updateCommentAction(commentId, { content: editContent });
    if (result.success) {
      setEditingId(null);
      setEditContent("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    const result = await deleteCommentAction(commentId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">コメント ({comments.length})</h3>

      {session?.user && (
        <div className="mb-6">
          <Textarea
            placeholder="コメントを書く..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleSubmit} disabled={isLoading || !content.trim()} size="sm">
            {isLoading ? "送信中..." : "コメントする"}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Link href={`/users/${comment.author.id}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={getImageUrl(comment.author.image)} />
                <AvatarFallback>{comment.author.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/users/${comment.author.id}`} className="font-medium text-sm hover:underline">
                  {comment.author.name || "名前未設定"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {format(comment.createdAt, "yyyy/MM/dd HH:mm")}
                </span>
              </div>
              {editingId === comment.id ? (
                <div>
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="mb-2" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(comment.id)} disabled={isLoading}>保存</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>キャンセル</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  {session?.user?.id === comment.author.id && (
                    <div className="flex gap-2 mt-1">
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>編集</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-destructive" onClick={() => handleDelete(comment.id)}>削除</Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/articles/${articleSlug}`}
        pageParam="commentPage"
      />
    </div>
  );
}
