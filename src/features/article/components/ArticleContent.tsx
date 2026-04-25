"use client";

import { MarkdownPreview } from "./MarkdownPreview";

type Props = {
  content: string;
};

export function ArticleContent({ content }: Props) {
  return (
    <article className="py-4">
      <MarkdownPreview content={content} />
    </article>
  );
}
