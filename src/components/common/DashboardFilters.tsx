"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

type Props = {
  basePath: string;
};

export function DashboardFilters({ basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="記事を検索..."
            defaultValue={searchParams.get("q") || ""}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      
      <Select
        value={searchParams.get("sort") || "latest"}
        onValueChange={(value) => updateFilters("sort", value)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <SelectValue placeholder="並び替え" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">新着順</SelectItem>
          <SelectItem value="oldest">古い順</SelectItem>
          <SelectItem value="title">タイトル順</SelectItem>
          <SelectItem value="published">公開日順</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
