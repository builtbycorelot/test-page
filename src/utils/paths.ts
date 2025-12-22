export function getBasePath(site?: URL | null): string {
  if (!site) return '';
  const pathname = site.pathname || '';
  if (!pathname || pathname === '/') return '';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function isExternal(path: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('tel:');
}

export function prefixWithBase(path: string, basePath: string): string {
  if (!path) return basePath || '/';
  if (isExternal(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!basePath) return normalizedPath;
  return `${basePath}${normalizedPath}`;
}

export function absoluteUrl(path: string, site?: URL | null): string {
  if (isExternal(path)) return path;
  if (site) {
    const basePath = getBasePath(site);
    return new URL(prefixWithBase(path, basePath), site).toString();
  }
  return prefixWithBase(path, '');
}
