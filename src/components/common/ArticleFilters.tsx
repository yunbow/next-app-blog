"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  categories?: { id: string; name: string; slug: string }[];
  showCategoryFilter?: boolean;
  basePath: string;
};

export function ArticleFilters({ categories = [], showCategoryFilter = true, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("q", search);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="記事を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {showCategoryFilter && categories.length > 0 && (
        <Select
          value={searchParams.get("category") || "all"}
          onValueChange={(value) => updateFilters("category", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="カテゴリ" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={searchParams.get("sort") || "latest"}
        onValueChange={(value) => updateFilters("sort", value)}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <SelectValue placeholder="並び替え" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">新着順</SelectItem>
          <SelectItem value="oldest">古い順</SelectItem>
          <SelectItem value="popular">人気順</SelectItem>
          <SelectItem value="title">タイトル順</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
