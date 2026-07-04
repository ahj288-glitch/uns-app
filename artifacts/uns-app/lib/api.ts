// EXPO_PUBLIC_API_URL takes precedence (full URL for local dev, e.g. http://localhost:3000).
// EXPO_PUBLIC_DOMAIN is the Replit/production path (hostname-only → https assumed).
const _apiUrl = process.env["EXPO_PUBLIC_API_URL"];
const _domain = process.env["EXPO_PUBLIC_DOMAIN"];

export const API_BASE: string = _apiUrl
  ? `${_apiUrl}/api`
  : _domain
    ? `https://${_domain}/api`
    : "/api";

// ─── Internal sleep helper ────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── apiFetch — fetch with retry + structured error logging ──────────────────
// Retries ONLY on network-level failures (TypeError / no connection).
// HTTP 4xx/5xx are returned as-is — they are deliberate server responses.
// Backoff schedule: 1 s → 2 s (retries = 2 by default).
export async function apiFetch(
  url: string,
  init: RequestInit = {},
  retries = 2,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastError = err;
      const isNetworkError = err instanceof TypeError;

      console.error("[api] fetch error", {
        url,
        attempt: attempt + 1,
        maxAttempts: retries + 1,
        error: err instanceof Error ? err.message : String(err),
        isNetworkError,
        willRetry: isNetworkError && attempt < retries,
      });

      // Only retry network-level failures — not logic errors or aborts
      if (!isNetworkError || attempt === retries) throw err;

      await sleep(1000 * (attempt + 1)); // 1 s, 2 s
    }
  }

  throw lastError;
}

// ─── healthCheck — lightweight connectivity probe ─────────────────────────────
// Returns true if the API server responds OK. Used for offline recovery polling.
export async function healthCheck(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/health`, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
