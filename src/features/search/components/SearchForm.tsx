"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialKeyword?: string;
  initialTag?: string;
};

export function SearchForm({ initialKeyword = "", initialTag = "" }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="キーワードで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">検索</Button>
    </form>
  );
}
