"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleReactionAction } from "../server/reaction-actions";
import { cn } from "@/lib/utils";

type ReactionType = "like" | "clap" | "sad" | "surprised";

const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: "👍", label: "いいね" },
  clap: { emoji: "👏", label: "拍手" },
  sad: { emoji: "😢", label: "悲しい" },
  surprised: { emoji: "😲", label: "驚き" },
};

type Props = {
  articleId: string;
  stats: Record<string, number>;
  userReactions: string[];
};

export function ReactionPicker({ articleId, stats, userReactions }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localStats, setLocalStats] = useState(stats);
  const [localUserReactions, setLocalUserReactions] = useState(userReactions);

  const handleToggle = (type: ReactionType) => {
    const isActive = localUserReactions.includes(type);

    // Optimistic update
    setLocalStats((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + (isActive ? -1 : 1),
    }));
    setLocalUserReactions((prev) =>
      isActive ? prev.filter((r) => r !== type) : [...prev, type]
    );

    startTransition(async () => {
      const result = await toggleReactionAction(articleId, type);
      if (!result.success) {
        // Revert on error
        setLocalStats(stats);
        setLocalUserReactions(userReactions);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {(Object.entries(REACTION_CONFIG) as [ReactionType, typeof REACTION_CONFIG[ReactionType]][]).map(
        ([type, config]) => {
          const isActive = localUserReactions.includes(type);
          const count = localStats[type] || 0;

          return (
            <Button
              key={type}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle(type)}
              disabled={isPending}
              className={cn("gap-1", isActive && "bg-primary/10 text-primary border-primary/30")}
            >
              <span>{config.emoji}</span>
              {count > 0 && <span className="text-xs">{count}</span>}
            </Button>
          );
        }
      )}
    </div>
  );
}
