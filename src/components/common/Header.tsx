"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlQ = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [prev, setPrev] = useState({ urlQ, pathname });

  // Sync the input when the URL changes (e.g. user clicks a result that
  // updates ?q=, or navigates away from /search). Done during render via
  // the prev-value pattern so we don't write state inside an effect.
  if (prev.urlQ !== urlQ || prev.pathname !== pathname) {
    setPrev({ urlQ, pathname });
    if (urlQ) {
      setSearchQuery(urlQ);
    } else if (pathname !== "/search") {
      setSearchQuery("");
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-md">
      <Input
        placeholder="記事を検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
    </form>
  );
}

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4 pl-[20px]">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Blog</span>
        </Link>

        <Suspense fallback={
          <form className="flex-1 max-w-md">
            <Input placeholder="記事を検索..." className="w-full" disabled />
          </form>
        }>
          <SearchForm />
        </Suspense>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {!session && (
            <>
              <Link href="/login">
                <Button variant="ghost">ログイン</Button>
              </Link>
              <Link href="/register">
                <Button>新規登録</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
