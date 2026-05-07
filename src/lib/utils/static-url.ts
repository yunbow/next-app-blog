export function getStaticUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_STATIC_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/static/${filename}`;
}
