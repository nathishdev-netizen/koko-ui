/**
 * The single HTTP client. This is the one file in the codebase permitted to
 * call fetch() (enforced by eslint.config.mjs).
 *
 * Mock/real selection is per-resource, not global, so the backend team can ship
 * endpoints one at a time: set NEXT_PUBLIC_API_MODE=live and then opt each
 * resource in via API_LIVE_RESOURCES. Until a resource is listed, it serves
 * from lib/api/mocks/.
 */

export type ApiResource =
  | 'products'
  | 'collections'
  | 'bundles'
  | 'blog'
  | 'pricing'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'wishlist'
  | 'subscriptions'
  | 'reviews'
  | 'referral'
  | 'siteConfig'
  | 'promotions'
  | 'comments'
  | 'contact';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/**
 * Comma-separated resource names that should hit the real backend.
 * `*` switches everything live. Empty (the default) keeps everything mocked.
 */
const liveResources = new Set(
  (process.env.NEXT_PUBLIC_API_LIVE_RESOURCES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

export function isLive(resource: ApiResource): boolean {
  return liveResources.has('*') || liveResources.has(resource);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type RequestOptions = {
  readonly method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly searchParams?: Record<string, string | number | undefined>;
  /** ISR revalidation seconds. Omit for default; 0 for no cache. */
  readonly revalidate?: number;
  /** Cache tags for on-demand revalidation from Frappe webhooks. */
  readonly tags?: readonly string[];
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, searchParams, revalidate, tags } = options;

  const url = new URL(`${API_BASE}/api/v1${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    // Identity comes from the Frappe httpOnly session cookie, never from a
    // caller-supplied ID in the body or query.
    credentials: 'include',
    next: {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags ? { tags: [...tags] } : {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `${method} ${path} failed with ${response.status}`,
      response.status,
      path,
    );
  }

  return (await response.json()) as T;
}
