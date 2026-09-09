/** Public URLs need the repository prefix on GitHub project Pages. */
export function sitePath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}${path}`;
}
