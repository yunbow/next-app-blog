/**
 * Convert image paths to use the API route
 * Transforms /uploads/... to /api/images/...
 */
export function getImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  
  // If already using API route, return as is
  if (path.startsWith('/api/images/')) {
    return path;
  }
  
  // If it's an absolute URL (http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Extract the path part if it's a localhost URL with /uploads/
    if (path.includes('/uploads/')) {
      const match = path.match(/\/uploads\/(.+)$/);
      if (match) {
        return `/api/images/${match[1]}`;
      }
    }
    return path;
  }
  
  // If it starts with /uploads/, convert to API route
  if (path.startsWith('/uploads/')) {
    return path.replace('/uploads/', '/api/images/');
  }
  
  // If it's just a filename, assume it's in uploads
  if (!path.startsWith('/')) {
    return `/api/images/${path}`;
  }
  
  return path;
}
