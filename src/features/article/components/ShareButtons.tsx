"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: Props) {
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  const shareToX = () => {
    const text = encodeURIComponent(title);
    const shareUrl = encodeURIComponent(fullUrl);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${shareUrl}`, "_blank");
  };

  const shareToFacebook = () => {
    const shareUrl = encodeURIComponent(fullUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank");
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(fullUrl);
    toast.success("URLをコピーしました");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={shareToX}>
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X
      </Button>
      <Button variant="outline" size="sm" onClick={shareToFacebook}>
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </Button>
      <Button variant="outline" size="sm" onClick={copyUrl}>
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
        URLコピー
      </Button>
    </div>
  );
}
