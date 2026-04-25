import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

export const remarkPlugins = [remarkGfm];
export const rehypePlugins = [rehypeSanitize, rehypeHighlight];
