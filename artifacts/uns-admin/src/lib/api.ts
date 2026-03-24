import { useAdminAuth } from "@/hooks/useAdminAuth";
import { triggerUnauthorized } from "@/lib/authSession";

type FetchOptions = RequestInit & { skipAuth?: boolean };

export function useFetchWithAuth() {
  const { getAuthHeader } = useAdminAuth();

  async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuth = false, headers: extraHeaders, ...rest } = options;

    const authHeader = skipAuth ? {} : getAuthHeader();

    const res = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...(extraHeaders as Record<string, string> | undefined),
      },
    });

    if (res.status === 401) {
      triggerUnauthorized();
      throw new Error("Session expired. Please log in again.");
    }

    return res;
  }

  return { fetchWithAuth };
}
