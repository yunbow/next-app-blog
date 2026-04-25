"use client";

import MDPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";

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
          // すべてのリンクを新規タブで開く
          if (node.type === "element" && node.tagName === "a") {
            node.properties = {
              ...node.properties,
              target: "_blank",
              rel: "noopener noreferrer",
            };
          }
        }}
      />
    </div>
  );
}
