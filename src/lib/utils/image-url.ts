export function getImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('/api/images/')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Local MinIO: http://localhost:PORT/BUCKET/KEY → /api/images/KEY
    const minioMatch = path.match(/^http:\/\/localhost:\d+\/[^/]+\/(.+)$/);
    if (minioMatch) return `/api/images/${minioMatch[1]}`;
    return path;
  }
  if (path.startsWith('/uploads/')) {
    return path.replace('/uploads/', '/api/images/');
  }
  if (!path.startsWith('/')) {
    return `/api/images/${path}`;
  }
  return path;
}
