/**
 * Client-side helper to call the backend through the same-origin proxy.
 *
 * This avoids relying on NEXT_PUBLIC_API_BASE_URL inside browser code and
 * prevents CORS / "not JSON" issues when the backend URL changes.
 *
 * Usage:
 * - backendProxyPath("/api/getalldata") -> "/api/backend/api/getalldata"
 */

export function backendProxyPath(path: string): string {
  if (!path) return "/api/backend";
  return `/api/backend${path.startsWith("/") ? path : `/${path}`}`;
}

