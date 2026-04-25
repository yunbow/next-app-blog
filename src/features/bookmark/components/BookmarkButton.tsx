"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronDown } from "lucide-react";
import { toggleBookmarkAction, updateBookmarkAction } from "../server/bookmark-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Collection = {
  id: string;
  name: string;
};

type Props = {
  articleId: string;
  isBookmarked: boolean;
  bookmarkId?: string;
  currentCollectionId?: string | null;
  collections?: Collection[];
};

export function BookmarkButton({ 
  articleId, 
  isBookmarked: initialBookmarked,
  bookmarkId,
  currentCollectionId,
  collections = []
}: Props) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    const result = await toggleBookmarkAction(articleId);
    
    if (result.success) {
      setIsBookmarked(result.data.bookmarked);
      toast.success(result.data.bookmarked ? "ブックマークに追加しました" : "ブックマークを解除しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleMoveToCollection = async (collectionId: string | null) => {
    if (!bookmarkId) return;
    
    setIsLoading(true);
    const result = await updateBookmarkAction(bookmarkId, { collectionId });
    
    if (result.success) {
      toast.success(collectionId ? "コレクションに移動しました" : "コレクションから削除しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  // If not bookmarked or no collections, show simple button
  if (!isBookmarked || collections.length === 0) {
    return (
      <Button
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
      >
        <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
        {isBookmarked ? "保存済み" : "保存"}
      </Button>
    );
  }

  // If bookmarked and has collections, show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" disabled={isLoading}>
          <Bookmark className="h-4 w-4 mr-2 fill-current" />
          保存済み
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggle}>
          ブックマークを解除
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMoveToCollection(null)}>
          コレクションなし
        </DropdownMenuItem>
        {collections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() => handleMoveToCollection(collection.id)}
            className={currentCollectionId === collection.id ? "bg-accent" : ""}
          >
            {collection.name}
            {currentCollectionId === collection.id && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
