"use client";

import MDPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  content: string;
};

export function MarkdownPreview({ content }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div data-color-mode={isDark ? "dark" : "light"}>
      <MDPreview
        source={content}
        style={{
          backgroundColor: "transparent",
          color: "inherit",
          fontFamily: "inherit",
        }}
        wrapperElement={{
          "data-color-mode": isDark ? "dark" : "light",
        }}
        rehypeRewrite={(node, index, parent) => {
          if (node.type === "element" && node.tagName === "a") {
            node.properties = {
              ...node.properties,
              target: "_blank",
              rel: "noopener noreferrer",
            };
          }
          // /uploads/ パスを /api/images/ 経由に変換（standalone モードでの静的配信非対応を回避）
          if (node.type === "element" && node.tagName === "img") {
            const src = node.properties?.src as string | undefined;
            const converted = getImageUrl(src);
            if (converted && converted !== src) {
              node.properties = { ...node.properties, src: converted };
            }
          }
        }}
      />
    </div>
  );
}
