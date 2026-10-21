import type { z } from 'zod';
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
export async function readResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message : `Ошибка запроса (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return schema.parse(body);
}
/** Browser requests always use the same origin; token is per request, never global. */
export async function api<T>(path: string, schema: z.ZodType<T>, options: RequestInit = {}, token?: string): Promise<T> {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Invalid API path');
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  return readResponse(await fetch(`/api${path}`, { ...options, headers, cache: 'no-store' }), schema);
}
