/** Server-only transport configuration; never import into a client component. */
export function backendOrigin(): string {
  const configured = process.env.BACKEND_URL;
  if (!configured && process.env.NODE_ENV === 'production') throw new Error('BACKEND_URL is required');
  const url = new URL(configured || 'http://127.0.0.1:3000');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password
    || url.pathname !== '/' || url.search || url.hash) throw new Error('BACKEND_URL must be an HTTP origin without /api or credentials');
  return url.origin;
}
export function backendApiUrl(path: string): string { return `${backendOrigin()}/api${path}`; }
